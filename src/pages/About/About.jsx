import about from '../../data/about'

function renderLines(lines) {
  return lines.map((text, i) => (
    <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
  ))
}

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs tracking-[0.2em] text-ink-muted uppercase mb-8 font-medium">
        Sanctuary
      </p>

      <h1 className="font-serif text-3xl font-semibold text-ink mb-10 tracking-tight">
        {about.header}
      </h1>

      <div className="w-8 h-px bg-amber mb-10" />

      <div className="prose max-w-none">
        <p>{about.intro}</p>
        {renderLines(about.paragraphs)}

        <h2>{about.author.heading}</h2>
        {renderLines(about.author.lines)}

        <h2>{about.tech.heading}</h2>
        {renderLines(about.tech.lines)}
        <ul>
          {about.tech.features.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>

        <h2>{about.why.heading}</h2>
        {renderLines(about.why.lines)}
      </div>

      <div className="mt-16 flex items-center gap-3">
        <span className="flex-1 h-px bg-rule" />
        <span className="w-1 h-1 rounded-full bg-amber/50" />
        <span className="flex-1 h-px bg-rule" />
      </div>
    </div>
  )
}
