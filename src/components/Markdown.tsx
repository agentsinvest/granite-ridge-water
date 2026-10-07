import { publicText } from '../lib/publicText'

/** The small slice of markdown used in action files: paragraphs and "* " bullet lists. */
export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const lines = b.split('\n')
        if (lines.every((l) => /^[*-] /.test(l)))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l) => (
                <li key={l}>{publicText(l.slice(2))}</li>
              ))}
            </ul>
          )
        return (
          <p key={i} className="max-w-prose">
            {publicText(lines.join(' '))}
          </p>
        )
      })}
    </div>
  )
}
