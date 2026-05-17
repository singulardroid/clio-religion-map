import json
import sys
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_SCRIPT_DIR))

from repo_paths import REPO_ROOT

events = [
    {
        "concept_id": "hittite-religious-syncretism",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Хетты осуществили глубокий религиозный синкретизм, объединив индоевропейское наследие с верованиями хаттов, хурритов и шумеро-аккадским влиянием.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Поэтому в хеттском пантеоне божества шумеро-аккадской семьи стояли бок о бок с анатолийскими и хурритскими божествами.",
        "source_ref": "Том 1, Глава VI, § 43",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 323, "text": "О хурритах см.: Вильхельм Г. Древний народ хурриты. М., 1992." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "storm-god-and-great-goddess-couple",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Во главе хеттского пантеона стояла божественная чета — Бог грозы (Тешуб) на быке и Великая Богиня (Хебат) на льве или пантере.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Пантеон воспринимался как большая семья, возглавляемая первой четой страны хеттов: Богом грозы и Великой Богиней... Их священные животные, бык, а у Хебат — лев (или пантера), подтверждают преемственность с доисторическим периодом",
        "source_ref": "Том 1, Глава VI, § 43",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "catal-hoyuk-goddess-bull", "label": "преемственность священных животных" } ],
        "references": [],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "solarization-of-great-goddess",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Великая Богиня-Мать приобретает солярные черты, становясь «солнечной» богиней Аринны, покровительницей хеттского государства.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Самая знаменитая Великая Богиня была известна под именем «солнечной» богини Аринны... Возможно, что «соляризация» представляет собой акт почитания, практикующийся с тех пор, как богиня Аринна стала покровительницей страны хеттов.",
        "source_ref": "Том 1, Глава VI, § 43",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 324, "text": "В красивой молитве царица Пуду-хепас уподобляет богиню Аринны с Хебат (ср. перевод: A. Goetze. — ANET, р. 293. Однако это единственный документ, где содержится такое предположение. В ритуалах и жертвенных списках имена двух богинь следуют друг за другом. Этот факт можно объяснить тем значением, которое при хеттских властителях придавалось двум знаменитым эпифаниям Богини-Матери." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "hittite-divine-kingship-posthumous",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Хеттский царь считался наместником богов на земле и воплощением обожествленных предков, а после смерти сам становился богом.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "После кончины цари обожествлялись. О смерти царя говорилось: \"Он стал богом\". Его статую устанавливали в храме, и правящий властитель приносил ему жертвы.",
        "source_ref": "Том 1, Глава VI, § 43",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "divine-origin-kingship", "label": "развитие идеи божественной власти" } ],
        "references": [
            { "num": 326, "text": "Ритуал сооружения нового дворца. Перевод A. Goetze. — ANET, р. 357." },
            { "num": 327, "text": "О. R. Gurney. Hittite Kingship, p. 115." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "hiding-god-telepinus",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Миф о Телепинусе, боге, который в гневе скрывается и вызывает космическое бесплодие, иллюстрирует тайну разрушения творения его собственным создателем.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Телепинус — бог, который, разгневавшись, скрывается, т. е. исчезает из окружающего мира. Он не принадлежит к категории богов растительности, которые периодически умирают и возвращаются к жизни. Тем не менее, его отсутствие влечет за собой те же опустошительные последствия на всех уровнях космической жизни.",
        "source_ref": "Том 1, Глава VI, § 44",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 328, "text": "См. перевод хеттских и др. малоазийских текстов в кн.: Луна, упавшая с неба. Древняя литература Малой Азии. Перев. Вяч. Вс. Иванова. М., 1977." },
            { "num": 329, "text": "Мы употребляем здесь кавычки, чтобы показать, что во многих случаях мифы первоначально были хаттскими или хурритскими и попали к хеттам в переводе или переложении." },
            { "num": 330, "text": "Мы используем переводы: A. Goetze. — ANET, pp. 126–128, Güterbock. Mythologies of the Ancient World, p. 144 sq. et Vieyra. Les religions du Proche-Orient antique, p. 532 sq. См. также: Theodore Gaster. Thespis, pp. 302–309." },
            { "num": 331, "text": "Сходные умилостивительные ритуалы выполнялись жрецом; см. перевод текста в: Т. Gaster. Thespis, pp. 311–312." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "storm-god-defeats-dragon-illuyanka",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хеттская религия",
        "statement": "Новогодний миф о победе бога грозы над драконом Иллуянкой символизирует не космогонию, а борьбу за власть над миром и обеспечение стабильности.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Космогоническое значение мифа, очевидное в борьбе Мардука с Тиамат, заменилось соперничеством за власть над миром (ср.: Зевс-Тифон). Победа бога обеспечивает стабильность и процветание страны.",
        "source_ref": "Том 1, Глава VI, § 45",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "creation-from-demonic-matter", "label": "переосмысление мотива победы над драконом" } ],
        "references": [
            { "num": 332, "text": "Иллуянка, букв. «дракон», «змей», а также имя собственное." },
            { "num": 333, "text": "Переводы: A. Goetze. — ANET, pp. 125–126; Vieyra. Ор. cit., p. 526 sq." },
            { "num": 334, "text": "Apollodorus. Bibliotheke, 1, 6, 3." },
            { "num": 335, "text": "См.: Gaster. Thespis, pp. 259–260." },
            { "num": 336, "text": "См. текст (KUB XVII 95, III 9-17), перев. в: Gaster. Ор. cit., р. 267 sq. Ср. также: O.R. Gurney. The Hittites, p. 155. Другой текст относится к \"назначению судеб\" собраниями богов (см.: Gurney. Ор. cit., р. 152; idem. Hittite Kingship, p. 107 sq.)." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "succession-of-divine-generations-kumarbi",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хуррито-хеттская религия",
        "statement": "Хуррито-хеттская теогония описывает жестокую смену поколений богов, включающую оскопление предшественника и борьбу за верховную власть.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Вступительный эпизод \"О царствовании на небесах\", описывает смену первых богов. Вначале царем был Алалу... Ану напал на него... Кумарби в свою очередь напал на Ану... схватил за ногу и, откусив его \"филеи\", швырнул на землю.",
        "source_ref": "Том 1, Глава VI, § 46",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 337, "text": "Ссылка на хеттские переводы с хурритских текстов, сделанные около 1300 г. до н. э. Хурритская теогония отражает синкретизм с более ранними шумерскими и северо-сирийскими традициями." },
            { "num": 338, "text": "Первые переводчики предлагали другой эвфемизм — «колени». Оба слова заметают \"мужской половой орган\"." },
            { "num": 339, "text": "Согласно некоторым мифологическим фрагментам, похоже, что боги, находившиеся «внутри» Кумарби, обсуждали с ним вопрос о том, через какие отверстия его тела им появиться (Ср.: Güterbock. Ор. cit., pp. 157–158)." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "petra-genitrix-ullikummi",
        "period": "II тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Анатолия",
        "religion": "Хуррито-хеттская религия",
        "statement": "Миф о рождении каменного гиганта Улликумме от союза бога со скалой отражает архаичный мотив petra genitrix (происхождение от камня) и мегалитическую символику мирового столпа.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Плодом этого союза стал Улликумме, каменное антропоморфное существо... Можно сказать, что petra genitrix [происхождение от камня] усиливает сакральность Матери Земли чудесными качествами, которыми, по поверью, обладают камни.",
        "source_ref": "Том 1, Глава VI, § 46",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "megalithic-cult-of-dead", "label": "развитие мегалитической символики камня" } ],
        "references": [
            { "num": 340, "text": "В действительности, первая битва Митры, когда он только что вышел из родившей его скалы, была с Солнцем. Одержав победу, он отнял у Солнца его лучистую корону. Но вскоре после этого оба бога установили дружеские отношения, скрепив их рукопожатием." }
        ],
        "seshat": {
            "nga_name": "Anatolia",
            "year_from": -2000,
            "year_to": -1000,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "divine-succession-justifies-world-order",
        "period": "II тысячелетие до н. э. - I тысячелетие до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ближневосточные религии",
        "statement": "Мифы о борьбе и смене поколений богов служат оправданием власти победившего бога и объясняют текущее устройство вселенной.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Подводя итог, отметим, что все мифы, повествующие о борьбе между сменяющими друг друга поколениями богов за главенство, с одной стороны, оправдывают позицию последнего победившего бога, а с другой стороны, объясняют существующее строение мира и актуальное состояние человечества.",
        "source_ref": "Том 1, Глава VI, § 47",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "succession-of-divine-generations-kumarbi", "label": "обобщение мотива смены поколений" } ],
        "references": [
            { "num": 341, "text": "Некоторые фрагменты его \"Финикийской истории\" сохранили Эвсебий и Порфирий. Филон утверждает, что он суммировал произведения Санхонйатона, финикийского ученого, который, как предполагают, жил \"до Троянской войны\". Ср.: Clemen. Die Phönikische Religion, p. 28." },
            { "num": 342, "text": "Лишь спустя тридцать два года Элу удалось оскопить Урана. Два акта — кастрация отца и захват его власти, нераздельные в хуррито-хеттских и греческих мифах, здесь разделены." },
            { "num": 343, "text": "Ср. имена божеств Ану, Иштар и, возможно, Алалу; некий бог Алала фигурирует в вавилонском списке, как один из предков Ану (Güterbock. Ор. cit., р. 160)." }
        ],
        "seshat": {
            "nga_name": "Levant",
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
        "concept_id": "el-as-deus-otiosus",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Верховный бог-творец Илу (Эл) постепенно превращается в deus otiosus (праздного бога), уступая активную власть молодому богу плодородия Баалу.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Замена старого демиурга более энергичным молодым богом, «специалистом» по вселенскому плодородию — довольно распространенное явление. Часто демиург становился deus otiosus и все дальше и дальше отходил от своего творения.",
        "source_ref": "Том 1, Глава VI, § 48",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 348, "text": "В данной главе используются угаритские варианты имен общесемитских божеств (см. \"Мифы народов мира\")." },
            { "num": 349, "text": "Ab, «отец» — один из наиболее часто встречающихся эпитетов; ср. также ab adm, \"отец человечества\" (см.: М.Н. Pope. El in the Ugaritic texts, p. 47 sq.)." },
            { "num": 350, "text": "F.A. Schaeffer. The Cuneiform Texts of Ras Shamra-Ugarit, pl. XXXI. pp. 60, 62." },
            { "num": 351, "text": "Однако в западно-семитских надписях Илу (Эл) называется \"создателем Земли\"\" см.: М.Н. Pope. — WdM., vol. 1, p. 280." },
            { "num": 352, "text": "Этот миф дал модель ритуала, проводившегося в начале каждого нового семилетнего цикла, и это доказывает, что в ранние времена Илу еще считался творцом плодородия земли — роль, которая позже перешла к Баалу. См.: Cyrus H. Gordon. Canaanite Mythologie, p. 185 sq.; Ulf Oldenburg. The Conflict between El and Baal in Canaanite Religion, p. 19 sq.; Cross. Canaanite Myth, p. 21 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "baal-storm-fertility-god",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Баал (Хадду) возвышается как молодой бог грозы, плодородия и воин, вступающий в борьбу за верховную власть.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Имя нарицательное баал (\"хозяин\") стало именем собственным. У него было также и личное имя — Хадду, т. е. Хадад... Он — источник и первопричина плодородия, но также и воин.",
        "source_ref": "Том 1, Глава VI, § 48",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 353, "text": "Согласно энциклопедии \"Мифы народов мира\" (Т. 1. С. 346) имя Дагон (финикийская форма), Даган означает «колос»." },
            { "num": 354, "text": "Имя Анат равным образом документируется в тех же регионах. Возможно, что Баала, как сына Дагана, принесли амореи; см.: Oldenburg. Ор. cit., р. 151 sq. В этом случае он слился с местным Баал-Хададом, ибо невозможно понять старую ханаанейскую религию без этого знаменитого семитского бога грозы и, следовательно, плодородия. Ср. также: Cross. Canaanite Myth and Hebrew Epic, p. 112 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "baal-defeats-yammu-sea",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Победа Баала над богом моря и рек Йамму символизирует триумф дождей над хаотическими водами и утверждение молодого бога как верховного владыки вселенной.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "С одной стороны, в плане земледельческой мифологии... триумф Баала означает победу дождя над морем и подземными водами... С другой стороны, борьба с водным драконом отражает явление молодого бога, как победителя и тем самым нового верховного владыки пантеона.",
        "source_ref": "Том 1, Глава VI, § 49",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "storm-god-defeats-dragon-illuyanka", "label": "параллель победы над водным хаосом" } ],
        "references": [
            { "num": 355, "text": "Ссылка на табличку VI AB, впервые опубликованную Ch. Virolleaud; ср. перевод в: Oldenburg, pp. 185–186. Текст интерпретировался учеными Кассато, Поупом и Ольденнбургом (р. 123) как сообщающий о нападении Баала и свержении Илу с трона." },
            { "num": 356, "text": "Он обращается к Асират: \"Дай одного из твоих сыновей, и я сделаю его царем\" (Cyrus Gordon. Ugaritic Manual, 49:1:16–18; Oldenburg, p. 112)." },
            { "num": 357, "text": "\"Разве я не уничтожил Йямму, любимого Илу? Разве я не уничтожил бога-реку, великого бога? Разве я не заткнул пасть Дракону? Я заткнул ему пасть! Я уничтожил извивающегося Змея, могучего, семиглавого!\" (перев. Oldenburg, p. 198; ср.: ANET, р. 137). Текст, следовательно, относится к первой победе Йямму над Баалом, за которой последовало его поражение (в этом случае, от Анат), что соотносится с хорошо известной мифологической темой: поражение бога чудовищным змеем и торжество его мести." },
            { "num": 358, "text": "Gordon. Ugaritic Manual, § 68: 28–31, перев. в: Caquot et Sznycer. Les religions du Proche-Orient antique, p. 389." },
            { "num": 359, "text": "Об этом см.: Oldenburg. Ор. cit., p. 130 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "bloodthirsty-fertility-goddess-anat",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Убийственная ярость и кровавая бойня, устроенная богиней Анат, отражают архаичные черты богинь любви и войны, неразрывно связывающих плодородие с разрушением.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Вскоре после этого богиня запирает дворец и, впав в убийственную ярость, начинает умерщвлять стражу, солдат, стариков... Кровавая бойня и каннибализм — характерные черты архаических богинь плодородия.",
        "source_ref": "Том 1, Глава VI, § 50",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 360, "text": "Поскольку кровь рассматривается как сущность жизни, предполагалось видеть в этом кровопролитии обряд, имеющий целью переход от бесплодия позднего сирийского лета к плодородию нового времени года; ср.: Gray. The Legacy of Canaan, p. 36. Текст переведен в: Caquot et Sznycer, pp. 393–394." },
            { "num": 361, "text": "В дошедшем до нас виде египетский миф уже не относится к примитивной стадии; см. выше, § 26. Сравнение с Дургой, на котором настаивает М. Поп (см. последний выпуск WdM, vol. I, p. 239), уже было сделано ранее (см.: Walter Dostal. Ein Beitrag, p. 74 sq.)." },
            { "num": 362, "text": "Текст опубликован в: Virolleaud. Un nouvel épisode du mythe ugaritique de Baal, p. 182 sq.; ср.: Albright. Yahweh and the Gods of Canaan, p. 131 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "temple-building-as-cosmogony-baal",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Возведение храма-дворца для победившего Баала символизирует космогонический акт — формирование упорядоченного мира и регуляцию космических ритмов.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Храм-дворец, будучи imago mundi, самим процессом своего возведения некоторым образом соответствует космогонии. Действительно, побеждая водный «хаос», регулируя ритм дождей, Баал «формирует» мир таким, каким он выглядит сегодня.",
        "source_ref": "Том 1, Глава VI, § 50",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "dwelling-imago-mundi", "label": "храм как образ мира" } ],
        "references": [
            { "num": 363, "text": "Окна могли символизировать отверстия в облаках, откуда Баал посылал дождь. Ею храм в Угарите имел отверстие в крыше, через которое дождь падал на лицо бога, изображенное на стеле; ср.: Schaeffer. Ор. cit., р. 6, pl. XXXII, fig. 2. Но символика и функции отверстий на крыше сложнее; см., в частности: А.К. Coomaraswamy. The Symbolism of the Dome." },
            { "num": 364, "text": "Лорен Р. Фишер отличает термин \"творение по типу Баала\" от \"творения по типу Илу\"\" ср.: Creation at Ugarit, p. 320 sq." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "baal-descent-and-death",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Баал, бог грозы и верховный владыка, спускается в подземный мир и терпит поражение от Муту (Смерти), разделяя судьбу умирающих богов растительности.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Угаритский миф представляет интерес с той точки зрения, что Баал, молодой бог грозы и плодородия и еще недавно глава пантеона, спускается в подземный мир и погибает, подобно Таммузу и другим богам растительности.",
        "source_ref": "Том 1, Глава VI, § 51",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "dying-and-rising-god-dumuzi", "label": "параллель с умирающим богом" } ],
        "references": [
            { "num": 365, "text": "Ugaritic Manual, § 67: 1: 1–8, перевод в: Oldenburg, p. 133." },
            { "num": 366, "text": "Driver. Ор. cit., р. 109; Caquot et Sznycer, pp. 424–425." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "ritual-destruction-of-death-mutu",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Богиня Анат ритуально уничтожает бога смерти Муту, поступая с ним как с зерном, что приводит к воскресению Баала и восстановлению космического плодородия.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Схватив его, \"она режет его ножом; через сито просеивает его; на огне поджаривает его; мельницей размалывает его; на полях она засеивает его, и птицы поедают его\". Анат выполняет род ритуального убийства, поступая с Муту, как с колосом злака.",
        "source_ref": "Том 1, Глава VI, § 51",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 367, "text": "Driver, p. 111; Caquot et Sznycer, p. 430." },
            { "num": 368, "text": "Предполагалось видеть в Муту \"духа урожая\", но его «погребальные» черты слишком очевидны: он живет в подземном мире или в пустыне, и все, к чему он прикасается, обречено на запустение." },
            { "num": 369, "text": "Driver, p. 119." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "integration-of-death-into-cosmic-rhythm",
        "period": "XIV–XII вв. до н. э.",
        "era": "Бронзовый век",
        "territory": "Ханаан",
        "religion": "Ханаанейская религия",
        "statement": "Ханаанейская мифология интегрирует негативные силы (хаос моря Йамму и смерть Муту) в единую систему космических ритмов, утверждая смерть как необходимое условие жизни.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "То, что Муту — сын Илу, и, главное, то, что Баал не способен уничтожить его, утверждает нормальность смерти. Смерть оказывается, в конце концов, условием sine qua поп жизни.",
        "source_ref": "Том 1, Глава VI, § 52",
        "is_dead_end": False,
        "connections": [],
        "references": [
            { "num": 370, "text": "Ср.: Cyrus Gordon. Canaanite Mythology, pp. 184, 195 sq.; M. Pope. — WdM, vol. 1, pp. 262–264." },
            { "num": 371, "text": "Только в буддистской мифологии есть еще один великий бог смерти — Мара, который обязан своей огромной властью именно человеческой слепой любви к жизни. Однако в пост-упанишадской перспективе цикл \"жизнь-сексуальность-смерть-возвращение к жизни\" — это самое большое препятствие на пути к освобождению (см. том II)." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1400,
            "year_to": -1100,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    },
    {
        "concept_id": "yahweh-vs-baal-conflict",
        "period": "Конец II тысячелетия до н. э. - I тысячелетие до н. э.",
        "era": "Железный век",
        "territory": "Израиль/Ханаан",
        "religion": "Яхвизм",
        "statement": "Столкновение израильтян с ханаанейской космической религией привело к длительному конфликту между культом циклично умирающего Баала и Яхве, требующим внутренней трансформации и покорности.",
        "is_first_occurrence": True,
        "first_occurrence_type": "implicit",
        "quote": "Идеология эта включает... теологию, построенную вокруг цикличного существования главного бога, Баала, символа целостности вселенной. Образ существования Яхве — другой... он требовал от своих почитателей внутренней трансформации, основанной на покорности и доверии",
        "source_ref": "Том 1, Глава VI, § 52",
        "is_dead_end": False,
        "connections": [ { "target_concept_id": "baal-storm-fertility-god", "label": "религиозный конфликт идеологий" } ],
        "references": [
            { "num": 372, "text": "De Vaux. Histoire ancienne d'Israël, vol. 1, pp. 147–148." }
        ],
        "seshat": {
            "nga_name": "Levant",
            "year_from": -1200,
            "year_to": -800,
            "mapping_confidence": "high",
            "nga_id": None,
            "polity_id": None,
            "religion_id": None,
            "enriched": False
        }
    }
]

output = {
    "volume": 1,
    "chapter_num": 6,
    "chapter_title": "Глава VI РЕЛИГИЯ ХЕТТОВ И ХАНААНЕЕВ",
    "source_file": "data/vol1/chapters/ch07.txt",
    "events": events
}

with open(REPO_ROOT / ".scratch" / "religion-map" / "vol1" / "ch06-events.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

# Update registry
with open(REPO_ROOT / ".scratch" / "religion-map" / "concept-registry.json", "r", encoding="utf-8") as f:
    registry = json.load(f)

for event in events:
    concept_id = event["concept_id"]
    if concept_id not in registry["concepts"]:
        registry["concepts"][concept_id] = {
            "first_seen_volume": 1,
            "first_seen_chapter": 6,
            "first_seen_chapter_title": "Глава VI РЕЛИГИЯ ХЕТТОВ И ХАНААНЕЕВ",
            "source_ref": event["source_ref"]
        }

with open(REPO_ROOT / ".scratch" / "religion-map" / "concept-registry.json", "w", encoding="utf-8") as f:
    json.dump(registry, f, ensure_ascii=False, indent=2)

print("Done generating JSON and updating registry.")
