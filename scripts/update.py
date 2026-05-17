import json
import os
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

events_data = {
  "events": [
    {
      "concept_id": "earth-goddess-personification-china",
      "period": "II в. до н. э.",
      "era": "Эллинистический период",
      "territory": "Китай",
      "religion": "Древнекитайская религия",
      "statement": "Персонификация почвы в образе Великой Богини Земли приходит на смену местным культам божеств почвы.",
      "is_first_occurrence": True,
      "first_occurrence_type": "explicit",
      "quote": "«персонификация почвы в образе Великой Богини Земли была относительно поздним явлением: по всей видимости, этот феномен имел место в начале династии Хань, т. е. во II в. до н. э.»",
      "source_ref": "Том 2, Глава 18, § 128",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Middle Yellow River Valley",
        "year_from": -200,
        "year_to": -100,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "alchemy-gold-making-prohibition",
      "period": "144 г. до н. э.",
      "era": "Эллинистический период",
      "territory": "Китай",
      "religion": "Древнекитайская религия",
      "statement": "Издан первый императорский указ, запрещающий алхимическое изготовление золота под страхом публичной казни.",
      "is_first_occurrence": True,
      "first_occurrence_type": "explicit",
      "quote": "«первый документ, касающийся алхимии, был издан в 144 г. до н. э.; императорский указ того года гласил: всякого человека, уличенного в изготовлении золота, подвергать публичной казни»",
      "source_ref": "Том 2, Глава 18, § 134",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Middle Yellow River Valley",
        "year_from": -144,
        "year_to": -144,
        "mapping_confidence": "high",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "elixir-and-gold-alchemy-unification",
      "period": "IV в. н. э.",
      "era": "Поздняя античность",
      "territory": "Китай",
      "religion": "Даосизм",
      "statement": "Концепции эликсира бессмертия и алхимического изготовления золота впервые объединяются в единую систему.",
      "is_first_occurrence": True,
      "first_occurrence_type": "explicit",
      "quote": "«Две концепции — эликсира и алхимического изготовления золота — впервые объединились в Китае в IV н. э.»",
      "source_ref": "Том 2, Глава 18, § 134",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Middle Yellow River Valley",
        "year_from": 300,
        "year_to": 400,
        "mapping_confidence": "high",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "terramare-culture-copper-cremation",
      "period": "II тысячелетие до н. э.",
      "era": "Бронзовый век",
      "territory": "Рим",
      "precise_location": "Северная Италия",
      "religion": "Доисторические верования",
      "statement": "Ариафонные народы, владеющие выплавкой меди и кремирующие умерших, основывают культуру Террамара.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«Первая волна ариафонных народов, владевших техникой выплавки меди и придерживавшихся обычая кремировать умерших, во II-м тысячелетии до н. э. обживала Северную Италию. Они основали культуру 'Под названием «Террамара»»",
      "source_ref": "Том 2, Глава 18, § 161",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Latium",
        "year_from": -2000,
        "year_to": -1000,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "villanovan-culture-iron-cremation",
      "period": "конец II тыс. до н. э. — начало I тыс. до н. э.",
      "era": "Железный век",
      "territory": "Рим",
      "precise_location": "Лациум",
      "religion": "Доисторические верования",
      "statement": "Племена культуры вилланов приносят использование железа и обычай захоронения урн с пеплом в глубоких ямах.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«К концу II тысячелетия сюда пришла вторая волна — племена культуры вилланов, использовавших железо и хоронивших керамические урны с пеплом покойников в глубоких ямах. В начале I тысячелетия в Лациуме преобладала культура вилланов.»",
      "source_ref": "Том 2, Глава 18, § 161",
      "is_dead_end": False,
      "connections": [
        { "target_concept_id": "terramare-culture-copper-cremation", "label": "Смена культурных волн" }
      ],
      "references": [],
      "seshat": {
        "nga_name": "Latium",
        "year_from": -1200,
        "year_to": -900,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "winter-prodigies-expiation-rome",
      "period": "218 г. до н. э.",
      "era": "Эллинистический период",
      "territory": "Рим",
      "religion": "Древнеримская религия",
      "statement": "Римляне проводят массовые очистительные обряды и жертвоприношения в ответ на пугающие знамения во время пунических войн.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«чудеса во время зимы 218 г. до н. э., самой драматичной зимы пунических войн... ПО откровению Сивиллиных книг были объявлены девятидневные жертвоприношения. Весь город принял участие в очистительных обрядах»",
      "source_ref": "Том 2, Глава 18, § 163",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Latium",
        "year_from": -218,
        "year_to": -218,
        "mapping_confidence": "high",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "astarte-uni-syncretism-pyrgi",
      "period": "ок. 500 г. до н. э.",
      "era": "Осевое время",
      "territory": "Рим",
      "precise_location": "Пирги (Цере)",
      "religion": "Этрусская религия",
      "statement": "Этрусский царь посвящает храм финикийской богине Астарте, которая отождествляется с этрусской Уни (Юноной).",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«В храме порта Пирги (одна из гаваней г. Цере) недавно обнаружена пуническая надпись... Все датируется примерно 500 г. до н. э. Пунический текст содержит хвалу этрусского царя, обращенную финикийской богине Астарте, гомологу богини Уни (Юноны).»",
      "source_ref": "Том 2, Глава 18, § 167",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Latium",
        "year_from": -500,
        "year_to": -500,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "evocatio-tanit-carthage",
      "period": "146 г. до н. э.",
      "era": "Эллинистический период",
      "territory": "Карфаген",
      "religion": "Древнеримская религия",
      "statement": "Римляне совершают ритуал evocatio, призывая финикийскую богиню Танит покинуть осажденный Карфаген.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«финикийская Танит, призванная Сципионом Эмилианом при осаде Карфагена в 146 г. до н. э.»",
      "source_ref": "Том 2, Глава 18, § 168",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Africa Proconsularis",
        "year_from": -146,
        "year_to": -146,
        "mapping_confidence": "low",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "derveni-papyrus-orphic-cosmogony",
      "period": "IV в. до н. э.",
      "era": "Эллинистический период",
      "territory": "Греция",
      "precise_location": "Дервени (Фессалоники)",
      "religion": "Орфизм",
      "statement": "Создается Дервенский папирус — комментарий к орфической космогонии, превозносящий абсолютную власть Зевса.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«Дервенский папирус... содержит независимую теорию, в которой превозносится космогоническое могущество и абсолютная власть Зевса. ... Найден в 1962 году недалеко от города Дервени, в Фессалониках, и датируется IV в. до н. э. Речь идет о комментарии орфического текста»",
      "source_ref": "Том 2, Глава 18, § 181, прим. 380",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Macedonia",
        "year_from": -400,
        "year_to": -300,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "jewish-philosophy-universalism-aristobulus",
      "period": "175–170 гг. до н. э.",
      "era": "Эллинистический период",
      "territory": "Египет",
      "precise_location": "Александрия",
      "religion": "Иудаизм",
      "statement": "Аристобул выдвигает теорию, согласно которой иудейское учение является единственно верной философией, заимствованной греческими мыслителями.",
      "is_first_occurrence": True,
      "first_occurrence_type": "explicit",
      "quote": "«В 175–170 гг. Аристобул, первый еврейский философ... выдвинул смелую теорию... иудейское учение... рассматривалось как единственно верная философия. Она была известна Пифагору, Сократу и Платону, которые переняли ее принципы.»",
      "source_ref": "Том 2, Глава 18, § 201",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Upper Egypt",
        "year_from": -175,
        "year_to": -170,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "manichaeism-uighur-state-religion",
      "period": "763–840 гг. н. э.",
      "era": "Средневековье",
      "territory": "Центральная Азия",
      "precise_location": "Уйгурское царство",
      "religion": "Манихейство",
      "statement": "Манихейство становится официальной государственной религией Уйгурского каганата и остается ею вплоть до его падения.",
      "is_first_occurrence": True,
      "first_occurrence_type": "explicit",
      "quote": "«В 763 г. каган уйгуров обратился в манихейство, и оно стало государственной религией всего Уйгурского царства, вплоть до его падения в результате войны с киргизами в 840 г.»",
      "source_ref": "Том 2, Глава 18, прим. 767",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Tarim Basin",
        "year_from": 763,
        "year_to": 840,
        "mapping_confidence": "medium",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    },
    {
      "concept_id": "elkesaite-judeo-christian-gnostic-sect",
      "period": "ок. 100 г. н. э.",
      "era": "Античность",
      "territory": "Иран/Персия",
      "precise_location": "Парфянское царство",
      "religion": "Иудео-христианство",
      "statement": "Елкай основывает синкретическую иудео-христианскую баптистскую секту гностического толка.",
      "is_first_occurrence": True,
      "first_occurrence_type": "implicit",
      "quote": "«Смешанная иудео-христианская секта, основанная в 100 г., в Парфянском царстве Елкаем.»",
      "source_ref": "Том 2, Глава 18, прим. 751",
      "is_dead_end": False,
      "connections": [],
      "references": [],
      "seshat": {
        "nga_name": "Susiana",
        "year_from": 100,
        "year_to": 100,
        "mapping_confidence": "low",
        "nga_id": None,
        "polity_id": None,
        "religion_id": None,
        "enriched": False
      }
    }
  ]
}

os.makedirs(REPO_ROOT / ".scratch" / "religion-map" / "vol2", exist_ok=True)
with open(REPO_ROOT / ".scratch" / "religion-map" / "vol2" / "ch18-events.json", "w", encoding="utf-8") as f:
    json.dump(events_data, f, ensure_ascii=False, indent=2)

with open(REPO_ROOT / ".scratch" / "religion-map" / "concept-registry.json", "r", encoding="utf-8") as f:
    registry = json.load(f)

for event in events_data["events"]:
    concept_id = event["concept_id"]
    if concept_id not in registry["concepts"]:
        registry["concepts"][concept_id] = {
            "first_seen_volume": 2,
            "first_seen_chapter": 18,
            "first_seen_chapter_title": "Глава XVIII Критическая библиография",
            "source_ref": event["source_ref"]
        }

with open(REPO_ROOT / ".scratch" / "religion-map" / "concept-registry.json", "w", encoding="utf-8") as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print("Successfully written events and updated registry.")
