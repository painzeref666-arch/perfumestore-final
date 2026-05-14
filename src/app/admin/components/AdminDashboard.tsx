'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Price from '@/components/Price';
import CurrencySelector from '@/components/CurrencySelector';
import {
  defaultVariants,
  makeProductId,
  type ManagedProduct,
  useProducts,
} from '@/context/ProductContext';
import {
  concentrations,
  sizes,
  type ConcentrationOption,
  type ProductVariant,
  type SizeOption,
} from '@/data/products';
import { isSupabaseConfigured, supabase, supabaseConfigError, withTimeout } from '@/lib/supabase';
import { logActivity } from '@/lib/customer-ui-utils';
import { adminFetch } from '@/lib/admin-client';

const DEMO_EMAIL = 'admin@exousiaandco.com';
const ADMIN_EMAILS = ['admin@exousiaandco.com', 'exousiaandco@gmail.com', 'admin@exousia.com'];
const isAdminEmail = (value: string) => ADMIN_EMAILS.includes(value.trim().toLowerCase());

type OrderRow = {
  id: string;
  customer?: any;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items: any[];
  subtotal: number;
  status: string;
  created_at: string;
  shipping_method?: string;
  shipping_fee?: number;
  payment_method?: string;
  payment_status?: string;
  payment_reference?: string;
  payment_proof_url?: string;
  payment_note?: string;
  total?: number;
  tracking_code?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_notes?: string;
  estimated_delivery?: string;
  paid_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  order_status?: string;
  inventory_deducted?: boolean;
};

const blank: ManagedProduct = {
  id: '',
  name: '',
  family: 'Floral',
  category: 'perfumes',
  notes: [],
  price: 999,
  size: '10ml',
  image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop',
  gallery: [],
  gallery_images: [],
  rating: 5,
  reviews: 0,
  stock: 0,
  tag: 'New',
  description: '',
  promo: '',
  event: '',
  active: true,
  variants: defaultVariants(999),
  hero_enabled: false,
  hero_badge: 'Featured',
  hero_title: '',
  hero_description: '',
  hero_button_text: 'View Perfume',
  hero_button_link: '',
  hero_order: 0,
};


const CATEGORY_META = {
  perfumes: {
    familyLabel: 'Scent family',
    notesLabel: 'Notes, separated by comma',
    variantTitle: 'Perfume prices by ML and concentration',
    description: 'Use EDP/Extrait and perfume bottle sizes.',
    kindLabel: 'Perfume type',
    defaultFamily: 'Floral',
    defaultNotes: 'Rose, Pear, White Floral',
    defaultVariants: ['EDP', 'Extrait'],
  },
  cosmetics: {
    familyLabel: 'Cosmetic type',
    notesLabel: 'Shade / Flavor / Scent, separated by comma',
    variantTitle: 'Cosmetic variant prices',
    description: 'Use cosmetic-specific variants like shade, flavor, finish, or pack size. No EDP/Extrait.',
    kindLabel: 'Finish / Variant',
    defaultFamily: 'Lip Product',
    defaultNotes: 'Cherry, Clear, Glossy',
    defaultVariants: ['Default'],
  },
  wellness: {
    familyLabel: 'Wellness type',
    notesLabel: 'Scent / Benefit / Variant, separated by comma',
    variantTitle: 'Wellness variant prices',
    description: 'Use wellness-specific variants like scent, benefit, bottle size, or pack size. No EDP/Extrait.',
    kindLabel: 'Wellness variant',
    defaultFamily: 'Body Care',
    defaultNotes: 'Lavender, Relaxing, Daily Care',
    defaultVariants: ['Default'],
  },
} as const;

function getCategoryKey(category?: string) {
  return category === 'cosmetics' || category === 'wellness' ? category : 'perfumes';
}

function simpleVariantPrice(product: ManagedProduct) {
  const first = product.variants?.[0];
  const value = first?.prices?.['10ml'] || product.price || 999;
  return Number(value) || 999;
}

function categoryVariants(product: ManagedProduct) {
  const category = getCategoryKey(product.category as string);
  if (category === 'perfumes') {
    return normalizeVariants(product.variants, Number(product.price) || 999);
  }

  const base = Number(product.price) || simpleVariantPrice(product);
  const label = product.size || (category === 'cosmetics' ? 'Variant' : 'Size');
  return [
    {
      concentration: 'EDP' as ConcentrationOption,
      prices: { '10ml': base, '15ml': 0, '50ml': 0, '85ml': 0 },
      label,
    } as ProductVariant,
  ];
}

function productImageSlots(product: ManagedProduct) {
  const gallery = Array.isArray(product.gallery_images)
    ? product.gallery_images
    : Array.isArray(product.gallery)
      ? product.gallery
      : Array.isArray(product.image_gallery)
        ? product.image_gallery
        : [];
  return [product.image || '', ...gallery].slice(0, 4);
}

function normalizeImageSlots(slots: string[]) {
  const unique = Array.from(new Set(slots.map((slot) => slot.trim()).filter(Boolean))).slice(0, 4);
  return {
    image: unique[0] || '',
    gallery: unique.slice(1),
    gallery_images: unique.slice(1),
    image_gallery: unique.slice(1),
  };
}

function normalizeVariants(v: ProductVariant[] | undefined, base = 999) {
  const map = new Map((v || []).map((x) => [x.concentration, x]));
  return concentrations.map((c) => map.get(c) || defaultVariants(base).find((x) => x.concentration === c)!);
}

export default function AdminDashboard() {
  const {
    products,
    loading,
    error: productError,
    usingSupabase,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    refreshProducts,
  } = useProducts();

  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState('admin@exousiaandco.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ManagedProduct>(blank);
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [lowStockLimit, setLowStockLimit] = useState(10);
  const [orderSaving, setOrderSaving] = useState('');
  const [imageStatus, setImageStatus] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const totalInventory = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * (p.variants?.[0]?.prices?.['10ml'] || p.price), 0);
  const activeCount = useMemo(() => products.filter((p) => p.active !== false).length, [products]);
  const lowStock = products.filter((p) => Number(p.stock || 0) <= lowStockLimit);
  const orderRevenue = orders.reduce((sum, o) => sum + Number(o.total || Number(o.subtotal || 0) + Number(o.shipping_fee || 0)), 0);
  const pendingOrders = orders.filter((o) => ((o.order_status || o.status || '').toLowerCase() === 'new' || (o.order_status || o.status || '').toLowerCase() === 'pending')).length;
  const paidOrders = orders.filter((o) => (o.payment_status || '').toLowerCase() === 'paid' || (o.status || '').toLowerCase() === 'paid').length;
  const shippedOrders = orders.filter((o) => (o.order_status || o.status || '').toLowerCase() === 'shipped').length;
  const pendingPayments = orders.filter((o) => ['pending', 'for verification', 'cod pending'].includes(String(o.payment_status || '').toLowerCase())).length;
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.family, p.category, p.promo, p.tag, p.event].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [products, productSearch]);

  function clearAdminSession() {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem('exousia-admin-session');
    window.localStorage.removeItem('exousia_admin_logged');
    window.localStorage.removeItem('exousia-admin-session');
  }

  async function loadOrders() {
    if (!logged) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    setError('');
    try {
      if (!isSupabaseConfigured || !supabase) {
        setError(supabaseConfigError || 'Supabase is not connected.');
        setOrders([]);
        return;
      }
      const res = await adminFetch('/api/admin/orders?limit=100', { cache: 'no-store' });
      if (res.status === 401) {
        clearAdminSession();
        setLogged(false);
        setError('Admin session expired. Please login again to load orders.');
        setOrders([]);
        return;
      }
      const json = await res.json();
      if (json.error) {
        setError(`Orders load failed: ${json.error}`);
        setOrders([]);
      } else {
        setOrders((json.data || []) as unknown as OrderRow[]);
      }
    } catch (err: any) {
      setError(`Orders load failed. ${err?.message || 'Supabase request did not finish.'}`);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function updateOrder(id: string, changes: Partial<OrderRow>) {
    if (!isSupabaseConfigured || !supabase) {
      setError('Order updates need Supabase connection.');
      return;
    }

    setOrderSaving(id);
    setError('');
    const payload = {
      ...changes,
      order_status: changes.status || changes.order_status,
      shipped_at: (changes.status === 'shipped' || changes.order_status === 'shipped') ? new Date().toISOString() : changes.shipped_at,
      delivered_at: (changes.status === 'delivered' || changes.order_status === 'delivered') ? new Date().toISOString() : changes.delivered_at,
      paid_at: changes.payment_status === 'Paid' ? new Date().toISOString() : changes.paid_at,
    };
    const res = await adminFetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, changes: payload }),
    });
    if (res.status === 401) {
      clearAdminSession();
      setLogged(false);
      setError('Admin session expired. Please login again before updating orders.');
      setOrderSaving('');
      return;
    }
    const json = await res.json();
    if (json.error) setError(json.error);
    else await loadOrders();
    setOrderSaving('');
  }


  async function deductOrderInventory(order: OrderRow) {
    if (!isSupabaseConfigured || !supabase || order.inventory_deducted) return;
    const orderItems = Array.isArray(order.items) ? order.items : [];
    for (const item of orderItems) {
      const productId = item.product_id || item.id;
      const qty = Number(item.quantity || item.qty || 1);
      if (!productId || qty <= 0) continue;
      const { data } = await withTimeout(supabase.from('products').select('stock').eq('id', productId).maybeSingle(), 10000, 'Stock check');
      const currentStock = Number(data?.stock || 0);
      await withTimeout(supabase.from('products').update({ stock: Math.max(0, currentStock - qty) }).eq('id', productId), 10000, 'Stock update');
    }
  }

  async function approvePayment(order: OrderRow) {
    setOrderSaving(order.id);
    setError('');
    try {
      await deductOrderInventory(order);
      await updateOrder(order.id, {
        payment_status: 'Paid',
        status: 'paid',
        order_status: 'paid',
        inventory_deducted: true,
      } as Partial<OrderRow>);
      await refreshProducts();
    } catch (err: any) {
      setError(err?.message || 'Payment approval failed.');
      setOrderSaving('');
    }
  }

  useEffect(() => {
    let active = true;
    async function verifySession() {
      if (!supabase) {
        clearAdminSession();
        if (active) setLogged(false);
        return;
      }

      try {
        const result: any = await Promise.race([
          supabase.auth.getUser(),
          new Promise((resolve) => window.setTimeout(() => resolve({ data: { user: null } }), 5000)),
        ]);
        const sessionEmail = result?.data?.user?.email || '';
        if (sessionEmail && isAdminEmail(sessionEmail)) {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('exousia-admin-session', 'active');
            window.localStorage.setItem('exousia_admin_logged', '1');
          }
          if (active) setLogged(true);
        } else {
          clearAdminSession();
          if (active) setLogged(false);
        }
      } catch {
        clearAdminSession();
        if (active) setLogged(false);
      }
    }
    verifySession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    loadOrders();
  }, [logged]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!isAdminEmail(cleanEmail)) {
      setError('This email is not registered as an admin.');
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const result: any = await Promise.race([
        supabase.auth.signInWithPassword({ email: cleanEmail, password }),
        new Promise((resolve) =>
          setTimeout(() => resolve({ error: { message: 'Login timed out. Please try again.' } }), 8000)
        ),
      ]);

      if (!result?.error) {
        setLogged(true);
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('exousia-admin-session', 'active');
          window.localStorage.setItem('exousia_admin_logged', '1');
        }
        await refreshProducts();
        return;
      }

      setError(result.error.message);
      return;
    }

    setError('Supabase is not connected. Check Vercel environment variables before using admin.');
  }

  function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      const timer = window.setTimeout(() => {
        reject(new Error('Image preview timed out. Please try a smaller image.'));
      }, 8000);

      reader.onload = () => {
        image.onload = () => {
          window.clearTimeout(timer);

          const canvas = document.createElement('canvas');
          const maxSide = 900;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not process image.'));
            return;
          }

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };

        image.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error('Image preview failed. Please try another image.'));
        };

        image.src = String(reader.result);
      };

      reader.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error('Image preview failed. Please try another image.'));
      };

      reader.readAsDataURL(file);
    });
  }

  async function uploadImage(file: File) {
    setError('');
    setImageStatus('Preparing image preview...');
    setUploadingImage(true);

    try {
      if (!file.type.startsWith('image/')) {
        setImageStatus('Please choose a valid image file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageStatus('Image is too large. Please use an image below 10MB.');
        return;
      }

      const previewUrl = await fileToDataUrl(file);

      // Production stability mode:
      // Store optimized compressed image directly in the product record.
      // This avoids Supabase Storage timeout/bucket policy issues.
      setPreviewImage(previewUrl);
      setEditing((cur) => ({ ...cur, ...normalizeImageSlots([previewUrl, ...productImageSlots(cur).slice(1)]) }));
      setImageStatus('Image ready. Click Save to attach it to this product.');
    } catch (err: any) {
      setImageStatus(err?.message || 'Image upload failed. Try a smaller image or paste an Image URL.');
      setError(err?.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  function setProductImageSlot(index: number, value: string) {
    const slots = productImageSlots(editing);
    slots[index] = value;
    const normalized = normalizeImageSlots(slots);
    setEditing((cur) => ({ ...cur, ...normalized }));
    setPreviewImage(normalized.image);
  }

  async function uploadProductImages(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setImageStatus('Preparing product images...');
    setUploadingImage(true);

    try {
      const selected = Array.from(files).slice(0, 4);
      const processed: string[] = [];
      for (const file of selected) {
        if (!file.type.startsWith('image/')) throw new Error('Please choose valid image files only.');
        if (file.size > 10 * 1024 * 1024) throw new Error('One image is too large. Please use images below 10MB.');
        processed.push(await fileToDataUrl(file));
      }
      const existing = productImageSlots(editing);
      const merged = normalizeImageSlots([...processed, ...existing].slice(0, 4));
      setEditing((cur) => ({ ...cur, ...merged }));
      setPreviewImage(merged.image);
      setImageStatus(`${processed.length} image${processed.length === 1 ? '' : 's'} ready. Click Save to attach them to this product.`);
    } catch (err: any) {
      setImageStatus(err?.message || 'Image upload failed. Try smaller images or paste image URLs.');
      setError(err?.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  function setVariantPrice(concentration: ConcentrationOption, size: SizeOption, value: string) {
    const amount = Number(value) || 0;
    const variants = normalizeVariants(editing.variants, Number(editing.price) || 999).map((variant) => (
      variant.concentration === concentration
        ? { ...variant, prices: { ...variant.prices, [size]: amount } }
        : variant
    ));

    setEditing({
      ...editing,
      price: variants[0]?.prices?.['10ml'] || amount || editing.price,
      variants,
    });
  }

  function startEditProduct(product: ManagedProduct) {
    const category = getCategoryKey(product.category as string);
    const variants = category === 'perfumes'
      ? normalizeVariants(product.variants, Number(product.price) || 999)
      : categoryVariants(product);

    setEditing({
      ...product,
      category,
      variants,
      price: Number(product.price) || simpleVariantPrice(product),
      size: category === 'perfumes' ? (product.size || '10ml') : (product.size || (variants[0] as any)?.label || 'Default'),
    });
    setNotes((product.notes || []).join(', '));
    setPreviewImage(product.image || '');
    setImageStatus('');
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const id = editing.id || makeProductId(editing.name);
      const category = getCategoryKey(editing.category as string);
      const variants = category === 'perfumes'
        ? normalizeVariants(editing.variants, Number(editing.price) || 999)
        : categoryVariants(editing);
      const images = normalizeImageSlots(productImageSlots(editing));
      const product: ManagedProduct = {
        ...editing,
        ...images,
        id,
        notes: notes.split(',').map((n) => n.trim()).filter(Boolean),
        category,
        price: variants[0].prices['10ml'],
        size: category === 'perfumes' ? '10ml' : (editing.size || 'Default'),
        variants,
        stock: Number(editing.stock) || 0,
        rating: Number(editing.rating) || 5,
        reviews: Number(editing.reviews) || 0,
        active: editing.active !== false,
        promo: editing.promo || editing.tag,
        tag: editing.promo || editing.tag || 'New',
        hero_enabled: editing.hero_enabled === true,
        hero_badge: editing.hero_badge || editing.promo || editing.tag || 'Featured',
        hero_title: editing.hero_title || editing.name,
        hero_description: editing.hero_description || editing.description || '',
        hero_button_text: editing.hero_button_text || (category === 'perfumes' ? 'View Perfume' : 'View Product'),
        hero_button_link: editing.hero_button_link && !editing.hero_button_link.startsWith('/products/') ? editing.hero_button_link : `/products/${id}`,
        hero_order: Number(editing.hero_order) || 0,
      };

      const savePromise = products.some((p) => p.id === id)
        ? updateProduct(id, product)
        : addProduct(product);

      await Promise.race([
        savePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Product save timed out. Please check Supabase products table columns and run the included SQL.')), 15000)
        ),
      ]);

      if (products.some((p) => p.id === id)) {
        logActivity({ type: 'inventory', title: 'Product updated', detail: `${product.name} • Stock ${product.stock}` });
      } else {
        logActivity({ type: 'inventory', title: 'Product added', detail: `${product.name} • Stock ${product.stock}` });
      }
      setEditing(blank);
      setImageStatus('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }


  function exportOrdersCsv() {
    const rows = orders.map((o) => {
      const customerName = o.customer_name || [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || o.customer?.name || '';
      const total = Number(o.total || Number(o.subtotal || 0) + Number(o.shipping_fee || 0));
      return {
        id: o.id,
        created_at: o.created_at,
        customer_name: customerName,
        customer_email: o.customer_email || o.customer?.email || '',
        phone: o.customer_phone || o.customer?.phone || '',
        payment_method: o.payment_method || o.customer?.payment_method || '',
        payment_status: o.payment_status || '',
        order_status: o.order_status || o.status || '',
        total,
        tracking_number: o.tracking_number || '',
      };
    });
    const headers = Object.keys(rows[0] || { id: '', created_at: '', customer_name: '', customer_email: '', phone: '', payment_method: '', payment_status: '', order_status: '', total: '', tracking_number: '' });
    const csv = [headers.join(','), ...rows.map((row: any) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exousia-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!logged) {
    return (
      <main className="min-h-screen bg-[#080604] px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <section>
            <Link href="/" className="font-bold text-amber-300">← Back to store</Link>
            <p className="mt-12 font-bold uppercase tracking-[.25em] text-amber-400">Admin Login</p>
            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">Secure admin dashboard with database support.</h1>
            <p className="mt-6 max-w-xl text-white/60">
              Manage products, orders, inventory, promos, and store content securely.
            </p>
          </section>

          <form onSubmit={handleLogin} className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
            <h2 className="text-3xl font-black">Admin access</h2>
            <Status usingSupabase={usingSupabase} />
            <label className="mt-6 block text-sm font-bold text-white/60">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-amber-500" placeholder="admin@exousia.com" />
            <label className="mt-5 block text-sm font-bold text-white/60">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-amber-500" placeholder="••••••••" />
            {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-200">{error}</p>}
            <button className="mt-6 w-full rounded-full bg-amber-700 px-6 py-4 font-black text-white transition hover:bg-amber-600">Login as Admin</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-12 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link href="/" className="font-bold text-amber-800">← Back to store</Link>
            <h1 className="mt-4 text-5xl font-black">Admin dashboard</h1>
            <p className="mt-2 text-stone-600 dark:text-white/60">Products, images, prices, promos, inventory, and orders.</p>
            <div className="mt-3"><Status usingSupabase={usingSupabase} /></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <CurrencySelector />
            <Link href="/admin/analytics" className="rounded-full bg-amber-700 px-6 py-3 font-black text-white hover:bg-amber-600">Analytics</Link>
            <Link href="/admin/marketing" className="rounded-full bg-white px-6 py-3 font-black text-stone-950 hover:bg-amber-100">Marketing</Link>
            <Link href="/admin/activity-logs" className="rounded-full bg-white px-6 py-3 font-black text-stone-950 hover:bg-amber-100">Activity Logs</Link>
            <Link href="/admin/inventory-logs" className="rounded-full bg-white px-6 py-3 font-black text-stone-950 hover:bg-amber-100">Inventory Logs</Link>
            <Link href="/products" className="rounded-full bg-stone-950 px-6 py-3 font-black text-white hover:bg-amber-800 dark:bg-amber-700">View Shop</Link>
            <Link href="/admin/logout" className="rounded-full border border-stone-300 px-6 py-3 font-black dark:border-white/10">Logout</Link>
          </div>
        </div>

        {(error || productError) && <p className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-800 dark:bg-red-500/10 dark:text-red-200">{error || productError}</p>}

        <section className="mt-10 grid gap-5 md:grid-cols-4">
          <Stat label="Active Products" value={activeCount} />
          <Stat label="Total Products" value={products.length} />
          <Stat label="Total Stock" value={totalInventory} />
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <p className="text-sm font-bold text-stone-500 dark:text-white/50">Inventory Value</p>
            <Price amount={totalValue} className="mt-2 block text-3xl font-black" />
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-5">
          <Stat label="Total Orders" value={orders.length} />
          <Stat label="Pending Orders" value={pendingOrders} />
          <Stat label="Pending Payments" value={pendingPayments} />
          <Stat label="Paid Orders" value={paidOrders} />
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <p className="text-sm font-bold text-stone-500 dark:text-white/50">Order Revenue</p>
            <Price amount={orderRevenue} className="mt-2 block text-3xl font-black" />
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[480px_1fr]">
          <form onSubmit={save} className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <h2 className="text-2xl font-black">{editing.id ? 'Edit product' : 'Add product'}</h2>
            <Field label="Product name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="mt-3 block text-sm font-bold text-stone-500 dark:text-white/50">Category<select value={(editing.category || 'perfumes') as string} onChange={(e) => {
                const nextCategory = e.target.value;
                const meta = CATEGORY_META[getCategoryKey(nextCategory)];
                setEditing({
                  ...editing,
                  category: nextCategory,
                  family: editing.family || meta.defaultFamily,
                  notes: [],
                  price: nextCategory === 'perfumes' ? editing.price : simpleVariantPrice(editing),
                  size: nextCategory === 'perfumes' ? '10ml' : '',
                  variants: nextCategory === 'perfumes' ? normalizeVariants(editing.variants, editing.price) : categoryVariants({ ...editing, category: nextCategory }),
                });
                if (!notes) setNotes(meta.defaultNotes);
              }} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20"><option value="perfumes">Perfumes</option><option value="cosmetics">Cosmetics</option><option value="wellness">Wellness</option></select></label>
              <Field label={CATEGORY_META[getCategoryKey(editing.category as string)].familyLabel} value={editing.family} onChange={(v) => setEditing({ ...editing, family: v })} />
              <Field label="Stock" type="number" value={String(editing.stock || '')} onChange={(v) => setEditing({ ...editing, stock: Number(v) })} />
              <Field label="Rating" type="number" value={String(editing.rating || 5)} onChange={(v) => setEditing({ ...editing, rating: Number(v) })} />
              <Field label="Reviews" type="number" value={String(editing.reviews || 0)} onChange={(v) => setEditing({ ...editing, reviews: Number(v) })} />
            </div>
            <p className="mt-4 rounded-2xl bg-amber-100 p-3 text-xs font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">Category setup: {CATEGORY_META[getCategoryKey(editing.category as string)].description}</p>
            <div className="mt-5 rounded-[2rem] border border-stone-200 p-4 dark:border-white/10">
              <h3 className="font-black">Product images</h3>
              <p className="mt-1 text-xs font-bold text-stone-500 dark:text-white/50">Upload or paste up to 4 images. Image 1 is the main product photo; images 2-4 show in the product gallery.</p>
              <div className="mt-4 grid gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <label key={index} className="block text-sm font-bold text-stone-500 dark:text-white/50">
                    Image {index + 1} URL
                    <input
                      value={productImageSlots(editing)[index] || ''}
                      onChange={(event) => setProductImageSlot(index, event.target.value)}
                      placeholder={index === 0 ? 'Main product image URL' : 'Optional gallery image URL'}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-4 block text-sm font-bold text-stone-500 dark:text-white/50">Upload up to 4 product images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => uploadProductImages(e.target.files)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black/20" />
              {imageStatus && <p className={`mt-3 rounded-2xl p-3 text-xs font-bold ${imageStatus.includes('ready') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200'}`}>{uploadingImage ? 'Uploading... ' : ''}{imageStatus}</p>}
              {productImageSlots(editing).length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {productImageSlots(editing).map((src, index) => src ? (
                    <img key={`${src}-${index}`} src={src} alt={`Product image ${index + 1}`} className="h-24 w-full rounded-2xl object-cover" />
                  ) : null)}
                </div>
              )}
            </div>

            <label className="mt-4 block text-sm font-bold text-stone-500 dark:text-white/50">Description</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="mt-2 h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
            <Field label={CATEGORY_META[getCategoryKey(editing.category as string)].notesLabel} value={notes} onChange={setNotes} />
            <Field label="Promo badge" value={editing.promo || ''} onChange={(v) => setEditing({ ...editing, promo: v, tag: v || editing.tag })} />
            <Field label="Sale/event message" value={editing.event || ''} onChange={(v) => setEditing({ ...editing, event: v })} />

            <div className="mt-6 rounded-[2rem] border border-amber-300/40 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-black">Homepage hero carousel card</h3>
                  <p className="mt-1 text-xs font-bold text-stone-500 dark:text-white/55">Turn this on to show this perfume in the big sliding hero section.</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-black">
                  <input type="checkbox" checked={editing.hero_enabled === true} onChange={(e) => setEditing({ ...editing, hero_enabled: e.target.checked })} />
                  Show
                </label>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Hero order" type="number" value={String(editing.hero_order || 0)} onChange={(v) => setEditing({ ...editing, hero_order: Number(v) || 0 })} />
                <Field label="Hero badge" value={editing.hero_badge || ''} onChange={(v) => setEditing({ ...editing, hero_badge: v })} />
              </div>
              <Field label="Hero title" value={editing.hero_title || ''} onChange={(v) => setEditing({ ...editing, hero_title: v })} />
              <label className="mt-4 block text-sm font-bold text-stone-500 dark:text-white/50">Hero short description</label>
              <textarea value={editing.hero_description || ''} onChange={(e) => setEditing({ ...editing, hero_description: e.target.value })} className="mt-2 h-20 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Hero button text" value={editing.hero_button_text || ''} onChange={(v) => setEditing({ ...editing, hero_button_text: v })} />
                <Field label="Hero button link" value={editing.hero_button_link || ''} onChange={(v) => setEditing({ ...editing, hero_button_link: v })} />
              </div>
              <p className="mt-3 text-xs font-bold text-stone-500 dark:text-white/50">Tip: leave blank to automatically open this product's own detail page. Use custom links only for promo pages like /products or /checkout.</p>
            </div>

            <div className="mt-6 rounded-[2rem] border border-stone-200 p-4 dark:border-white/10">
              <h3 className="font-black">{CATEGORY_META[getCategoryKey(editing.category as string)].variantTitle}</h3>
              <p className="mt-1 text-xs font-bold text-stone-500 dark:text-white/50">Base prices are Philippine Peso. Store currency selector converts display prices.</p>

              {getCategoryKey(editing.category as string) === 'perfumes' ? (
                normalizeVariants(editing.variants, editing.price).map((v) => (
                  <div key={v.concentration} className="mt-5">
                    <p className="mb-3 font-black text-amber-800">{v.concentration}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {sizes.map((s) => (
                        <Field key={`${v.concentration}-${s}`} label={s} type="number" value={String(v.prices[s] || '')} onChange={(val) => setVariantPrice(v.concentration, s, val)} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field
                    label={getCategoryKey(editing.category as string) === 'cosmetics' ? 'Shade / Flavor / Variant' : 'Scent / Benefit / Variant'}
                    value={editing.size || ''}
                    onChange={(value) => setEditing({
                      ...editing,
                      size: value,
                      variants: [{
                        concentration: 'EDP' as ConcentrationOption,
                        prices: { '10ml': simpleVariantPrice(editing), '15ml': 0, '50ml': 0, '85ml': 0 },
                        label: value,
                      } as ProductVariant],
                    })}
                  />
                  <Field
                    label="Price"
                    type="number"
                    value={String(simpleVariantPrice(editing))}
                    onChange={(value) => {
                      const amount = Number(value) || 0;
                      setEditing({
                        ...editing,
                        price: amount,
                        variants: [{
                          concentration: 'EDP' as ConcentrationOption,
                          prices: { '10ml': amount, '15ml': 0, '50ml': 0, '85ml': 0 },
                          label: editing.size || 'Variant',
                        } as ProductVariant],
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <label className="mt-5 flex items-center gap-3 font-bold">
              <input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Show product in shop
            </label>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button disabled={saving} className="rounded-full bg-amber-800 px-5 py-3 font-black text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setEditing(blank); setImageStatus(''); setPreviewImage(''); setNotes(''); }} className="rounded-full border border-stone-300 px-5 py-3 font-black dark:border-white/10">Clear</button>
            </div>
          </form>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">Product catalog</h2>
                <p className="text-sm text-stone-500 dark:text-white/50">{usingSupabase ? 'Saved in Supabase database.' : 'Demo mode: saved only in this browser.'}</p>
              </div>
              <button onClick={resetProducts} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-black dark:border-white/10">Seed Demo Data</button>
            </div>
            <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products, family, promo..." className="mt-5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />
            {loading ? <p className="mt-8 font-bold">Loading products...</p> : <ProductTable products={filteredProducts} editing={startEditProduct} deleteProduct={deleteProduct} />}
          </section>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-stone-950 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Low stock alerts</h2><label className="text-xs font-black uppercase tracking-widest text-white/50">Alert at ≤ <input type="number" value={lowStockLimit} onChange={(e)=>setLowStockLimit(Number(e.target.value)||0)} className="ml-2 w-20 rounded-xl bg-white/10 px-3 py-2 text-white" /></label></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {lowStock.map((p) => <div key={p.id} className="rounded-2xl bg-white/10 p-4"><p className="font-black">{p.name}</p><p className="text-sm text-white/60">Only {p.stock} left</p></div>)}
              {lowStock.length === 0 && <p className="text-white/60">No low stock products.</p>}
            </div>
          </section>

          <OrdersPanel
            orders={orders}
            loading={ordersLoading}
            usingSupabase={usingSupabase}
            filter={orderFilter}
            setFilter={setOrderFilter}
            search={orderSearch}
            setSearch={setOrderSearch}
            exportOrders={exportOrdersCsv}
            refresh={loadOrders}
            updateOrder={updateOrder}
            approvePayment={approvePayment}
            savingId={orderSaving}
          />
        </section>
      </div>
    </main>
  );
}

function OrdersPanel({
  orders,
  loading,
  usingSupabase,
  filter,
  setFilter,
  search,
  setSearch,
  exportOrders,
  refresh,
  updateOrder,
  approvePayment,
  savingId,
}: {
  orders: OrderRow[];
  loading: boolean;
  usingSupabase: boolean;
  filter: string;
  setFilter: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  exportOrders: () => void;
  refresh: () => void;
  updateOrder: (id: string, changes: Partial<OrderRow>) => void | Promise<void>;
  approvePayment: (order: OrderRow) => void | Promise<void>;
  savingId: string;
}) {
  const filters = ['All', 'new', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  const visible = (filter === 'All' ? orders : orders.filter((o) => (o.order_status || o.status || '').toLowerCase() === filter.toLowerCase() || (o.payment_status || '').toLowerCase() === filter.toLowerCase()))
    .filter((o) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return [o.id, o.tracking_code, o.tracking_number, o.customer_name, o.customer_email, o.customer_phone, o.customer?.email, o.customer?.phone, o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ').toLowerCase().includes(q);
    });

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5 lg:col-span-2">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">Orders management</h2>
          <p className="text-sm text-stone-500 dark:text-white/50">Manage customer orders, payment status, shipping status, and tracking numbers.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/notifications" className="rounded-full bg-amber-700 px-4 py-2 text-sm font-black text-white">Notifications</Link><button onClick={exportOrders} className="rounded-full bg-stone-950 px-4 py-2 text-sm font-black text-white dark:bg-amber-700">Export CSV</button><button onClick={refresh} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-black dark:border-white/10">Refresh Orders</button></div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID, customer, email, phone, tracking..." className="mt-5 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" />

      {!usingSupabase && <p className="mt-4 rounded-2xl bg-amber-100 p-4 text-sm font-bold text-amber-900">Orders need Supabase to save permanently.</p>}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-black capitalize transition ${filter === f ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-white/70'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? <p className="mt-5 font-bold">Loading orders...</p> : <div className="mt-5 space-y-4">
        {visible.map((o) => {
          const customerName = o.customer_name || [o.customer?.first_name, o.customer?.last_name].filter(Boolean).join(' ') || o.customer?.name || 'Customer';
          const items = Array.isArray(o.items) ? o.items : [];
          const total = Number(o.total || Number(o.subtotal || 0) + Number(o.shipping_fee || 0));
          return (
            <article key={o.id} className="rounded-[1.5rem] border border-stone-200 p-5 text-sm dark:border-white/10">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Order #{o.id?.slice(0, 8)}</p>
                  <h3 className="mt-1 text-lg font-black">{customerName}</h3>
                  <p className="text-stone-500 dark:text-white/50">{o.customer_email || o.customer?.email || 'No email'} • {new Date(o.created_at).toLocaleString()}</p>
                  <p className="mt-1 text-stone-500 dark:text-white/50">{o.customer_phone || o.customer?.phone || ''}</p>
                  <p className="mt-2 max-w-2xl text-stone-600 dark:text-white/60">{o.customer_address || formatAddress(o.customer)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:w-[360px]">
                  <Select label="Order status" value={o.order_status || o.status || 'new'} onChange={(value) => updateOrder(o.id, { status: value, order_status: value } as Partial<OrderRow>)} options={['new', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']} disabled={savingId === o.id} />
                  <Select label="Payment" value={o.payment_status || 'Pending'} onChange={(value) => updateOrder(o.id, { payment_status: value })} options={['Pending', 'For Verification', 'COD Pending', 'Paid', 'Rejected', 'Failed', 'Refunded']} disabled={savingId === o.id} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl bg-stone-50 p-4 dark:bg-black/20">
                  <p className="mb-3 font-black">Items ordered</p>
                  <div className="space-y-2">
                    {items.map((item: any, index: number) => (
                      <div key={`${o.id}-${index}`} className="flex items-center justify-between gap-3 border-b border-stone-200 pb-2 last:border-0 dark:border-white/10">
                        <div>
                          <p className="font-bold">{item.name || item.product_name || 'Perfume'}</p>
                          <p className="text-xs text-stone-500 dark:text-white/45">{item.size || item.ml || ''} {item.concentration || item.variation || ''} × {item.qty || item.quantity || 1}</p>
                        </div>
                        <Price amount={Number(item.price || item.total || 0) * Number(item.qty || item.quantity || 1)} className="font-black" />
                      </div>
                    ))}
                    {items.length === 0 && <p className="text-stone-500 dark:text-white/50">No item details saved.</p>}
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 dark:bg-black/20">
                  <p className="font-black">Shipping & payment</p>
                  <p className="mt-2 text-stone-500 dark:text-white/50">Shipping: <span className="font-bold text-stone-900 dark:text-white">{o.shipping_method || 'Standard'}</span></p>
                  <p className="text-stone-500 dark:text-white/50">Payment: <span className="font-bold text-stone-900 dark:text-white">{o.payment_method || o.customer?.payment_method || 'Not saved'}</span></p>
                  <p className="text-stone-500 dark:text-white/50">Reference: <span className="font-bold text-stone-900 dark:text-white">{o.payment_reference || 'None'}</span></p>
                  <p className="text-stone-500 dark:text-white/50">Shipping fee: <Price amount={Number(o.shipping_fee || 0)} className="font-bold text-stone-900 dark:text-white" /></p>
                  <p className="text-stone-500 dark:text-white/50">Total: <Price amount={total} className="font-black text-stone-900 dark:text-white" /></p>
                  {o.payment_proof_url && <a href={o.payment_proof_url} target="_blank" className="mt-3 block overflow-hidden rounded-2xl border border-stone-200 dark:border-white/10"><img src={o.payment_proof_url} alt="Payment proof" className="h-40 w-full object-cover" /><span className="block bg-white p-2 text-center text-xs font-black text-stone-900 dark:bg-black/30 dark:text-white">View payment proof</span></a>}
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <p className="text-xs font-black uppercase tracking-widest text-amber-800 dark:text-amber-200">Shipping tracker</p>
                    <div className="mt-3 grid gap-2">
                      <input id={`courier-${o.id}`} defaultValue={o.courier_name || ''} placeholder="Courier: J&T / LBC / Flash / NinjaVan" className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/30" />
                      <input id={`tracking-${o.id}`} defaultValue={o.tracking_number || ''} placeholder="Tracking number" className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/30" />
                      <input id={`eta-${o.id}`} defaultValue={o.estimated_delivery || ''} placeholder="Estimated delivery: e.g. 2-4 business days" className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/30" />
                      <textarea id={`notes-${o.id}`} defaultValue={o.delivery_notes || ''} placeholder="Delivery notes for customer" rows={2} className="rounded-xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/30" />
                      <button
                        onClick={() => {
                          const tracking = document.getElementById(`tracking-${o.id}`) as HTMLInputElement | null;
                          const courier = document.getElementById(`courier-${o.id}`) as HTMLInputElement | null;
                          const eta = document.getElementById(`eta-${o.id}`) as HTMLInputElement | null;
                          const notes = document.getElementById(`notes-${o.id}`) as HTMLTextAreaElement | null;
                          updateOrder(o.id, { tracking_number: tracking?.value || '', courier_name: courier?.value || '', estimated_delivery: eta?.value || '', delivery_notes: notes?.value || '' } as Partial<OrderRow>);
                        }}
                        className="rounded-xl bg-stone-950 px-4 py-2 font-black text-white dark:bg-amber-700"
                        disabled={savingId === o.id}
                      >
                        Save shipping details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => approvePayment(o)} className="rounded-full bg-emerald-700 px-4 py-2 text-xs font-black text-white">Approve Payment + Deduct Stock</button>
                <button onClick={() => updateOrder(o.id, { payment_status: 'Rejected', order_status: 'payment_rejected' } as Partial<OrderRow>)} className="rounded-full bg-rose-700 px-4 py-2 text-xs font-black text-white">Reject Payment</button>
                <button onClick={() => updateOrder(o.id, { status: 'processing', order_status: 'processing' } as Partial<OrderRow>)} className="rounded-full bg-stone-100 px-4 py-2 text-xs font-black dark:bg-white/10">Mark Processing</button>
                <button onClick={() => updateOrder(o.id, { status: 'shipped', order_status: 'shipped' } as Partial<OrderRow>)} className="rounded-full bg-blue-600 px-4 py-2 text-xs font-black text-white">Mark Shipped</button>
                <button onClick={() => updateOrder(o.id, { status: 'delivered', order_status: 'delivered' } as Partial<OrderRow>)} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white">Mark Delivered</button>
                <button onClick={() => updateOrder(o.id, { status: 'cancelled', order_status: 'cancelled' } as Partial<OrderRow>)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white">Cancel Order</button>
                <Link href={`/invoice/${o.id}`} className="rounded-full border border-stone-300 px-4 py-2 text-xs font-black dark:border-white/10">Invoice / PDF</Link>
                <Link href={`/track?code=${o.tracking_code || o.tracking_number || o.id}`} className="rounded-full border border-blue-300 px-4 py-2 text-xs font-black text-blue-800 dark:border-blue-500/30 dark:text-blue-200">Customer tracking page</Link>
                <Link href="/admin/notifications" className="rounded-full border border-amber-300 px-4 py-2 text-xs font-black text-amber-800 dark:border-amber-500/30 dark:text-amber-200">Notify Customer</Link>
                {savingId === o.id && <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-800">Saving...</span>}
              </div>
            </article>
          );
        })}
        {visible.length === 0 && <p className="rounded-2xl bg-stone-50 p-6 text-stone-500 dark:bg-black/20 dark:text-white/50">No orders found for this filter.</p>}
      </div>}
    </section>
  );
}

function formatAddress(customer: any) {
  if (!customer) return 'No shipping address saved.';
  const parts = [customer.address, customer.street, customer.city, customer.province, customer.region, customer.zip, customer.postal_code].filter(Boolean);
  return parts.length ? parts.join(', ') : 'No shipping address saved.';
}

function Select({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-widest text-stone-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 font-bold outline-none focus:border-amber-700 disabled:opacity-50 dark:border-white/10 dark:bg-black/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ProductTable({ products, editing, deleteProduct }: { products: ManagedProduct[]; editing: (p: ManagedProduct) => void; deleteProduct: (id: string) => void | Promise<void>; }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b border-stone-200 text-xs uppercase tracking-widest text-stone-500 dark:border-white/10 dark:text-white/40">
          <tr><th className="py-3">Product</th><th>Hero</th><th>Promo/Event</th><th>Stock</th><th>10ml EDP</th><th>85ml Extrait</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-stone-100 dark:border-white/5">
              <td className="py-4"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-14 w-14 rounded-2xl object-cover" /><div><p className="font-black">{p.name}</p><p className="text-xs text-stone-500">{p.family} • {p.category || 'perfumes'}</p></div></div></td>
              <td><span className={`rounded-full px-3 py-1 text-xs font-black ${p.hero_enabled ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'}`}>{p.hero_enabled ? `Hero #${p.hero_order || 0}` : 'Not hero'}</span><p className="mt-1 max-w-xs truncate text-xs text-stone-500">{p.hero_button_text || 'View Perfume'}</p></td>
              <td><p className="font-bold">{p.promo || p.tag}</p><p className="max-w-xs truncate text-xs text-stone-500">{p.event || 'No event'}</p></td>
              <td>{p.stock}</td>
              <td><Price amount={p.variants?.[0]?.prices?.['10ml'] || p.price} className="font-black" /></td>
              <td><Price amount={p.variants?.[1]?.prices?.['85ml'] || p.price} className="font-black" /></td>
              <td><span className={`rounded-full px-3 py-1 text-xs font-black ${p.active === false ? 'bg-stone-100 text-stone-500' : p.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.active === false ? 'Hidden' : p.stock <= 10 ? 'Low stock' : 'Active'}</span></td>
              <td><div className="flex gap-2"><button onClick={() => editing(p)} className="rounded-full bg-stone-950 px-4 py-2 text-xs font-black text-white">Edit</button><button onClick={() => deleteProduct(p.id)} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white">Delete</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({ usingSupabase }: { usingSupabase: boolean }) {
  return <p className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${usingSupabase ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200' : 'bg-amber-500/15 text-amber-800 dark:text-amber-200'}`}>{usingSupabase ? 'Supabase connected' : 'Demo mode: add Supabase keys for real database'}</p>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5"><p className="text-sm font-bold text-stone-500 dark:text-white/50">{label}</p><p className="mt-2 text-4xl font-black">{value}</p></div>;
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return <label className="mt-4 block"><span className="text-sm font-bold text-stone-500 dark:text-white/50">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-amber-700 dark:border-white/10 dark:bg-black/20" /></label>;
}
