import { supabase } from '@/lib/supabase';

type CartLine = { product: { id: string; stock?: number }; quantity: number };

export function computeShipping(subtotal: number, region: string) {
  if (subtotal >= 3000) return 0;
  if (region === 'NCR') return 120;
  if (region === 'Luzon') return 180;
  if (region === 'Visayas') return 220;
  if (region === 'Mindanao') return 260;
  return 180;
}

export async function validateCoupon(code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, discount: 0, message: '' };

  if (supabase) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', normalized)
      .eq('active', true)
      .maybeSingle();

    if (!error && data) {
      const min = Number(data.min_subtotal || 0);
      if (subtotal < min) return { ok: false, discount: 0, message: `Minimum order is ₱${min}.` };
      const raw = data.type === 'percent' ? subtotal * (Number(data.value || 0) / 100) : Number(data.value || 0);
      const discount = Math.min(subtotal, Math.round(raw));
      return { ok: true, discount, message: `${normalized} applied.` };
    }
  }

  if (normalized === 'WELCOME10') return { ok: true, discount: Math.round(subtotal * 0.1), message: 'WELCOME10 applied.' };
  if (normalized === 'FREESHIP') return { ok: true, discount: 0, message: 'Free shipping coupon accepted.' };
  return { ok: false, discount: 0, message: 'Coupon not found.' };
}

export async function deductInventory(lines: CartLine[]) {
  if (!supabase) return;
  for (const line of lines) {
    const current = Number(line.product.stock || 0);
    const nextStock = Math.max(0, current - line.quantity);
    await supabase.from('products').update({ stock: nextStock }).eq('id', line.product.id);
  }
}

export function makeTrackingCode() {
  return `EXO-${Date.now().toString().slice(-8)}`;
}
