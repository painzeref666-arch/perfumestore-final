'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Price from '@/components/Price';
import WishlistButton from '@/components/shop/WishlistButton';
import { useProducts } from '@/context/ProductContext';

const questions = [
  { key: 'mood', title: 'What mood do you want your scent to express?', options: ['Elegant', 'Romantic', 'Fresh', 'Mysterious', 'Powerful'] },
  { key: 'wear', title: 'When will you wear it most?', options: ['Daily office', 'Date night', 'Special events', 'Summer daytime', 'Evening luxury'] },
  { key: 'notes', title: 'Which notes attract you?', options: ['Rose / floral', 'Citrus / clean', 'Vanilla / sweet', 'Oud / smoky', 'Musk / amber'] },
  { key: 'strength', title: 'Preferred performance?', options: ['Light and clean', 'Balanced', 'Long-lasting', 'Beast mode'] },
];

function scoreProduct(product: any, answers: Record<string, string>) {
  const text = `${product.name} ${product.family} ${(product.notes || []).join(' ')} ${product.description}`.toLowerCase();
  let score = 0;
  Object.values(answers).forEach((answer) => {
    const a = answer.toLowerCase();
    if (a.includes('romantic') || a.includes('rose') || a.includes('floral')) score += /rose|floral|jasmine|bloom|flower|romantic/.test(text) ? 4 : 0;
    if (a.includes('fresh') || a.includes('citrus') || a.includes('clean') || a.includes('summer')) score += /fresh|citrus|bergamot|lemon|neroli|clean|aqua/.test(text) ? 4 : 0;
    if (a.includes('vanilla') || a.includes('sweet')) score += /vanilla|tonka|sweet|gourmand/.test(text) ? 4 : 0;
    if (a.includes('oud') || a.includes('smoky') || a.includes('mysterious')) score += /oud|smoke|smoky|dark|noir|mystery|spice/.test(text) ? 5 : 0;
    if (a.includes('amber') || a.includes('musk') || a.includes('powerful') || a.includes('luxury')) score += /amber|musk|royale|luxury|intense/.test(text) ? 4 : 0;
    if (a.includes('daily') || a.includes('office') || a.includes('balanced')) score += product.price < 2500 ? 2 : 1;
    if (a.includes('long') || a.includes('beast') || a.includes('evening')) score += /extrait|oud|amber|musk|spice|noir/.test(text) ? 3 : 0;
  });
  return score + Number(product.rating || 0) + Math.min(Number(product.reviews || 0) / 100, 2);
}

export default function QuizPage() {
  const { activeProducts } = useProducts();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= questions.length;
  const results = useMemo(() => activeProducts.map((p) => ({ product: p, score: scoreProduct(p, answers) })).sort((a, b) => b.score - a.score).slice(0, 3), [activeProducts, answers]);
  const q = questions[step];

  function choose(value: string) {
    setAnswers((current) => ({ ...current, [q.key]: value }));
    setStep((s) => s + 1);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fbf7ef] px-6 py-32 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-amber-700">AI-style fragrance finder</p>
          <h1 className="mt-4 text-5xl font-black md:text-7xl">Find your signature scent</h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-600 dark:text-white/60">Answer a few questions and the website will recommend perfumes based on notes, mood, use case, and performance.</p>

          {!done ? (
            <section className="mt-10 rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-10">
              <div className="mb-8 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/10"><div className="h-full bg-amber-700 transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
              <p className="text-sm font-black text-amber-700">Question {step + 1} of {questions.length}</p>
              <h2 className="mt-3 text-3xl font-black">{q.title}</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {q.options.map((option) => <button key={option} onClick={() => choose(option)} className="rounded-3xl border border-stone-200 p-5 text-left text-lg font-black transition hover:-translate-y-1 hover:border-amber-600 hover:bg-amber-50 dark:border-white/10 dark:bg-black/20 dark:hover:bg-amber-500/10">{option}</button>)}
              </div>
            </section>
          ) : (
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-3xl font-black">Your recommended perfumes</h2>
                <button onClick={() => { setStep(0); setAnswers({}); }} className="rounded-full border border-stone-300 px-5 py-3 font-black dark:border-white/10">Retake quiz</button>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {results.map(({ product }, index) => <Link key={product.id} href={`/products/${product.id}`} className="group rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]"><AppImage src={product.image} alt={product.name} fill sizes="33vw" className="object-cover transition duration-700 group-hover:scale-105" /><span className="absolute left-4 top-4 rounded-full bg-amber-700 px-4 py-2 text-xs font-black text-white">Match #{index + 1}</span><WishlistButton productId={product.id} className="absolute right-4 top-4 h-11 w-11 text-xl" /></div>
                  <h3 className="mt-5 text-2xl font-black">{product.name}</h3>
                  <p className="mt-1 text-sm text-stone-600 dark:text-white/50">{product.family} • {(product.notes || []).slice(0, 3).join(' · ')}</p>
                  <Price amount={product.salePrice || product.price} className="mt-4 block text-lg font-black" />
                </Link>)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
