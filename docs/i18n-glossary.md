# Глоссарий переводов Вайбика (ru → en · kk · es · zh-CN)

Единые термины для курса, домашек и интерфейса. Русский — источник. Если термин меняется — меняем во всех файлах
`src/i18n/content/<locale>/*` и `src/i18n/ui/<locale>.ts` сразу (поиск по старому слову).

Общие правила:
- **Тон**: дружелюбный, на «ты». en — simple, direct; es — «tú», нейтральный латиноамериканский (без vosotros и
  без регионального сленга: «computadora», «celular» → используем нейтральное «teléfono»); kk — «сен»; zh — «你».
- **Не переводим**: код, идентификаторы, имена файлов, CLI-команды, имена переменных окружения (`VITE_…`), HTTP-коды,
  реальные сообщения инструментов (`TypeError: …`, `Too many re-renders`, `formatPrice is not defined`), имена продуктов
  (Cursor, Claude Code, v0, Lovable, Bolt, Supabase, Vercel, GitHub, Tailwind, Stripe, Telegram, Plan Mode).
- **Кавычки**: en/es — “…” ; kk — «…» (как в ru); zh — “…”. В промптах-примерах внутри строк — так же.
- **Деньги в примерах-упражнениях**: kk оставляет ₸; en/es — $ (суммы пересчитаны в правдоподобные: 12 000 ₸ → $120);
  zh — ¥ (12 000 ₸ → ¥120). Цены тарифов продукта — всегда USD (`usd()`), это не перевод.
- **Имена и названия в примерах**: кофейня «Зерно» → Zerno (бренд-имя, не переводим) во всех языках; «Тёплый дом» →
  Warm Home / Hogar Cálido / «Жылы үй» / 暖家; кружка «Термо» → Thermo / Termo / «Термо» / Thermo.
  Домены `zerno-coffee.ru` → `zerno-coffee.com` (en/es/zh), `zerno-coffee.kz` (kk).

## Бренд и экономика

| ru | en | kk | es | zh |
|---|---|---|---|---|
| Вайбик | Vaibik | Вайбик | Vaibik | Vaibik（Vaibik · AI 氛围编程） |
| Бипи (маскот) | Bipi | Бипи | Bipi | Bipi |
| Заряд Бипи | Bipi charge | Бипи заряды | carga de Bipi | Bipi 电量 |
| деление заряда | bar | бөлік | barra | 格 |
| токены | tokens | токендер | tokens | 代币 |
| деплой-серия | deploy streak | деплой сериясы | racha de deploys | 部署连胜 |
| вайб-поинты (ВП) | vibe points (VP) | вайб-ұпайлар (ВҰ) | puntos vibe (PV) | 氛围值 (VP) |
| Вайб-метр | Vibe meter | Вайб-метр | Vibe-metro | 氛围计 |
| лига | league | лига | liga | 联赛 |
| Подсказка Бипи | Bipi hint | Бипи кеңесі | pista de Bipi | Bipi 提示 |
| подзарядка | recharge | толық зарядтау | recarga | 充电 |
| Pro / пробный период | Pro / free trial | Pro / сынақ кезеңі | Pro / prueba gratis | Pro / 免费试用 |

## Структура курса

| ru | en | kk | es | zh |
|---|---|---|---|---|
| раздел | unit | бөлім | unidad | 单元 |
| урок | lesson | сабақ | lección | 课 |
| упражнение | exercise | жаттығу | ejercicio | 练习 |
| домашка (мини-проект) | homework | үй жұмысы | tarea | 作业 |
| Итоговый тест раздела | Unit final test | Бөлімнің қорытынды тесті | Examen final de la unidad | 单元总测验 |
| Сундук / Кубок | Chest / Trophy | Сандық / Кубок | Cofre / Trofeo | 宝箱 / 奖杯 |
| Тест на уровень | Placement test | Деңгей тесті | Prueba de nivel | 分级测试 |
| тир: Новичок / Средний / Продвинутый | Beginner / Intermediate / Advanced | Бастаушы / Орта / Озық | Principiante / Intermedio / Avanzado | 入门 / 进阶 / 高级 |
| ловушка (чип) | trap | тұзақ | trampa | 陷阱 |
| Прокачай промпт | Level up the prompt | Промптты күшейт | Mejora el prompt | 升级提示词 |
| Дуэль промптов | Prompt duel | Промпт жекпе-жегі | Duelo de prompts | 提示词对决 |
| Следующий ход | Next move | Келесі қадам | Siguiente jugada | 下一步 |
| Ревью правок | Review the changes | Түзетулерді тексер | Revisa los cambios | 审查改动 |
| Найди баг / Красный флаг | Find the bug / Red flag | Багты тап / Қызыл жалау | Encuentra el bug / Señal de alerta | 找 Bug / 危险信号 |
| Собери пайплайн | Build the pipeline | Пайплайнды құрастыр | Arma el pipeline | 排好流程 |

## Вайб-кодинг и промпты

| ru | en | kk | es | zh |
|---|---|---|---|---|
| вайб-кодинг | vibe coding | вайб-кодинг | vibe coding | 氛围编程 |
| ИИ | AI | ЖИ | la IA | AI |
| промпт | prompt | промпт | prompt | 提示词 |
| контекст | context | контекст | contexto | 上下文 |
| роль | role | рөл | rol | 角色 |
| формат ответа | response format | жауап форматы | formato de respuesta | 回复格式 |
| ограничение | constraint | шектеу | restricción | 约束 |
| критерий готовности | done criterion | дайын болу критерийі | criterio de “listo” | 完成标准 |
| уточнение / итерация | follow-up / iteration | нақтылау / итерация | ajuste / iteración | 追问 / 迭代 |
| галлюцинация | hallucination | галлюцинация | alucinación | 幻觉 |
| окно контекста | context window | контекст терезесі | ventana de contexto | 上下文窗口 |
| ИИ-редактор / агент | AI editor / agent | ЖИ-редактор / агент | editor con IA / agente | AI 编辑器 / 智能体 |
| чекпоинт | checkpoint | чекпоинт | checkpoint | 检查点 |
| дифф | diff | дифф | diff | diff（差异） |
| правка | change / edit | түзету | cambio | 改动 |

## Веб и разработка

| ru | en | kk | es | zh |
|---|---|---|---|---|
| лендинг | landing page | лендинг | landing page | 落地页 |
| первый экран (hero) | hero section | бірінші экран | sección principal (hero) | 首屏 |
| секция | section | секция | sección | 区块 |
| кнопка-призыв (CTA) | call to action (CTA) | әрекетке шақыру (CTA) | llamado a la acción (CTA) | 行动按钮（CTA） |
| адаптив / адаптивная вёрстка | responsive design | бейімделгіш вёрстка (адаптив) | diseño responsive | 响应式布局 |
| брейкпоинт | breakpoint | брейкпоинт | breakpoint | 断点 |
| консоль | console | консоль | consola | 控制台 |
| ошибка / баг | error / bug | қате / баг | error / bug | 错误 / bug |
| отладка | debugging | жөндеу (дебаг) | depuración | 调试 |
| база данных | database | дерекқор | base de datos | 数据库 |
| таблица | table | кесте | tabla | 表 |
| политика RLS | RLS policy | RLS саясаты | política RLS | RLS 策略 |
| вход / регистрация | sign-in / sign-up | кіру / тіркелу | inicio de sesión / registro | 登录 / 注册 |
| ключ (API) | key | кілт | clave | 密钥 |
| переменная окружения | environment variable | орта айнымалысы | variable de entorno | 环境变量 |
| коммит / push | commit / push | коммит / push | commit / push | 提交（commit）/ 推送（push） |
| репозиторий | repository (repo) | репозиторий | repositorio | 仓库 |
| деплой / задеплоить | deploy | деплой / деплой жасау | despliegue / desplegar | 部署 |
| превью-деплой | preview deployment | превью-деплой | despliegue de vista previa | 预览部署 |
| домен | domain | домен | dominio | 域名 |
| хостинг | hosting | хостинг | hosting | 托管平台 |
| аналитика | analytics | аналитика | analítica | 数据分析 |
| конверсия | conversion rate | конверсия | tasa de conversión | 转化率 |

## Интерфейс (UI-каталоги `src/i18n/ui/*.ts`)

| ru | en | kk | es | zh |
|---|---|---|---|---|
| Войти / Выйти из аккаунта | Log in / Sign out | Кіру / Аккаунттан шығу | Entrar / Cerrar sesión | 登录 / 退出登录 |
| Проверить / Продолжить / Понятно | Check / Continue / Got it | Тексеру / Жалғастыру / Түсінікті | Comprobar / Continuar / Entendido | 检查 / 继续 / 明白了 |
| Сдать домашку | Submit homework | Үй жұмысын тапсыру | Entregar tarea | 提交作业 |
| Тариф / Подписка | Plan / Subscription | Тариф / Жазылым | Plan / Suscripción | 方案 / 订阅 |
| пробный период | trial | сынақ мерзімі | periodo de prueba | 试用期 |
| зона повышения / понижения | promotion / demotion zone | көтерілу / төмендеу аймағы | zona de ascenso / descenso | 晋级区 / 降级区 |
| лиги: Бронза → Бирюза | Bronze, Silver, Gold, Coral, Turquoise, Amethyst | Қола, Күміс, Алтын, Маржан, Көгілдір, Аметист | Bronce, Plata, Oro, Coral, Turquesa, Amatista | 青铜、白银、黄金、珊瑚、绿松石、紫晶 |
| Отзыв (фидбек) | Feedback | Пікір | Opinión | 反馈 |
| Язык (раздел профиля) | Language | Интерфейс тілі | Idioma | 界面语言 |
| Названия языков в переключателе | English · Қазақша · Español · 中文 · Русский — всегда самоназвание, без флагов | | | |

UI-правила: «деление» заряда = bar / бөлік / barra / 格; «раздел» курса = unit / бөлім / unidad / 单元 (не «section» — это
секция страницы); цены тарифов — всегда USD через `formatUsd`; цены в превью-меню кофейни — местные (₸ / $ / ¥).
В демо-лиге имена ботов локализованы (Demo Dina / Демо Дина / Demo Dina / 演示·迪娜 …).

## Спорные места (на ревью носителю)

- **kk «ЖИ»** (жасанды интеллект) — официальный термин, но в IT-речи часто говорят просто «AI». Оставили «ЖИ» как
  нормативный вариант; при желании меняется поиском по `ЖИ` в `src/i18n/content/kk` и `src/i18n/ui/kk.ts`.
- **kk** «деплой», «коммит», «промпт», «лендинг», «баг» — заимствования, как в живой казахской IT-речи; падежные
  окончания по сингармонизму: промптты/промптқа, кодты/кодқа, коммитті/коммитке, деплойды/деплойға, лендингті/лендингке.
- **kk «орта айнымалысы»** (environment variable) — встречается и «қоршаған орта айнымалысы»; выбрали короткий вариант.
- **zh «氛围编程»** — самый распространённый перевод vibe coding в китайских медиа; в первом упоминании добавляем
  «（vibe coding）». «提示词» для prompt (а не «提示»), «智能体» для agent.
- **zh «代币»** для внутренней валюты «токены»: «令牌/词元» — это токены LLM, путаница была бы хуже.
- **es «racha de deploys»** — «despliegue» в тексте курса, но «deploy» в названии серии короче и звучит как игра.
- **UI kk «Озық»** (Продвинутый) — книжное слово; альтернатива «Жоғары деңгей». **kk «ВҰ»** — сокращение для вайб-ұпай.
- **zh «分级测试»** для «Тест на уровень» (в UI раньше было «定级测试» — унифицировано по глоссарию).
- **zh 100 字** — лимит слов в домашке hw1 для китайского заменён на 100 иероглифов (ru «60 слов»).

