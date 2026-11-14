'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];
const BUCKET = 'homepage-media';
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_VIDEO = 100 * 1024 * 1024;
type Media = { id: string; title: string; media_type: 'image' | 'video'; file_url: string; storage_path: string; is_active: boolean; created_at: string };

export default function HomepageMediaAdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState<Media[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error: queryError } = await supabase.from('homepage_media').select('*').order('created_at', { ascending: false });
    if (queryError) throw queryError;
    setItems((data || []) as Media[]);
  }, []);

  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        if (!supabase) throw new Error('Supabase is not configured.');
        const { data } = await supabase.auth.getSession();
        const email = data.session?.user?.email?.toLowerCase() || '';
        const localFlag = window.localStorage.getItem('exousia_admin_logged') === '1';
        if (!localFlag || !ADMIN_EMAILS.includes(email)) throw new Error('Please sign in with an authorized admin account.');
        if (!alive) return;
        setAuthorized(true);
        await load();
      } catch (e: any) { if (alive) setError(e.message || 'Unable to load media manager.'); }
      finally { if (alive) setChecking(false); }
    }
    init();
    return () => { alive = false; };
  }, [load]);

  async function upload(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if (!supabase || !file) { setError('Choose an image or video first.'); return; }
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (!type || (type === 'image' && !['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) || (type === 'video' && !['video/mp4','video/webm','video/quicktime'].includes(file.type))) {
      setError('Supported formats: JPG, PNG, WebP, GIF, MP4, WebM, or MOV.'); return;
    }
    if (file.size > (type === 'image' ? MAX_IMAGE : MAX_VIDEO)) { setError(type === 'image' ? 'Images must be 10 MB or smaller.' : 'Videos must be 100 MB or smaller.'); return; }
    setBusy(true);
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
      const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: insertError } = await supabase.from('homepage_media').insert({ title: title.trim() || file.name, media_type: type, file_url: publicData.publicUrl, storage_path: path, is_active: false });
      if (insertError) { await supabase.storage.from(BUCKET).remove([path]); throw insertError; }
      setTitle(''); setFile(null);
      const input = document.getElementById('media-file') as HTMLInputElement | null; if (input) input.value = '';
      await load(); setMessage('Media uploaded successfully. Select “Publish” to display it on the homepage.');
    } catch (e: any) { setError(e.message || 'Upload failed.'); }
    finally { setBusy(false); }
  }

  async function publish(item: Media) {
    if (!supabase) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const { error: updateError } = await supabase.from('homepage_media').update({ is_active: false }).neq('id', item.id);
      if (updateError) throw updateError;
      const { error: activeError } = await supabase.from('homepage_media').update({ is_active: true }).eq('id', item.id);
      if (activeError) throw activeError;
      await load(); setMessage('Homepage media updated successfully.');
    } catch (e: any) { setError(e.message || 'Could not publish media.'); }
    finally { setBusy(false); }
  }

  async function remove(item: Media) {
    if (!supabase || !window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const { error: rowError } = await supabase.from('homepage_media').delete().eq('id', item.id);
      if (rowError) throw rowError;
      const { error: fileError } = await supabase.storage.from(BUCKET).remove([item.storage_path]);
      if (fileError) throw fileError;
      await load(); setMessage('Media deleted.');
    } catch (e: any) { setError(e.message || 'Could not delete media.'); }
    finally { setBusy(false); }
  }

  if (checking) return <main className="min-h-screen bg-[#160508] p-8 text-white">Checking admin access…</main>;
  if (!authorized) return <main className="min-h-screen bg-[#160508] p-8 text-white"><p>{error || 'Admin access required.'}</p><Link className="mt-4 inline-block text-amber-300" href="/admin">← Admin login</Link></main>;

  return <main className="min-h-screen bg-[#160508] px-4 py-8 text-white sm:px-8">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin" className="text-sm font-bold text-amber-300">← Back to Admin Dashboard</Link>
      <h1 className="mt-5 text-3xl font-black sm:text-4xl">Homepage Media Manager</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">Upload your own promotional images or videos, preview them, then publish one item to the homepage banner.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-500/15 p-4 text-sm text-red-200">{error}</p>}
      {message && <p role="status" className="mt-5 rounded-xl bg-emerald-500/15 p-4 text-sm text-emerald-200">{message}</p>}
      <form onSubmit={upload} className="mt-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[.05] p-5 sm:p-7">
        <h2 className="text-xl font-black">Upload new media</h2>
        <label className="text-sm font-bold text-white/70">Media title (optional)<input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="e.g. New perfume collection" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-400" /></label>
        <label className="text-sm font-bold text-white/70">Choose image or video<input id="media-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={e => setFile(e.target.files?.[0] || null)} required className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:font-bold file:text-white" /></label>
        <p className="text-xs leading-5 text-white/50">Images: JPG, PNG, WebP, GIF up to 10 MB. Videos: MP4, WebM, MOV up to 100 MB. For best performance, use compressed MP4 (H.264).</p>
        {file && <div className="rounded-xl bg-black/30 p-3 text-sm">Selected: <strong>{file.name}</strong> · {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type.startsWith('video/') ? 'Video' : 'Image'}</div>}
        <button disabled={busy || !file} className="w-fit rounded-full bg-amber-700 px-6 py-3 font-black text-white hover:bg-amber-600 disabled:opacity-50">{busy ? 'Please wait…' : 'Upload to Media Library'}</button>
      </form>
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Media Library</h2><p className="mt-1 text-sm text-white/50">Only one item can be active on the homepage at a time.</p></div><span className="text-sm text-white/50">{items.length} item(s)</span></div>
        {items.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/20 p-10 text-center text-white/50">No uploaded media yet.</div> : <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.05]">
          <div className="flex min-h-48 max-h-80 items-center justify-center overflow-hidden bg-black p-2">{item.media_type === 'video' ? <video src={item.file_url} controls playsInline preload="metadata" className="max-h-72 max-w-full object-contain" /> : <img src={item.file_url} alt={item.title} className="max-h-72 max-w-full object-contain" />}</div>
          <div className="p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wider text-amber-300">{item.media_type}</span>{item.is_active && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-300">Published</span>}</div><h3 className="mt-2 truncate font-black">{item.title}</h3><p className="mt-1 text-xs text-white/40">{new Date(item.created_at).toLocaleString()}</p><div className="mt-4 flex gap-2">{!item.is_active && <button disabled={busy} onClick={() => publish(item)} className="flex-1 rounded-full bg-amber-700 px-3 py-2 text-sm font-black disabled:opacity-50">Publish</button>}<button disabled={busy} onClick={() => remove(item)} className="rounded-full border border-red-400/30 px-3 py-2 text-sm font-bold text-red-200 disabled:opacity-50">Delete</button></div></div>
        </article>)}</div>}
      </section>
    </div>
  </main>;
}
