import type { NextMoveExercise } from '../../data/types'
import { AiAvatar, AiBubble, FrameCard, Head, HintNote, MeBubble, type ViewProps } from './shared'
import { optState } from './meta'
import { t } from '../../i18n/core'
import { tx } from '../../i18n/rich'

/** «Следующий ход»: чат с ИИ, где ответ неидеален → выбери лучшее следующее сообщение */
export function NextMoveView({ ex, answer, setAnswer, status, hint }: ViewProps<NextMoveExercise>) {
  const idle = status === 'idle'
  const sent = typeof answer === 'number' && !idle ? ex.options[answer] : null
  return (
    <div>
      <Head kind="nextmove" title={ex.title} prompt={ex.prompt} />
      <FrameCard>
        <div className="flex items-center gap-2 border-b-2 border-line bg-snow px-3.5 py-2">
          <AiAvatar size={22} />
          <span className="text-[13px] font-black">{t('x0lc5f4x')}</span>
          <span className="ml-1 h-2 w-2 rounded-full bg-teal" />
          <span className="text-[12px] font-bold text-muted">{t('x1pjowqn')}</span>
        </div>
        <div className="space-y-3 bg-[#FBFAFE] p-3.5">
          {ex.chat.map((m, i) => (m.from === 'me' ? <MeBubble key={i} text={m.text} /> : <AiBubble key={i} text={m.text} code={m.code} preview={m.preview} />))}
          {sent && (
            <div className="vx-send">
              <MeBubble text={sent} />
              <div className={`mt-1 text-right text-[12px] font-black ${status === 'correct' ? 'text-teal-dark' : 'text-coral-dark'}`}>
                {status === 'correct' ? t('x1vxs15u') : t('x1os7oiq')}
              </div>
            </div>
          )}
          {idle && (
            <div className="flex items-center gap-2 text-[12px] font-extrabold text-muted">{tx('x1bdg1ea', {}, [() => <span className="h-[2px] flex-1 rounded bg-line" />, () => <span className="h-[2px] flex-1 rounded bg-line" />])}</div>
          )}
        </div>
      </FrameCard>

      <div className="mb-2.5 mt-5 text-[16px] font-black">{t('x1mxa2gg')}</div>
      <HintNote hint={hint} />
      <div className="grid gap-2.5">
        {ex.options.map((o, i) => {
          const dim = hint?.dim?.includes(i) && idle
          return (
            <button
              key={i}
              type="button"
              disabled={!idle || dim}
              onClick={() => setAnswer(i)}
              data-option={i}
              className={`tile flex items-start gap-3 px-3.5 py-3 ${optState(i, answer, status, ex.correct)} ${dim ? 'line-through opacity-40' : ''}`}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-current text-[13px]" aria-hidden>
                ➤
              </span>
              <span className="min-w-0 text-[15px] font-bold leading-snug">{o}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
