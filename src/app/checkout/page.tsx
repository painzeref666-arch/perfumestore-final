'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import Price from '@/components/Price';
import { useCart } from '@/context/CartContext';
import { isSupabaseConfigured, supabase, type CustomerDetails } from '@/lib/supabase';
import { computeShipping, deductInventory, makeTrackingCode, validateCoupon } from '@/lib/store-utils';

const regions = ['NCR', 'Luzon', 'Visayas', 'Mindanao'];
const gcashName = 'Kristine Mae Rimpillo.';
const gcashNumber = '09667482949';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('Luzon');
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');

  const shipping = useMemo(() => computeShipping(subtotal, region), [subtotal, region]);
  const total = Math.max(0, subtotal + shipping - discount);
  const needsProof = paymentMethod.includes('GCash') || paymentMethod.includes('Maya');

  async function applyCoupon() {
    const result = await validateCoupon(coupon, subtotal);
    setDiscount(result.discount);
    setCouponMessage(result.message);
  }

  function handleProof(file: File | null) {
    setProofFile(file);
    setProofPreview('');
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProofPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadPaymentProof(file: File, tracking: string) {
    if (!isSupabaseConfigured || !supabase) return '';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const filePath = `proofs/${tracking}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('payment-proofs').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || `image/${ext}`,
    });
    if (uploadError) throw new Error(`Payment proof upload failed: ${uploadError.message}`);
    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (needsProof && !proofFile) {
        setError('Please upload your GCash/Maya payment screenshot before placing the order.');
        setLoading(false);
        return;
      }

      const form = new FormData(e.currentTarget);
      const customer: CustomerDetails & { region: string; payment_method: string } = {
        first_name: String(form.get('first_name') || ''),
        last_name: String(form.get('last_name') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
        address: String(form.get('address') || ''),
        payment_method: paymentMethod,
        region,
      };

      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        product_name: i.product.name,
        name: i.product.name,
        size: i.size,
        concentration: i.concentration,
        quantity: i.quantity,
        qty: i.quantity,
        unit_price: i.unitPrice,
        price: i.unitPrice,
        line_total: i.lineTotal,
        total: i.lineTotal,
      }));

      const code = makeTrackingCode();
      let proofUrl = '';
      if (needsProof && proofFile) proofUrl = await uploadPaymentProof(proofFile, code);

      const orderPayload: any = {
        customer,
        items: orderItems,
        subtotal,
        status: 'new',
        shipping_method: region === 'NCR' ? 'Metro Manila standard' : `${region} standard`,
        shipping_fee: shipping,
        discount,
        coupon_code: coupon.trim().toUpperCase() || null,
        total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'Cash on Delivery' ? 'COD Pending' : 'For Verification',
        payment_reference: String(form.get('payment_reference') || ''),
        payment_proof_url: proofUrl,
        payment_note: needsProof ? 'Customer uploaded manual payment proof. Admin verification required.' : 'Cash on Delivery order.',
        tracking_code: code,
        tracking_number: '',
      };

      if (isSupabaseConfigured && supabase) {
        let response = await supabase.from('orders').insert(orderPayload).select('id, tracking_code').single();

        if (response.error && response.error.message.toLowerCase().includes('column')) {
          response = await supabase
            .from('orders')
            .insert({ customer, items: orderItems, subtotal: total, status: 'new', payment_status: orderPayload.payment_status })
            .select('id')
            .single();
        }

        if (response.error) {
          setError(`Order save failed: ${response.error.message}`);
          setLoading(false);
          return;
        }

        await deductInventory(items);
        setOrderId(response.data?.id || '');
        setTrackingCode(response.data?.tracking_code || code);
      } else {
        const fakeId = `DEMO-${Date.now()}`;
        setOrderId(fakeId);
        setTrackingCode(code);
        try {
          const saved = JSON.parse(localStorage.getItem('perfumestore-demo-orders') || '[]');
          localStorage.setItem('perfumestore-demo-orders', JSON.stringify([{ id: fakeId, tracking_code: code, ...orderPayload }, ...saved]));
        } catch {}
      }

      setSubmitted(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/products" className="font-bold text-amber-800">← Back to products</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-white/5 md:p-8">
            <p className="font-bold uppercase tracking-[.25em] text-amber-700">Checkout</p>
            <h1 className="mt-3 text-4xl font-black">Customer details</h1>
            <p className="mt-3 rounded-2xl bg-stone-100 p-4 text-sm font-bold text-stone-700 dark:bg-black/30 dark:text-white/70">Database status: {isSupabaseConfigured ? 'Supabase connected ✅' : 'Demo mode only ❌ .env.local not loaded'}</p>

            {submitted ? (
              <div className="mt-10 rounded-[2rem] bg-emerald-50 p-8 text-center text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200">
                <h2 className="text-3xl font-black">Order submitted!</h2>
                <p className="mt-3">Order ID: <span className="font-black">{orderId}</span></p>
                <p className="mt-2">Tracking code: <span className="font-black">{trackingCode}</span></p>
                <p className="mt-2">{paymentMethod === 'Cash on Delivery' ? 'Your COD order is now pending admin processing.' : 'Your payment proof was sent. Please wait for admin verification.'}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href={`/track?code=${trackingCode}`} className="rounded-full bg-stone-950 px-6 py-3 font-black text-white">Track order</Link>
                  <Link href="/products" className="rounded-full bg-emerald-700 px-6 py-3 font-black text-white">Shop again</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-8 grid gap-4">
                {error && <p className="rounded-2xl bg-red-100 p-4 font-bold text-red-800 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="first_name" required placeholder="First name" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
                  <input name="last_name" required placeholder="Last name" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
                </div>
                <input name="email" type="email" required placeholder="Email address" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
                <input name="phone" required placeholder="Phone number" className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
                <textarea name="address" required placeholder="Complete delivery address" className="h-28 rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20" />
                <select value={region} onChange={(e)=>setRegion(e.target.value)} className="rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20">
                  {regions.map((r)=><option key={r}>{r}</option>)}
                </select>

                <div className="rounded-[2rem] border border-stone-200 p-4 dark:border-white/10 dark:bg-black/20">
                  <p className="font-black">Payment method</p>
                  <select name="payment_method" required value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)} className="mt-3 w-full rounded-2xl border border-stone-200 px-5 py-4 dark:border-white/10 dark:bg-black/20">
                    <option>Cash on Delivery</option>
                    <option>GCash manual verification</option>
                    <option>Maya manual verification</option>
                  </select>

                  {needsProof && (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
                      <h3 className="font-black">Manual payment instructions</h3>
                      <p className="mt-2 text-sm">Send your payment to:</p>
                      <p className="mt-2 font-black">Account name: {gcashName}</p>
                      <p className="font-black">GCash/Maya number: {gcashNumber}</p>
                      <p className="mt-3 text-xs font-bold opacity-80">Replace this number later with your real business GCash/Maya number in the checkout file.</p>
                      <input name="payment_reference" placeholder="Reference number / transaction ID" className="mt-4 w-full rounded-2xl border border-amber-200 px-5 py-4 text-stone-950 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                      <label className="mt-4 block text-sm font-black">Upload payment screenshot</label>
                      <input type="file" accept="image/*" onChange={(e)=>handleProof(e.target.files?.[0] || null)} className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-stone-950 dark:border-white/10 dark:bg-black/20 dark:text-white" />
                      {proofPreview && <img src={proofPreview} alt="Payment proof preview" className="mt-4 max-h-56 w-full rounded-2xl object-cover" />}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="font-black text-amber-900 dark:text-amber-100">Coupon</p>
                  <div className="mt-3 flex gap-2">
                    <input value={coupon} onChange={(e)=>setCoupon(e.target.value)} placeholder="WELCOME10 or FREESHIP" className="min-w-0 flex-1 rounded-full border border-amber-200 px-5 py-3 dark:border-white/10 dark:bg-black/20" />
                    <button type="button" onClick={applyCoupon} className="rounded-full bg-amber-800 px-5 py-3 font-black text-white">Apply</button>
                  </div>
                  {couponMessage && <p className="mt-2 text-sm font-bold text-amber-900 dark:text-amber-100">{couponMessage}</p>}
                </div>
                <button disabled={items.length === 0 || loading} className="mt-4 rounded-full bg-stone-950 px-8 py-4 font-black text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-amber-700">{loading ? 'Placing order...' : 'Place Order'}</button>
              </form>
            )}
          </section>

          <aside className="h-fit rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl md:p-8">
            <p className="font-bold uppercase tracking-[.25em] text-amber-300">Order summary</p>
            <div className="mt-6 space-y-4">
              {items.length === 0 ? <p className="text-white/60">No items in cart.</p> : items.map((i) => (
                <div key={i.key} className="flex justify-between gap-4 border-b border-white/10 pb-4">
                  <div><p className="font-black">{i.product.name}</p><p className="text-sm text-white/50">{i.size} • {i.concentration} • Qty {i.quantity}</p></div>
                  <Price amount={i.lineTotal} className="font-black" />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-white/75">
              <div className="flex justify-between"><span>Subtotal</span><Price amount={subtotal} /></div>
              <div className="flex justify-between"><span>Shipping</span><Price amount={shipping} /></div>
              <div className="flex justify-between"><span>Discount</span><Price amount={-discount} /></div>
            </div>
            <div className="mt-6 flex justify-between border-t border-white/10 pt-6 text-2xl font-black"><span>Total</span><Price amount={total} /></div>
            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-xs text-white/70">Phase 1 checkout supports COD and manual GCash/Maya proof upload with admin verification.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
