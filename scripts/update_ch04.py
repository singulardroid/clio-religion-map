#!/usr/bin/env python3
"""Regenerate Vol. 1 Ch. IV events and patch concept-registry. Run: python update_ch04.py (from scripts/) or python scripts/update_ch04.py"""
import json
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

_SCRATCH = REPO_ROOT / ".scratch" / "religion-map"

refs = {
  178: "Н. Frankfort. The Birth of Civilization in the Near East, pp. 100–111; E.I. Baumgartel. The Culture of Prehistoric Egypt, p. 48 sq.",
  179: "H. Frankfort. La Royauté et les Dieux, p. 50.",
  180: "См.:: Rundle Clark. Myth and Symbol in Ancient Egypt, pp. 263–264. Речь идет об известном мифологическом мотиве — \"совершенстве начал\".",
  182: "См.: Rundle Clark. Myth and Symbol in Ancient Egypt, p. 36.",
  188: "По переводу: Sauneron et Yoyotte. Naissance, pp. 63–64. См. также комментарий в: Morenz. Rel. égyptienne, p. 216 sq. И особ.: Н. Frankfort. La Royauté, pp. 51–64.",
  189: "Отрывок из \"Поучений царевичу Мерикара\", переведенных в: Sauneron et Yoyotte. Naissance, pp. 75–76.",
  197: "Тексты, переведенные в: Morenz. Rel. égyptienne, pp. 167–170.",
  199: "См.: Le Mythe de l'éternel retour, chap. 1.",
  208: "Тексты, цитируемые в Vandier, p. 78. См. также отрывки, переведенные Брестедом (Development of Religion and Thought in Ancient Egypt, pp. 109–115, 118–120,122, 136) и включенные в нашу антологию \"From Primitives to Zen\", pp. 353–355.",
  209: "Vandier. Relig. égyptienne, p. 72. Более подробное рассмотрение можно найти в: Breasted. Development, p. 103 sq. и в: R. Weill. Le champ des roseaux et le champ des offrandes, p. 16 sq.",
  215: "Лишь в текстах, относящихся к Девятой и Десятой династиям, Осирис начинает говорить от своего собственного имени; см.: Rundle Clark. Myth and Symbol in Ancient Egypt, p. 110",
  216: "См.: Frankfort. La Royauté, p. 256 sq. (Осирис в зерне и в Ниле).",
  220: "Когда Гор спускается в потусторонний мир и воскрешает Осириса, он сообщает ему силу «знания». Осирис был \"легкой добычей\", потому что он \"не знал\" подлинную природу Сета; см. текст, переведенный с комментариями в: Rundle Clark. Myth and Symbol in Ancient Egypt, p. 114 sq.",
  225: "Перев. Wilson. — ANET, р. 467; см. также: Breasted. Development of Religion and Thought, p. 183, Erman-Blackman, p. 132 sq.",
  226: "Перев. Wilson. — ANET, pp. 405–407; см.: Breasted. Development, p. 189 sq.; Erman-Blackman, p. 86 sq.",
  235: "\"Когда ты заходишь… Земля пребывает в темноте, как бы в смерти\". Ночью дикие животные и змеи начинают двигаться, и тогда \"мир погружается в тишину\".",
  236: "\"Ты создал Землю… когда ты был один\". \"Ты отдалил небо так, что можешь на него подниматься и смотреть оттуда на то, что ты сотворил!\".",
  242: "Piankoff. Ramesses, Vl, p. 35.",
  244: "Уже в \"Текстах Пирамид\" Атум вызывает эманацию богов из своего собственного существа. В форме изначального змея (см. § 26) Атум уже отождествляется с Осирисом...",
  245: "Аналогичный процесс, хотя и имеющий другую цель, происходил в Индии, начиная с периода брахман; см. главу IX.",
  246: "Ср.: Yoyotte. Le jugement des morts dans l'Egypte ancienne, p. 45. Поясним, что суд над мертвыми и понятие о небесной справедливости...",
  250: "О значении этого выражения Cм.: Yoyotte. Jugements lies morts, p. 61 sq.",
  251: "По переводу в: Yoyotte, Ibid. pp. 52–56."
}

events = [
  {
    "concept_id": "writing-system-egypt",
    "period": "Около 3000 лет до н. э.",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Египет заимствовал письменность, которая появилась внезапно при Первой династии.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "Египет заимствовал у шумеров цилиндрические печати... а, главное, письменность, которая появилась внезапно, не имея предшественниц, при Первой династии (около 3000 лет до н. э.).",
    "source_ref": "Том 1, Глава IV, § 25",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [178],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -3000,
      "year_to": -2900,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "state-unification-cosmogony",
    "period": "Около 3000 лет до н. э.",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Объединение государства равнялось космогонии; фараон, как воплощенный бог, устанавливал новый мир.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Сплочение государства равнялось космогонии; фараон, воплощенный бог, устанавливал новый мир, цивилизацию, бесконечно более сложную и более высокую...",
    "source_ref": "Том 1, Глава IV, § 25",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [179],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -3000,
      "year_to": -2900,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "zep-tepi-golden-age",
    "period": "Древнее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Идея \"Первого времени\" (Zep Tepi) как Золотого Века абсолютного совершенства, служащего парадигматической моделью для ритуального воспроизведения.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Этот период, называемый Тер Zepi — \"Первое время\", длился от появления бога-создателя... Ясно, что \"Первое время\" — это Золотой Век абсолютного совершенства, \"когда еще не было ни гнева, ни шума, ни борьбы, ни беспорядка\".",
    "source_ref": "Том 1, Глава IV, § 25",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [180],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2700,
      "year_to": -2200,
      "mapping_confidence": "medium",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "primordial-hill-creation",
    "period": "Древнее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Египетская космогония начинается с возникновения Первичного холма из первичных вод, означающего начало земли, света и жизни.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Подобно многим другим традициям, египетская космогония начинается с возникновения холма из первичных вод. Появление этого \"Первого Места\"... означало возникновение земли, но также и начало света, жизни и сознания.",
    "source_ref": "Том 1, Глава IV, § 26",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [182],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2700,
      "year_to": -2200,
      "mapping_confidence": "medium",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "ptah-logos-creation",
    "period": "Ок. 3000–2800 гг. до н. э.",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Мемфисская теология утверждает творение богом Птахом с помощью разума (\"сердца\") и слова (\"языка\"), предвосхищая теологию Логоса.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "Ибо Птах творит своим разумом (своим \"сердцем\") и словом (своим \"языком\")... Здесь мы весьма определенно сталкиваемся с наивысшим проявлением египетского метафизического мышления... доктрину, которая приближается к христианской теологии Логоса.",
    "source_ref": "Том 1, Глава IV, § 26",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [188],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -3000,
      "year_to": -2800,
      "mapping_confidence": "medium",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "humans-from-divine-tears",
    "period": "Древнее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Люди (erme) родились из слез (erme) солярного бога Ра.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Люди (еrmе) родились из слез (еrmе) солярного бога Ра.",
    "source_ref": "Том 1, Глава IV, § 26",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [189],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2700,
      "year_to": -2200,
      "mapping_confidence": "medium",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "maat-cosmic-order",
    "period": "Древнее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Фараон является воплощением маат (истины, правильного порядка), отражающего совершенство первоначального творения.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Фараон является воплощением маат, слова, переводимого как «истина», но главное значение которого — это \"добрый порядок\", и отсюда «право», «справедливость». Маат относится к первоначальному творению...",
    "source_ref": "Том 1, Глава IV, § 27",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [197],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2700,
      "year_to": -2200,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "pharaoh-repels-apophis",
    "period": "Древнее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Политическая деятельность фараона воспроизводит ежедневную победу бога Ра над змеем хаоса Апопом.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Политическая деятельность фараона воспроизводит подвиг Ра: он (фараон) также «отвращает» Апопа — иными словами, следит за тем, чтобы мир не был ввергнут снова в состояние хаоса.",
    "source_ref": "Том 1, Глава IV, § 27",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [199],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2700,
      "year_to": -2200,
      "mapping_confidence": "medium",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "afterlife-celestial-ascent-egypt",
    "period": "Ок. 2500–2300 гг. до н. э.",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Фараон после смерти возносится на небеса, проходя испытания и отвечая на инициатические вопросы.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "В большинстве пассажей настойчиво повторяется, что фараон... улетает туда в виде птицы... Чтобы получить место в лодке, следовало выполнить все ритуальные очищения и, прежде всего, дать ответы на вопросы инициатического характера...",
    "source_ref": "Том 1, Глава IV, § 28",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [208, 209],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2500,
      "year_to": -2300,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "osiris-slain-god-fertility",
    "period": "Древнее и Среднее царство",
    "era": "Ранняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Убитый и расчлененный бог Осирис возвращен к жизни как обладатель жизненной энергии, обеспечивающий плодородие и процветание.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Осирис возвращен к жизни как духовная личность (душа) и обладатель жизненной энергии. Именно он будет с этих пор обеспечивать плодородие растительности и всю репродукцию.",
    "source_ref": "Том 1, Глава IV, § 29",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [215, 216],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2500,
      "year_to": -1730,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "democratization-osirification",
    "period": "Ок. 2200–2050 гг. до н. э.",
    "era": "Средняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Процесс «демократизации» Осириса: заупокойные тексты становятся доступны не только фараону, но и знати, а затем и простым людям.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "Так начался процесс, который известен, как «демократизация» Осириса... Тексты, которые ранее высекались на стенах тайных камер в пирамидах... теперь стали воспроизводиться на саркофагах знати и даже рядовых...",
    "source_ref": "Том 1, Глава IV, § 29",
    "is_dead_end": False,
    "connections": [
      {
        "target_concept_id": "afterlife-celestial-ascent-egypt",
        "label": "Распространение привилегии вознесения"
      }
    ],
    "ref_nums": [220],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2200,
      "year_to": -2050,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "egyptian-literature-of-despair",
    "period": "Ок. 2200–2050 гг. до н. э.",
    "era": "Средняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Скептицизм, агностицизм и религиозное обесценивание смерти как реакция на крушение центральной власти (Первое Междуцарствие).",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Крушение всех традиционных институтов находило выражение одновременно и в агностицизме и пессимизме... «Синкопа» божественности царской власти неизбежно вела к религиозному обесцениванию смерти.",
    "source_ref": "Том 1, Глава IV, § 30",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [225, 226],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2200,
      "year_to": -2050,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "amun-ra-solarization",
    "period": "С 2040 г. до н. э.",
    "era": "Средняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Соляризация Амона, когда скрытый бог Гермополиса отождествляется с солнцем и становится всеобщим богом Амон-Ра.",
    "is_first_occurrence": True,
    "first_occurrence_type": "implicit",
    "quote": "Именно в эпоху Двенадцатой династии Амон... выдвинулся в высший разряд под титулом Амон-Pa. «Скрытый» бог был отождествлен с солнцем, богом, \"себя проявляющим\".",
    "source_ref": "Том 1, Глава IV, § 31",
    "is_dead_end": False,
    "connections": [],
    "ref_nums": [],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -2040,
      "year_to": -1730,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "atenism-solar-monotheism",
    "period": "1375–1350 гг. до н. э.",
    "era": "Поздняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Реформа Эхнатона: выдвижение солнечного диска (Атона) как единственного божества, доступного только через фараона.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "...выдвижение Атона, солнечного диска, в качестве единственного верховного божества... Говорилось даже о «монотеистическом» характере реформы Эхнатона...",
    "source_ref": "Том 1, Глава IV, § 32",
    "is_dead_end": True,
    "connections": [],
    "ref_nums": [235, 236],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -1375,
      "year_to": -1350,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "ra-osiris-fusion",
    "period": "После 1500 г. до н. э.",
    "era": "Поздняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Теологический синтез Нового царства, объединяющий Ра (солнце) и Осириса (подземный мир) в двуединое божество Ра-Осирис.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "Схождение Ра в подземный мир означает одновременно его смерть и его возрождение. В одном из текстов говорится о \"Ра, который отправляется покоиться в Осирисе, и об Осирисе, который отправляется покоиться в Ра\".",
    "source_ref": "Том 1, Глава IV, § 33",
    "is_dead_end": False,
    "connections": [
      {
        "target_concept_id": "osiris-slain-god-fertility",
        "label": "Синтез Осириса с солярным божеством"
      }
    ],
    "ref_nums": [242, 244, 245],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -1500,
      "year_to": -1000,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  },
  {
    "concept_id": "judgment-of-dead-psychostasia",
    "period": "После 1500 г. до н. э.",
    "era": "Поздняя бронза",
    "territory": "Египет",
    "religion": "Египетская религия",
    "statement": "Психостасия (взвешивание сердца) в присутствии Осириса: суд над умершим на основе справедливости (маат) и заявления о невиновности.",
    "is_first_occurrence": True,
    "first_occurrence_type": "explicit",
    "quote": "Два акта посмертной драмы — «суд» и \"взвешивание сердца\" — совершаются в присутствии Осириса... Сердце умершего кладут на одну чашку весов, а на другую — перо или глаз, символы маат.",
    "source_ref": "Том 1, Глава IV, § 33",
    "is_dead_end": False,
    "connections": [
      {
        "target_concept_id": "maat-cosmic-order",
        "label": "Маат как критерий оценки души"
      }
    ],
    "ref_nums": [246, 250, 251],
    "seshat": {
      "nga_name": "Upper Egypt",
      "year_from": -1500,
      "year_to": -1000,
      "mapping_confidence": "high",
      "nga_id": None,
      "polity_id": None,
      "religion_id": None,
      "enriched": False
    }
  }
]

for event in events:
    if "ref_nums" in event:
        event["references"] = [{"num": n, "text": refs[n]} for n in event.pop("ref_nums") if n in refs]

# Write to ch04-events.json
with open(_SCRATCH / "vol1" / "ch04-events.json", "w", encoding="utf-8") as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

# Update concept-registry.json
with open(_SCRATCH / "concept-registry.json", "r", encoding="utf-8") as f:
    registry = json.load(f)

for event in events:
    if event.get("is_first_occurrence"):
        cid = event["concept_id"]
        if cid not in registry["concepts"]:
            registry["concepts"][cid] = {
                "first_seen_volume": 1,
                "first_seen_chapter": 4,
                "first_seen_chapter_title": "Глава IV РЕЛИГИОЗНЫЕ ИДЕИ И ПОЛИТИЧЕСКИЕ КРИЗИСЫ В ДРЕВНЕМ ЕГИПТЕ",
                "source_ref": event["source_ref"]
            }

with open(_SCRATCH / "concept-registry.json", "w", encoding="utf-8") as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print("Done generating events and updating registry.")
