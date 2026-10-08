export type NodeKind = 'star' | 'book' | 'dumbbell' | 'chest' | 'trophy'
export type UnitColor = 'brand' | 'coral' | 'teal'

export interface Lesson {
  id: string
  title: string
  kind: NodeKind
}

interface ExerciseBase {
  title: string
  /** Реплика маскота / условие задачи */
  prompt?: string
  explain: string
}

export interface ChoiceExercise extends ExerciseBase {
  kind: 'choice'
  options: string[]
  correct: number
  /** если true — варианты показываются как промпты (моноширинным/цитатой) */
  quoted?: boolean
}
export interface ArrangeExercise extends ExerciseBase {
  kind: 'arrange'
  /** Правильный порядок фрагментов */
  tiles: string[]
  distractors: string[]
}
export interface BugExercise extends ExerciseBase {
  kind: 'bug'
  file: string
  code: string[]
  correct: number
}
export interface FillExercise extends ExerciseBase {
  kind: 'fill'
  before: string
  after: string
  options: string[]
  correct: number
}
export type Exercise = ChoiceExercise | ArrangeExercise | BugExercise | FillExercise

export interface Unit {
  id: string
  num: number
  title: string
  subtitle: string
  color: UnitColor
  lessons: Lesson[]
  exercises: Exercise[]
}

export const UNIT_COLORS: Record<UnitColor, { main: string; dark: string; light: string; mid: string }> = {
  brand: { main: '#7C4DFF', dark: '#5B2FD6', light: '#EFE9FF', mid: '#C7B6FF' },
  coral: { main: '#FF7A59', dark: '#E0573A', light: '#FFE9E2', mid: '#FFC2B2' },
  teal: { main: '#13C2AE', dark: '#0E9C8C', light: '#DCF8F3', mid: '#9BE7DD' },
}

export const UNITS: Unit[] = [
  {
    id: 'u1',
    num: 1,
    title: 'Первый промпт',
    subtitle: 'Учимся ясно ставить задачу ИИ',
    color: 'brand',
    lessons: [
      { id: 'u1-1', title: 'Что такое вайб-кодинг', kind: 'star' },
      { id: 'u1-2', title: 'Контекст решает', kind: 'book' },
      { id: 'u1-3', title: 'Роль и формат ответа', kind: 'star' },
      { id: 'u1-4', title: 'Итерации вместо «с нуля»', kind: 'dumbbell' },
      { id: 'u1-5', title: 'Итоговый тест раздела', kind: 'trophy' },
    ],
    exercises: [
      {
        kind: 'choice',
        title: 'Какой промпт лучше?',
        prompt: 'Нужен сайт для кофейни. Какой запрос даст ИИ лучший результат?',
        quoted: true,
        options: [
          'Сделай сайт',
          'Сделай одностраничный сайт для кофейни «Зерно» на React + Tailwind: шапка с логотипом, меню с ценами, карта и кнопка «Заказать». Стиль тёплый и минималистичный.',
          'сайт кофейня быстро красиво!!!',
        ],
        correct: 1,
        explain: 'Хороший промпт называет цель, стек, структуру и стиль. Чем меньше ИИ приходится угадывать, тем ближе результат к задуманному.',
      },
      {
        kind: 'arrange',
        title: 'Собери понятный промпт',
        prompt: 'Попроси ИИ сделать форму входа. Расставь фрагменты по порядку.',
        tiles: ['Ты — опытный React-разработчик.', 'Создай компонент формы входа', 'с полями email и пароль', 'и показывай ошибки под полями.'],
        distractors: ['Сделай как-нибудь.', 'без проверки полей'],
        explain: 'Сначала роль, затем задача, детали и ожидаемое поведение. Такой порядок читается как техзадание.',
      },
      {
        kind: 'fill',
        title: 'Заполни пропуск',
        prompt: 'ИИ сделал почти то, что нужно, но кнопка не того цвета.',
        before: 'Лучше всего',
        after: '— коротко уточнить, что именно поправить, не начиная проект заново.',
        options: ['итерировать', 'удалить весь код', 'написать «не то»'],
        correct: 0,
        explain: 'Вайб-кодинг — это цикл: промпт → результат → уточнение. Маленькие точные правки работают лучше, чем «перепиши всё».',
      },
      {
        kind: 'choice',
        title: 'Что такое вайб-кодинг?',
        options: [
          'Программирование под музыку в наушниках',
          'Создание софта, когда ты описываешь задачу словами, ИИ пишет код, а ты проверяешь и направляешь результат',
          'Новый язык программирования для нейросетей',
        ],
        correct: 1,
        explain: 'Термин «vibe coding» ввёл Андрей Карпати в феврале 2025 года: ты ведёшь диалог с ИИ, а он пишет код. Но проверять результат всё равно тебе!',
      },
      {
        kind: 'bug',
        title: 'Найди строку с ошибкой',
        prompt: 'ИИ написал функцию суммы корзины, но она возвращает NaN. Нажми на строку с багом.',
        file: 'cart.js',
        code: [
          'function total(prices) {',
          '  let sum = 0;',
          '  for (let i = 0; i <= prices.length; i++) {',
          '    sum += prices[i];',
          '  }',
          '  return sum;',
          '}',
        ],
        correct: 2,
        explain: 'Условие «i <= prices.length» выходит за границу массива: последний prices[i] — undefined, и сумма становится NaN. Нужно «<».',
      },
    ],
  },
  {
    id: 'u2',
    num: 2,
    title: 'Создаём лендинг',
    subtitle: 'От идеи до живой страницы',
    color: 'coral',
    lessons: [
      { id: 'u2-1', title: 'Структура страницы', kind: 'star' },
      { id: 'u2-2', title: 'Стили и Tailwind', kind: 'book' },
      { id: 'u2-3', title: 'Адаптив под телефоны', kind: 'star' },
      { id: 'u2-4', title: 'Форма заявки', kind: 'dumbbell' },
      { id: 'u2-5', title: 'Деплой и сундук', kind: 'chest' },
    ],
    exercises: [
      {
        kind: 'choice',
        title: 'Что добавить в промпт?',
        prompt: 'Лендинг уже готов, но на телефоне всё разъехалось. Как лучше попросить ИИ?',
        quoted: true,
        options: [
          'Сделай чтобы работало',
          'Используй больше пикселей',
          'Сделай вёрстку mobile-first: до 640px — одна колонка, меню сворачивается в «бургер», шрифт не меньше 16px.',
        ],
        correct: 2,
        explain: 'Назови конкретные брейкпоинты и поведение элементов. «Сделай чтобы работало» оставляет ИИ гадать.',
      },
      {
        kind: 'bug',
        title: 'Найди строку с ошибкой',
        prompt: 'Счётчик от ИИ зависает с ошибкой «Too many re-renders». Где баг?',
        file: 'Counter.jsx',
        code: [
          'function Counter() {',
          '  const [count, setCount] = useState(0);',
          '  return (',
          '    <button onClick={setCount(count + 1)}>',
          '      Нажато: {count}',
          '    </button>',
          '  );',
          '}',
        ],
        correct: 3,
        explain: 'setCount вызывается сразу при рендере, а не по клику. Нужно передать функцию: onClick={() => setCount(count + 1)}.',
      },
      {
        kind: 'arrange',
        title: 'Собери промпт для блока цен',
        prompt: 'Добавь на лендинг секцию с тарифами.',
        tiles: ['Добавь секцию «Тарифы»', 'с тремя карточками в ряд,', 'выдели средний тариф', 'и добавь в каждую кнопку «Купить».'],
        distractors: ['в Excel', 'без текста'],
        explain: 'Что добавить → как расположить → что выделить → какие действия. Конкретика экономит итерации.',
      },
      {
        kind: 'fill',
        title: 'Заполни пропуск',
        prompt: 'Карточки должны идти в 1 колонку на телефоне и в 3 — на десктопе.',
        before: 'Попроси ИИ добавить классы Tailwind: grid grid-cols-1 md:',
        after: '',
        options: ['grid-cols-3', 'flex-row-3', 'columns-mobile'],
        correct: 0,
        explain: 'В Tailwind префикс md: включает класс начиная с ширины 768px. grid-cols-3 — сетка из трёх колонок.',
      },
      {
        kind: 'choice',
        title: 'Где хранить секретный ключ?',
        prompt: 'ИИ вставил API-ключ платёжки прямо в код. Как правильно?',
        options: [
          'Оставить в коде фронтенда — так проще',
          'Хранить на сервере в переменных окружения (.env) и не коммитить в git',
          'Записать в README, чтобы не потерять',
        ],
        correct: 1,
        explain: 'Всё, что попадает во фронтенд, видно любому пользователю. Секреты — только на сервере, а .env — в .gitignore.',
      },
    ],
  },
  {
    id: 'u3',
    num: 3,
    title: 'Отладка с ИИ',
    subtitle: 'Чиним баги вместе с нейросетью',
    color: 'teal',
    lessons: [
      { id: 'u3-1', title: 'Читаем ошибку', kind: 'star' },
      { id: 'u3-2', title: 'Стектрейс в чат', kind: 'book' },
      { id: 'u3-3', title: 'Ревью кода от ИИ', kind: 'star' },
      { id: 'u3-4', title: 'Пишем тесты', kind: 'dumbbell' },
      { id: 'u3-5', title: 'Финал раздела', kind: 'trophy' },
    ],
    exercises: [
      {
        kind: 'fill',
        title: 'Заполни пропуск',
        prompt: 'В консоли красная ошибка. Что отправить ИИ?',
        before: 'Вставь в чат',
        after: 'ошибки и фрагмент кода, который к ней привёл.',
        options: ['полный текст', 'только цвет', 'своё настроение'],
        correct: 0,
        explain: 'Полный текст ошибки со стектрейсом показывает файл и строку. Без него ИИ будет чинить вслепую.',
      },
      {
        kind: 'bug',
        title: 'Найди строку с ошибкой',
        prompt: 'Функция загрузки пользователя всегда падает с «Ошибка». Где баг?',
        file: 'api.js',
        code: [
          'async function loadUser(id) {',
          '  const res = fetch(`/api/users/${id}`);',
          "  if (!res.ok) throw new Error('Ошибка');",
          '  return res.json();',
          '}',
        ],
        correct: 1,
        explain: 'fetch возвращает Promise. Без await в res лежит промис, у которого нет поля ok. Нужно: const res = await fetch(...).',
      },
      {
        kind: 'choice',
        title: 'Что делать дальше?',
        prompt: 'ИИ «исправил» баг, но сломалось что-то другое.',
        options: [
          'Откатиться к рабочей версии через git и описать проблему точнее',
          'Писать «почини» снова и снова без деталей',
          'Удалить тесты, чтобы не мешали',
        ],
        correct: 0,
        explain: 'Коммить рабочие состояния почаще: так любую неудачную правку ИИ можно откатить за секунду.',
      },
      {
        kind: 'arrange',
        title: 'Собери промпт для отладки',
        prompt: 'Список товаров не отображается, в консоли ошибка.',
        tiles: ['Вот ошибка из консоли:', "TypeError: cannot read 'map' of undefined.", 'Объясни причину', 'и предложи минимальное исправление.'],
        distractors: ['перепиши всё с нуля', 'срочно!!!'],
        explain: 'Ошибка → просьба объяснить → минимальный фикс. Так ты и учишься, и не получаешь лишних изменений.',
      },
      {
        kind: 'bug',
        title: 'Найди строку с ошибкой',
        prompt: 'В консоль выводится [undefined, undefined]. Почему?',
        file: 'users.js',
        code: [
          'const users = await getUsers();',
          'const names = users.map(u => { u.name });',
          'console.log(names);',
        ],
        correct: 1,
        explain: 'Стрелочная функция с фигурными скобками ничего не возвращает без return. Нужно u => u.name.',
      },
    ],
  },
]

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l, i) => ({ ...l, unit: u, index: i })))

export function findLesson(id: string) {
  return ALL_LESSONS.find((l) => l.id === id)
}

export function currentLessonId(completed: string[]) {
  return ALL_LESSONS.find((l) => !completed.includes(l.id))?.id ?? null
}
