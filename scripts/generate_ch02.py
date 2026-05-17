import json
import os

events = [
    {
        "concept_id": "water-sacrifice-and-idols",
        "period": "10 000 до н.э.",
        "era": "Мезолит",
        "territory": "Европа",
        "religion": "Доисторические верования",
        "statement": "Жертвоприношение оленей (приношение «первинок») путем затопления в озерах, вероятно, Повелителю диких зверей, и установка деревянных идолов.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«В отложениях ила на дне пруда в Штелльморе близ Гамбурга А. Руст обнаружил останки двенадцати оленей, целиком, с грузом из камней в грудной клетке или брюшной полости. Руст и другие авторы интерпретировали эту находку как приношение «первинок» какому-то божеству, вероятно, Повелителю диких зверей.»",
        "source_ref": "Том 1, Глава II, § 8",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 55, "text": "A. Rust. Die alt- und mittelsteinzeitliche Funde von Stellmoor; H. Miiller-Karpe. Handbuch der Vorgeschichte, vol. 1, p. 224 sq.; H, Pohlhausen. Zum Motiv der Rentierversenkung, pp. 988–989; J. Marinier. Die Opfer der paläolitischen Menschen, p. 266 sq." },
            { "num": 56, "text": "Ср.: А. Closs. Das Versenkungsopfer, passim." }
        ],
        "seshat": {
            "nga_name": "Northern Europe",
            "year_from": -10000,
            "year_to": -8000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "ancestor-cult-churinga",
        "period": "Мезолит",
        "era": "Мезолит",
        "territory": "Европа",
        "religion": "Доисторические верования",
        "statement": "Антропоморфные изображения на скалах и раскрашенная галька, сходные с австралийскими чурингами, представляющие мистические тела предков.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Гуго Обермайер показал, что антропоморфные фигуры сходны с изображениями на раскрашенной гальке азильцев. [...] Наиболее убедительным кажется сопоставление их с австралийскими чурингами. Про эти ритуальные предметы, чаще всего изготовленные из камня и декорированные различными геометрическими узорами, известно, что они представляют мистические тела предков.»",
        "source_ref": "Том 1, Глава II, § 8",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 59, "text": "Цивилизация охотников и рыболовов, получившая название по стоянке в Мас-д'Азиль, пещере во Французских Пиренеях." },
            { "num": 60, "text": "Eliade. Religions australiennes (1972), p. 100 sq. Ясно, что, согласно верованиям австралийцев, предок существует одновременно в мистическом теле, чуринга, и в человеке, в котором он воплотился. Следует добавить, что он также существует под землей и в виде «духов-детей» (ibid, p. 60)." }
        ],
        "seshat": {
            "nga_name": "Iberia",
            "year_from": -10000,
            "year_to": -8000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "skull-cult-soul-brain",
        "period": "10 000–8000 до н.э.",
        "era": "Мезолит",
        "territory": "Израиль/Ханаан",
        "religion": "Доисторические верования",
        "statement": "Погребение черепов, связанное с верой в то, что голова (мозг) является вместилищем души.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Что же касается залежей черепов, натуфийские находки сравнивались со сходными захоронениями... В обоих случаях мы можем считать, что это был магико-религиозный акт, поскольку голова (мозг) считалась вместилищем души.»",
        "source_ref": "Том 1, Глава II, § 9",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 70, "text": "Anati. Ор. cit., p. 175; Maringer. The Gods of the prehistoric men, p. 184 sq. См. также: Müller-Karpe, I, p. 239 sq." },
            { "num": 71, "text": "И не только для верований доисторической эпохи. Греки тоже помещали душу — а позднее (у Алкмеона Кротонского) сперму — в голове. Ср.: Onian. Origins of European Thought, pp. 107–108, 115, 134–136 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -10000,
            "year_to": -8000,
            "mapping_confidence": "medium",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "agriculture-origin-myth-murder",
        "period": "IX–VII тысячелетия до н.э.",
        "era": "Неолит",
        "territory": "Доисторический/Глобальный",
        "religion": "Земледельческие религии",
        "statement": "Мифы о происхождении пищевых растений (клубней и злаков) из тела принесенного в жертву божества (например, Хаинувеле).",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Довольно широко распространенный сюжет повествует о том, что клубни и деревья, дающие пригодные в пищу плоды (кокос, банан и т. п.), родились из тела принесенного в жертву божества. Среди знаменитейших примеров — тот, что связан с Серамом... из расчлененного и погребенного тела юной полубогини, Хаинувеле, растут дотоле невиданные растения, прежде всего, клубни.»",
        "source_ref": "Том 1, Глава II, § 11",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 77, "text": "Хаинувеле — культурная героиня народа вемале (Восточная Индонезия), убийство которой принесло в мир смерть, а с ней — плодородие (см. Мифы народов мира. Т. 2. С. 576)." },
            { "num": 78, "text": "Ср.: Eliade. Aspects du mythe, p. 132 sq." }
        ],
        "seshat": {
            "nga_name": "Global",
            "year_from": -9000,
            "year_to": -6000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "human-plant-solidarity",
        "period": "Неолит",
        "era": "Неолит",
        "territory": "Доисторический/Глобальный",
        "religion": "Земледельческие религии",
        "statement": "Зарождение мистической солидарности между человеком и растительностью, где сакральность жизни воплощается в сперме и крови.",
        "is_first_occurrence": True,
        "first_occurrence_type": "explicit",
        "quote": "«Первым и, может быть, важнейшим следствием открытия земледелия является кризис ценностей палеолитического охотника: на смену отношениям религиозного порядка с животным миром пришло то, что можно назвать мистической солидарностью между человеком и растительностью. Если дотоле существо и сакральность жизни символизировались костью и кровью, то отныне они воплощаются в сперме и крови.»",
        "source_ref": "Том 1, Глава II, § 12",
        "is_dead_end": False,
        "connections": [
            { "target_concept_id": "mystical-solidarity-hunter-prey", "label": "заменяет" }
        ],
        "references": [
            { "num": 81, "text": "См. примеры в: Eliade. Traité, § 91 sq." },
            { "num": 82, "text": "Ср.: Traité, § 86 sq.; Mythes, rêves et mystères, p. 218 sq." }
        ],
        "seshat": {
            "nga_name": "Global",
            "year_from": -8000,
            "year_to": -4000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "cosmic-renewal-world-tree",
        "period": "Неолит",
        "era": "Неолит",
        "territory": "Доисторический/Глобальный",
        "religion": "Земледельческие религии",
        "statement": "Возникновение космической религии, сосредоточенной вокруг тайны периодического обновления мира, символизируемого Мировым Древом в Центре Мира.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Земледельческие культуры вырабатывают то, что можно назвать космической религией, поскольку религиозная активность сосредоточена вокруг центрального таинства — периодического обновления мира. [...] Тайну космической сакральности символизирует Мировое Древо. Вселенная воспринимается как организм, требующий периодического, иначе сказать, ежегодного, обновления.»",
        "source_ref": "Том 1, Глава II, § 12",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 83, "text": "Ср.: Traité, § 99 sq." },
            { "num": 84, "text": "Это самая распространенная форма изображения axis mundi. Однако есть вероятность, что символика Мировой Оси предшествует земледельческим цивилизациям или независима от них, поскольку ее обнаруживают в некоторых арктических культурах." }
        ],
        "seshat": {
            "nga_name": "Global",
            "year_from": -8000,
            "year_to": -4000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "dwelling-imago-mundi",
        "period": "Неолит",
        "era": "Неолит",
        "territory": "Доисторический/Глобальный",
        "religion": "Земледельческие религии",
        "statement": "Придание пространству обитания (жилищу) религиозной ценности как imago mundi (образа мира), с выделением Центра Мира.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Не менее важно придание пространству, и прежде всего, жилищу и поселению, религиозной ценности. Оседлое существование организует мир иначе, нежели кочевая жизнь. \"Истинный мир\" для земледельца — это пространство его обитания: дом, поселение, возделанные поля. Центр Мира — это место, освященное ритуалами и молитвами...»",
        "source_ref": "Том 1, Глава II, § 12",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 86, "text": "R. Stein. Architecture et pensée religieuse en Extrême-Orient, p. 168; см. там же описание другого типа китайского неолитического жилища — квадратных или прямоугольных построек, полуподземных, со ступеньками для спуска." },
            { "num": 87, "text": "Ср.: Eliade. Chamanisme, p. 213 (рус. перевод: Шаманизм: Архаические техники экстаза. М.: София, 1998, стр. 202)." }
        ],
        "seshat": {
            "nga_name": "Global",
            "year_from": -8000,
            "year_to": -4000,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "jericho-skull-cult",
        "period": "ок. 6850 г. до н.э.",
        "era": "Неолит",
        "territory": "Израиль/Ханаан",
        "religion": "Неолитические религии Ближнего Востока",
        "statement": "Развитие культа предков в виде почитания черепов с восстановленными гипсом лицами и раковинами вместо глаз.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Умершего хоронили под полом дома. Несколько черепов, раскопанных Катлин Кеньон, хранят следы необычной обработки, нижним частям придана форма с помощью гипса, а глаза выделены раковинами, так что черепа напоминают настоящие портреты. Речь, очевидно, идет о почитании черепов.»",
        "source_ref": "Том 1, Глава II, § 13",
        "is_dead_end": False,
        "connections": [
            { "target_concept_id": "skull-cult-soul-brain", "label": "развивает" }
        ],
        "references": [
            { "num": 91, "text": "K.M. Kenyan. Archaeology in the Holy Land, p. 50." },
            { "num": 92, "text": "Kenyan. Digging up Jericho, p. 53 sq. См. также: Müller-Karpe. Handbuch, II, p. 380–81; J.Cauvin. Ор. cit., p. 44 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -6850,
            "year_to": -6000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "catal-hoyuk-goddess-bull",
        "period": "ок. 7000–6200 гг. до н.э.",
        "era": "Неолит",
        "territory": "Анатолия",
        "religion": "Неолитические религии Ближнего Востока",
        "statement": "Развитая система святилищ с изображениями Богини-Матери в трех ипостасях и бога-мужчины, чьей эпифанией выступает бык.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Главное божество — это богиня, представленная в трех видах: молодая женщина, мать, рожающая ребенка (или быка), и старуха (иногда в сопровождении хищной птицы). Божество мужского пола появляется в виде мальчика или юноши... и в виде бородатого мужчины, иногда верхом на своем священном животном, быке.»",
        "source_ref": "Том 1, Глава II, § 13",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 96, "text": "James Mellaart. Çatal Huyuk: A Neolithic Town of Anatolia, p. 60 sq.; idem. Earliest Civilizations of the Near East, p. 87 sq.18" }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -7000,
            "year_to": -6200,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "halaf-bull-thunder-god",
        "period": "до 4400–4300 гг. до н.э.",
        "era": "Неолит",
        "territory": "Месопотамия",
        "religion": "Неолитические религии Ближнего Востока",
        "statement": "Почитание дикого быка как воплощения мужской плодовитости и бога грома, наряду с образами Богини-Матери.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«Дикий бык почитался как воплощение мужской плодовитости. Изображения быков, бычьи черепа, бараньи головы и двойной топор имели, очевидно, культовое значение в связи с богом грома, столь важным персонажем всех древних ближневосточных религий.»",
        "source_ref": "Том 1, Глава II, § 13",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 98, "text": "От названия места Телль-Халаф в поселении Арпачийя, близ Мосула." },
            { "num": 99, "text": "Общую характеристику и библиографию см. в: Müller-Karpe. Handbuch, II, p. 59 sq. О религиозной символике фигурок и халафских иконографических мотивов см.: B.L. Goff. Symbols of Prehistoric Mesopotamia, p. 11 sq." }
        ],
        "seshat": {
            "nga_name": "Mesopotamia",
            "year_from": -5500,
            "year_to": -4300,
            "mapping_confidence": "medium",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "ubaid-monumental-temples",
        "period": "ок. 4325–3100 гг. до н.э.",
        "era": "Неолит",
        "territory": "Месопотамия",
        "religion": "Неолитические религии Ближнего Востока",
        "statement": "Появление первых монументальных храмов (зиккуратов), символизирующих священную гору.",
        "is_first_occurrence": True,
        "first_occurrence_type": "explicit",
        "quote": "«В самом деле, наиболее значительным новшеством периода Обейдской культуры, несомненно, является появление монументальных храмов. Одним из наиболее замечательных следует признать «белый замок» (ок. 3100 г.)... Эта платформа включает в себя остатки древнейших святилищ и образует «зиккурат», священную «гору»...»",
        "source_ref": "Том 1, Глава II, § 13",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 100, "text": "См.: Müller-Karpe, II, р. 61 sq., 339, 351, 423; M.E.L. Mallowan. Early Mesopotamia and Iran, p. 40 sq. (\"белый замок\")." }
        ],
        "seshat": {
            "nga_name": "Mesopotamia",
            "year_from": -4325,
            "year_to": -3100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "old-europe-sacred-pillar",
        "period": "ок. 6500–5300 гг. до н.э.",
        "era": "Неолит",
        "territory": "Европа",
        "religion": "Староевропейские верования",
        "statement": "Развитая религия с храмами и культом священного столпа как символа axis mundi.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "«В неолитической стоянке в Кэсчьоареле... при раскопках был обнаружен храм, стены которого расписаны великолепными спиралями... двухметровая колонна и еще одна поменьше указывают на культ священного столпа, символа axis mundi.»",
        "source_ref": "Том 1, Глава II, § 14",
        "is_dead_end": False,
        "connections": [
            { "target_concept_id": "cosmic-renewal-world-tree", "label": "воплощает" }
        ],
        "references": [
            { "num": 104, "text": "Vladimir Dumitrescu. Edifice destiné au culte découvert à C'scioarele, p. 21. Обе колонны полые, что указывает на то, что в качестве каркаса при их изготовлении использовались стволы деревьев, ibid., р. 14, 21. Символика axis mundi уподобляет Мировое Древо Мировому Столпу (columna universalis). Радиоуглеродная датировка, сообщаемая Думитреску, колеблется в промежутке от 4035 до 3620 гг. (ср.: р. 24, п. 25). Мария Гимбутас говорит о \"прибл. 5 тыс. лет до н. э.\" (р. 11)." },
            { "num": 105, "text": "Hortensia Dumitrescu. Un modèle de sanctuaire découverte à C'scioarele, fig. 1, 4 (последний рис. воспроизведен у Гимбутас, стр. 12)." }
        ],
        "seshat": {
            "nga_name": "Balkans",
            "year_from": -6500,
            "year_to": -5300,
            "mapping_confidence": "medium",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "metallurgy-telluric-sacredness",
        "period": "Железный век",
        "era": "Железный век",
        "territory": "Доисторический/Глобальный",
        "religion": "Мифология металлов",
        "statement": "Возникновение теллурической сакральности, связанной с рудниками, и восприятие кузнеца как «хозяина огня», ускоряющего время созревания металлов.",
        "is_first_occurrence": True,
        "first_occurrence_type": "explicit",
        "quote": "«На смену «мифологии шлифованного камня» пришла «мифология металлов»... Наряду с небесной сакральностью, присущей метеоритам, появилась теллурическая сакральность, связанная с рудниками и рудами. Металлы «возрастают» в недрах земли. Пещеры и шахты уподобляются утробе Матери-Земли.»",
        "source_ref": "Том 1, Глава II, § 15",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 112, "text": "См.: Forgerons et alchimistes, p. 46 sq." },
            { "num": 113, "text": "Ср.: ibid, p. 61 sq. Некоторые африканские племена делят руды на «мужские» и «женские»; в древнем Китае, Великий Юй, первый литейщик, различал металлы мужские и металлы женские. — Ibid., р. 37. В Африке выплавка уподобляется половому акту. — Ibid., р. 62." },
            { "num": 114, "text": "Об амбивалентном положении кузнецов в Африке см.: ibid.. р. 89 sq." }
        ],
        "seshat": {
            "nga_name": "Global",
            "year_from": -1200,
            "year_to": -500,
            "mapping_confidence": "low",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    }
]

with open('.scratch/religion-map/vol1/ch02-events.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

with open('.scratch/religion-map/concept-registry.json', 'r', encoding='utf-8') as f:
    registry = json.load(f)

for event in events:
    if event['is_first_occurrence']:
        registry['concepts'][event['concept_id']] = {
            "first_seen_volume": 1,
            "first_seen_chapter": 2,
            "first_seen_chapter_title": "Глава II САМАЯ ДОЛГАЯ РЕВОЛЮЦИЯ: ОТКРЫТИЕ ЗЕМЛЕДЕЛИЯ — МЕЗОЛИТ И НЕОЛИТ",
            "source_ref": event['source_ref']
        }

with open('.scratch/religion-map/concept-registry.json', 'w', encoding='utf-8') as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print("Done")
