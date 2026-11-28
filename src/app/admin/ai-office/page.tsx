'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import { getLowestVariantPrice } from '@/context/ProductContext';
import type { ManagedProduct } from '@/context/ProductContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AgentId = 'scent' | 'events' | 'orders' | 'social';
type AgentState = 'ready' | 'working' | 'done' | 'needs-setup';
type Agent = { id: AgentId; name: string; role: string; face: string; color: string; task: string; state: AgentState; output: string; lastRun: string };

const admins = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];
const seedAgents: Agent[] = [
  { id: 'scent', name: 'Mika', role: 'Scent Consultant', face: '✦', color: '#9b2933', task: 'Review the live product catalog and suggest top picks.', state: 'ready', output: '', lastRun: 'Ready for a task' },
  { id: 'events', name: 'Bea', role: 'Event Coordinator', face: '✉', color: '#bd8068', task: 'Check new Event Scents inquiries and flag follow-ups.', state: 'ready', output: '', lastRun: 'Ready for a task' },
  { id: 'orders', name: 'Nico', role: 'Order Support', face: '▣', color: '#8d6f36', task: 'Summarize orders that may need staff attention.', state: 'ready', output: '', lastRun: 'Ready for a task' },
  { id: 'social', name: 'Luna', role: 'Social Studio', face: '✎', color: '#657965', task: 'Prepare a social caption from an active product.', state: 'ready', output: '', lastRun: 'Ready for a task' },
];

function money(value: number) { return `₱${Math.round(value || 0).toLocaleString('en-PH')}`; }

export default function AIOfficePage() {
  const { activeProducts, usingSupabase } = useProducts();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [setupError, setSetupError] = useState('');
  const [agents, setAgents] = useState(seedAgents);
  const [activity, setActivity] = useState<string[]>(['Office opened. Agents are standing by.']);
  const [copyLabel, setCopyLabel] = useState('');
  const workingCount = agents.filter((agent) => agent.state === 'working').length;
  const catalog = useMemo(() => activeProducts.filter((product) => product.active !== false), [activeProducts]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!supabase) throw new Error('Staff sign-in is not configured. Connect the store authentication to use this private dashboard.');
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email?.trim().toLowerCase() || '';
        if (!data.user || !admins.includes(email)) throw new Error('Admin access required. Please sign in through the admin dashboard.');
        if (alive) setAuthorized(true);
      } catch (error: any) {
        if (alive) setSetupError(error?.message || 'Unable to confirm admin access.');
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function patchAgent(id: AgentId, changes: Partial<Agent>) {
    setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, ...changes } : agent));
  }

  function log(message: string) {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivity((current) => [`${stamp} · ${message}`, ...current].slice(0, 8));
  }

  async function tokenOrThrow() {
    const { data } = await supabase!.auth.getSession();
    if (!data.session?.access_token) throw new Error('Admin session expired. Sign in again to continue.');
    return data.session.access_token;
  }

  async function runAgent(id: AgentId) {
    const agent = agents.find((item) => item.id === id);
    if (!agent || agent.state === 'working') return;
    patchAgent(id, { state: 'working', output: '', lastRun: 'Working now…' });
    log(`${agent.name} started: ${agent.role.toLowerCase()}.`);
    try {
      let result = '';
      if (id === 'scent') {
        const picks = [...catalog].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 3);
        if (!picks.length) throw new Error('No active products are available in the catalog.');
        result = `Catalog scan complete. Top rated active picks: ${picks.map((p: ManagedProduct) => `${p.name} (${Number(p.rating || 0).toFixed(1)}★, starts at ${money(getLowestVariantPrice(p) || p.price)})`).join(' · ')}.`;
      } else if (id === 'events') {
        const token = await tokenOrThrow();
        const response = await fetch('/api/admin/event-scents', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        if (!response.ok) throw new Error('Could not read event inquiries. Check the booking database connection.');
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error('The booking service returned an unexpected response.');
        const pending = rows.filter((row) => !row.status || ['pending inquiry', 'pending', 'new'].includes(String(row.status).toLowerCase()));
        result = rows.length ? `Reviewed ${rows.length} booking ${rows.length === 1 ? 'inquiry' : 'inquiries'}. ${pending.length} ${pending.length === 1 ? 'needs' : 'need'} follow-up. ${pending.slice(0, 3).map((row) => `${row.event_type || 'Event'} on ${row.event_date || 'date not set'} (${row.guest_count || 'guest count unknown'} guests)`).join(' · ') || 'No new inquiries to flag.'}` : 'No Event Scents inquiries have been submitted yet.';
      } else if (id === 'orders') {
        const token = await tokenOrThrow();
        const response = await fetch('/api/admin/orders?limit=100', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        if (!response.ok) throw new Error('Could not read order data. Check the orders database connection.');
        const payload = await response.json();
        const rows = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
        const attention = rows.filter((row: any) => ['new', 'pending', 'for verification', 'cod pending'].includes(String(row.order_status || row.status || row.payment_status || '').toLowerCase()));
        result = rows.length ? `Reviewed the latest ${rows.length} orders. ${attention.length} may need staff attention for payment verification or fulfillment. Open the admin order dashboard to review individual orders.` : 'No recent orders were returned.';
      } else {
        const featured = catalog.find((product) => product.hero_enabled) || [...catalog].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0];
        if (!featured) throw new Error('No active products are available to feature.');
        result = `Draft caption: “A little luxury, made for your everyday story. Meet ${featured.name} — ${featured.description || 'find the scent that feels like you.'} Discover yours at Exousia & Co. ✨” Starting at ${money(getLowestVariantPrice(featured) || featured.price)}. Review this draft before posting.`;
      }
      patchAgent(id, { state: 'done', output: result, lastRun: `Finished at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` });
      log(`${agent.name} completed the task.`);
    } catch (error: any) {
      patchAgent(id, { state: 'needs-setup', output: error?.message || 'Task could not be completed.', lastRun: 'Needs attention' });
      log(`${agent.name} needs attention.`);
    }
  }

  async function copyOutput(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel('Copied');
      window.setTimeout(() => setCopyLabel(''), 1600);
    } catch { setCopyLabel('Copy unavailable'); }
  }

  if (checking) return <main className="min-h-screen bg-[#170e10] p-8 text-[#f6ede6]">Checking staff access…</main>;
  if (!authorized) return <main className="min-h-screen bg-[#170e10] px-5 py-16 text-[#f6ede6]"><div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[.04] p-8"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d4b27e]">Private · Exousia &amp; Co.</p><h1 className="mt-4 font-serif text-4xl">AI Office</h1><p className="mt-4 text-white/70">{setupError}</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/admin" className="rounded-full bg-[#8A0303] px-5 py-3 font-semibold text-white">Go to admin sign in</Link><Link href="/" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">Back to store</Link></div></div></main>;

  return <main className="min-h-screen overflow-hidden bg-[#170e10] px-4 py-6 text-[#f6ede6] md:px-8 md:py-10">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div><Link href="/admin" className="text-sm font-medium text-[#d4b27e] hover:text-white">← Admin dashboard</Link><p className="mt-7 text-[11px] font-bold uppercase tracking-[.36em] text-[#d4b27e]">Exousia &amp; Co. · Private workspace</p><h1 className="mt-2 font-serif text-4xl md:text-6xl">The AI Office</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Meet your team. Assign a task, watch a bot work, and review what it returns.</p></div>
        <Link href="/admin/marketing" className="inline-flex w-fit items-center rounded-full border border-[#d4b27e]/30 px-5 py-3 text-sm font-semibold text-[#f6ede6] hover:bg-white/5">Open marketing tools →</Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#d4b27e]/20 bg-[#26181a] px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#d4b27e]/10 px-3 py-2 font-semibold text-[#e6c990]"><span className="h-2 w-2 rounded-full bg-[#d4b27e]"/>Workflow preview mode</span>
        <span className="text-white/60">Bots run store-data workflows. Connect an AI model to enable open-ended AI reasoning and conversation.</span>
        <span className="ml-auto text-white/45">Catalog: {usingSupabase ? 'connected' : 'demo data'}</span>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Office overview">
        {[['Agents', '04'], ['Working now', String(workingCount).padStart(2, '0')], ['Workflows ready', '04']].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] px-5 py-4"><p className="text-xs uppercase tracking-[.2em] text-white/45">{label}</p><p className="mt-1 font-serif text-3xl">{value}</p></div>)}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(290px,.8fr)]">
        <section aria-labelledby="team-title">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-[#d4b27e]">The team</p><h2 id="team-title" className="mt-1 font-serif text-3xl">Your agents at work</h2></div><span className="text-xs text-white/45">Select a task to get started</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent) => <article key={agent.id} className={`relative overflow-hidden rounded-3xl border bg-[#241719] transition ${agent.state === 'working' ? 'border-[#d4b27e]/70 shadow-lg shadow-[#d4b27e]/10' : 'border-white/10'}`}>
              <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: agent.color }}/>
              <div className="flex items-start gap-4 p-5">
                <div className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl shadow-inner ${agent.state === 'working' ? 'animate-pulse' : ''}`} style={{ background: `linear-gradient(145deg, ${agent.color}, #422226)` }}>
                  <span aria-hidden="true">{agent.face}</span><span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#241719] ${agent.state === 'working' ? 'bg-[#d4b27e]' : agent.state === 'needs-setup' ? 'bg-rose-400' : 'bg-emerald-400'}`}/>
                </div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-serif text-xl">{agent.name}</h3><p className="text-xs text-[#d4b27e]">{agent.role}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${agent.state === 'working' ? 'bg-[#d4b27e]/15 text-[#e6c990]' : agent.state === 'needs-setup' ? 'bg-rose-400/10 text-rose-200' : agent.state === 'done' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-white/55'}`}>{agent.state === 'needs-setup' ? 'Needs attention' : agent.state}</span></div>
                  <p className="mt-3 text-sm leading-5 text-white/65">{agent.task}</p><p className="mt-2 text-[11px] text-white/35">{agent.lastRun}</p>
                </div>
              </div>
              {agent.output && <div className="mx-5 mb-4 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-white/80">{agent.output}</p>{agent.id === 'social' && agent.state === 'done' && <button type="button" onClick={() => copyOutput(agent.output)} className="mt-3 rounded-full border border-[#d4b27e]/30 px-3 py-1.5 text-xs font-semibold text-[#e6c990] hover:bg-white/5">{copyLabel || 'Copy draft'}</button>}</div>}
              <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3"><span className="text-[10px] uppercase tracking-[.18em] text-white/35">Desk · {agent.id === 'social' ? 'Studio' : agent.id === 'events' ? 'Events' : agent.id === 'orders' ? 'Care' : 'Beauty'}</span><button type="button" disabled={agent.state === 'working'} onClick={() => runAgent(agent.id)} className="rounded-full bg-[#8A0303] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a20a10] disabled:cursor-wait disabled:opacity-50">{agent.state === 'working' ? 'Working…' : agent.state === 'done' ? 'Run again' : 'Assign task'}</button></div>
            </article>)}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-white/10 bg-[#241719] p-5">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-[#d4b27e]">Live activity</p><h2 className="mt-1 font-serif text-2xl">Office log</h2>
            <ul className="mt-4 space-y-3">{activity.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-5 text-white/65"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4b27e]"/><span>{item}</span></li>)}</ul>
          </section>
          <section className="rounded-3xl border border-[#d4b27e]/20 bg-[#d4b27e]/[.06] p-5"><p className="text-xs font-semibold uppercase tracking-[.25em] text-[#d4b27e]">How this preview works</p><p className="mt-3 text-sm leading-6 text-white/65">When you assign a task, the agent reads the relevant store data and returns a result here. Booking and order agents use your existing admin data connections. Social drafts are for staff review and are never posted automatically.</p><p className="mt-3 text-xs leading-5 text-white/40">Open-ended AI tasks and autonomous background work need an AI provider and a secure server-side agent service.</p></section>
          <Link href="/admin/event-scents" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] px-5 py-4 text-sm font-semibold text-white/80 hover:bg-white/[.07]">Review Event Scents inquiries <span aria-hidden="true">→</span></Link>
          <Link href="/admin/analytics" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] px-5 py-4 text-sm font-semibold text-white/80 hover:bg-white/[.07]">Open store analytics <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
      <footer className="mt-10 border-t border-white/10 pt-5 text-xs text-white/35"><Link href="/" className="hover:text-white/70">← Return to store</Link><span className="ml-3">Private staff workspace · AI output preview</span></footer>
    </div>
  </main>;
}
