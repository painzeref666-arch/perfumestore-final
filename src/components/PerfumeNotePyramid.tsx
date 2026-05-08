import React from 'react';

type Props = {
  notes: string[];
  className?: string;
};

function splitNotes(notes: string[]) {
  const clean = notes.filter(Boolean);
  if (clean.length <= 3) {
    return {
      top: clean.slice(0, 1),
      heart: clean.slice(1, 2),
      base: clean.slice(2, 3),
    };
  }
  return {
    top: clean.slice(0, Math.ceil(clean.length / 3)),
    heart: clean.slice(Math.ceil(clean.length / 3), Math.ceil((clean.length * 2) / 3)),
    base: clean.slice(Math.ceil((clean.length * 2) / 3)),
  };
}

export default function PerfumeNotePyramid({ notes, className = '' }: Props) {
  const layers = splitNotes(notes.length ? notes : ['Citrus', 'Floral Heart', 'Amber Musk']);
  const items = [
    { label: 'Top Notes', helper: 'First impression', notes: layers.top, width: 'md:w-1/2', accent: 'from-amber-300/25' },
    { label: 'Heart Notes', helper: 'Main personality', notes: layers.heart, width: 'md:w-3/4', accent: 'from-rose-300/20' },
    { label: 'Base Notes', helper: 'Lasting trail', notes: layers.base, width: 'md:w-full', accent: 'from-stone-300/15' },
  ];

  return (
    <section className={`rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-8 ${className}`}>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.25em] text-amber-300">Perfume Note Pyramid</p>
          <h3 className="mt-2 text-2xl font-black md:text-4xl">How the scent evolves</h3>
        </div>
        <p className="max-w-md text-sm leading-6 text-white/50">Top notes open the fragrance, heart notes define the scent, and base notes create the lasting impression.</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {items.map((layer, index) => (
          <div key={layer.label} className={`note-pyramid-layer luxury-card w-full ${layer.width} rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${layer.accent} to-white/[0.03] p-5 text-center soft-slide`} style={{ animationDelay: `${index * 120}ms` }}>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/40">{layer.helper}</p>
            <h4 className="mt-1 text-lg font-black text-white">{layer.label}</h4>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(layer.notes.length ? layer.notes : ['Signature']).map((note) => (
                <span key={note} className="rounded-full border border-amber-200/15 bg-black/20 px-4 py-2 text-sm font-bold text-amber-100">
                  {note}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
