import { Mascot } from '../components/Mascot'
import { useStore } from '../store'
import { useToast } from '../components/Toast'

export function QuestsSoon() {
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="mb-6 flex items-center gap-5 rounded-[24px] bg-gold-light px-6 py-5">
        <Mascot mood="think" size={96} className="shrink-0" />
        <div>
          <span className="rounded-full bg-gold px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-[#5a3d00]">Скоро</span>
          <h1 className="mt-2 text-[24px] font-black leading-tight">Задания</h1>
          <p className="text-[15px] font-semibold text-muted">Еженедельные челленджи и награды появятся в следующих версиях.</p>
        </div>
      </div>
      <div className="card relative overflow-hidden p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-extrabold uppercase tracking-wider text-brand">Октябрьский вызов · превью</span>
          <span className="rounded-full bg-snow px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-muted">Скоро</span>
        </div>
        <h2 className="mt-2 text-[20px] font-black">Собери 3 мини-приложения с ИИ</h2>
        <p className="mt-1 text-[15px] font-semibold text-muted">Лендинг, todo-список и бот — и получи эксклюзивный значок.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {['🌐 Лендинг', '✅ Todo', '🤖 Бот'].map((t) => (
            <div key={t} className="rounded-2xl border-2 border-dashed border-line py-4 text-center text-[15px] font-extrabold text-muted">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MoreSoon() {
  const { logout } = useStore()
  const toast = useToast()
  const items = ['Настройки', 'Магазин', 'Помощь', 'Пригласить друзей']
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="flex flex-col items-center py-6 text-center">
        <Mascot mood="think" size={130} />
        <h1 className="mt-3 text-[26px] font-black">Скоро здесь будет больше</h1>
        <p className="mt-1 text-[16px] font-semibold text-muted">Эти разделы ещё в разработке.</p>
      </div>
      <div className="card divide-y-2 divide-line">
        {items.map((t) => (
          <button key={t} onClick={() => toast(`«${t}» — скоро 🙂`)} className="flex w-full items-center justify-between px-5 py-4 text-left text-[17px] font-extrabold hover:bg-snow">
            {t}
            <span className="rounded-full bg-snow px-2.5 py-1 text-[12px] font-black uppercase tracking-wider text-muted">Скоро</span>
          </button>
        ))}
        <button onClick={logout} className="flex w-full items-center px-5 py-4 text-left text-[17px] font-extrabold text-coral-dark hover:bg-coral-light/50">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
