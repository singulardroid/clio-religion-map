"""Shared locale field helpers for religion-map data pipeline."""

from __future__ import annotations

from copy import deepcopy
from typing import Any

LOCALE_CODES = ("en", "ru")
LOCALIZABLE_EVENT_FIELDS = (
    "statement",
    "description",
    "name",
    "quote",
    "period",
    "religion",
    "source_ref",
    "chapter_title",
    "precise_location",
    "era",
)
REQUIRED_EN_FIELDS = ("quote", "source_ref")


def _pick_localizable(event: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for key in LOCALIZABLE_EVENT_FIELDS:
        val = event.get(key)
        if isinstance(val, str) and val.strip():
            out[key] = val.strip()
    legacy_name = event.get("event_name")
    if "name" not in out and isinstance(legacy_name, str) and legacy_name.strip():
        out["name"] = legacy_name.strip()
    legacy_description = event.get("event_description")
    if "description" not in out and isinstance(legacy_description, str) and legacy_description.strip():
        out["description"] = legacy_description.strip()
    if "statement" not in out and "description" in out:
        out["statement"] = out["description"]
    legacy_concept = event.get("concept")
    has_display = any(out.get(key) for key in ("statement", "description", "quote", "name"))
    if not has_display and isinstance(legacy_concept, str) and legacy_concept.strip():
        out["name"] = legacy_concept.strip().replace("-", " ")
        out["statement"] = out["name"]
    return out


def event_has_locales(event: dict) -> bool:
    loc = event.get("locales")
    return isinstance(loc, dict) and bool(loc)


def wrap_legacy_event_to_locales(event: dict) -> dict:
    """Copy event; move string fields into locales.ru; strip from top level."""
    out = deepcopy(event)
    ru_payload = _pick_localizable(out)
    for key in LOCALIZABLE_EVENT_FIELDS:
        out.pop(key, None)

    locales: dict[str, dict[str, str]] = {"ru": ru_payload, "en": {}}
    out["locales"] = locales

    conns = out.get("connections") or []
    normalized = []
    for c in conns:
        if not isinstance(c, dict):
            continue
        nc = dict(c)
        lab = nc.get("label")
        if isinstance(lab, str):
            nc["label"] = {"ru": lab, "en": lab}
        elif isinstance(lab, dict):
            nc["label"] = {
                "ru": lab.get("ru") or lab.get("en") or "",
                "en": lab.get("en") or lab.get("ru") or "",
            }
        normalized.append(nc)
    out["connections"] = normalized
    return out


def ensure_locales_shape(event: dict) -> dict:
    if event_has_locales(event):
        loc = event.setdefault("locales", {})
        ru = loc.setdefault("ru", {})
        if not isinstance(ru, dict):
            ru = {}
            loc["ru"] = ru
        en = loc.setdefault("en", {})
        if not isinstance(en, dict):
            loc["en"] = {}

        # Some phase-1/early phase-2 records already have a locales object
        # containing only metadata such as precise_location. Keep those fields,
        # but backfill missing RU display text from legacy top-level fields so
        # the locale filter does not hide otherwise valid events.
        for key, val in _pick_localizable(event).items():
            ru.setdefault(key, val)
        return event
    return wrap_legacy_event_to_locales(event)


def locale_block(event: dict, code: str) -> dict[str, str]:
    loc = event.get("locales") or {}
    block = loc.get(code) or {}
    return block if isinstance(block, dict) else {}


def _locale_display_complete(block: dict, ru_block: dict) -> bool:
    """Locale is complete when every present RU field has a non-empty EN counterpart."""
    if not (block.get("statement") or block.get("description") or block.get("quote")):
        return False
    if (ru_block.get("statement") or ru_block.get("description")) and not (
        block.get("statement") or block.get("description")
    ):
        return False
    if (ru_block.get("quote") or "").strip() and not (block.get("quote") or "").strip():
        return False
    if (ru_block.get("source_ref") or "").strip() and not (block.get("source_ref") or "").strip():
        return False
    return True


def en_is_complete(event: dict) -> bool:
    ru = locale_block(event, "ru")
    en = locale_block(event, "en")
    display_keys = ("statement", "description", "quote")
    if not any((ru.get(k) or "").strip() for k in display_keys):
        return True
    return _locale_display_complete(en, ru)


def en_has_malformed_partial(event: dict) -> bool:
    """Strict compile should reject partial EN that would render as unsourced/misleading."""
    en = locale_block(event, "en")
    has_statement = bool((en.get("statement") or en.get("description") or "").strip())
    has_quote = bool((en.get("quote") or "").strip())
    has_source_ref = bool((en.get("source_ref") or "").strip())
    if has_quote and not has_source_ref:
        return True
    if has_source_ref and not has_statement:
        return True
    return False


def ru_is_complete(event: dict) -> bool:
    return _locale_display_complete(locale_block(event, "ru"), locale_block(event, "ru"))


def connection_label(conn: dict, code: str) -> str:
    lab = conn.get("label")
    if isinstance(lab, dict):
        return (lab.get(code) or lab.get("en") or lab.get("ru") or "").strip()
    if isinstance(lab, str):
        return lab.strip()
    return ""


def flatten_event_for_locale(event: dict, code: str) -> dict:
    """Merge stable fields + locale block for SPA backward compatibility."""
    out = deepcopy(event)
    block = locale_block(out, code)
    for key, val in block.items():
        if val:
            out[key] = val
    conns = out.get("connections") or []
    flat_conns = []
    for c in conns:
        if not isinstance(c, dict):
            continue
        fc = dict(c)
        fc["label"] = connection_label(c, code)
        flat_conns.append(fc)
    out["connections"] = flat_conns
    out["_active_locale"] = code
    return out
