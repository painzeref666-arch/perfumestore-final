import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ADMIN_EMAIL = 'jenelyn.rimpillo26@gmail.com';
const SENDER_EMAIL = 'orders@exousiaandco.com';

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] || character);
}

export async function POST(request: NextRequest) {
  try {
    const { trackingCode } = await request.json();
    if (typeof trackingCode !== 'string' || !/^[A-Za-z0-9-]{5,80}$/.test(trackingCode)) {
      return NextResponse.json({ error: 'Invalid tracking code.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;
    if (!supabaseUrl || !serviceKey || !resendKey) {
      console.error('Order notification environment variables are incomplete.');
      return NextResponse.json({ error: 'Notification service is not configured.' }, { status: 503 });
    }

    const baseUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders`;
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };
    const orderResponse = await fetch(`${baseUrl}?select=id,tracking_code,customer_name,customer_email,customer_phone,customer_address,payment_method,payment_status,subtotal,shipping_fee,shipping,discount,total,items,notification_status&tracking_code=eq.${encodeURIComponent(trackingCode)}&limit=1`, { headers, cache: 'no-store' });
    if (!orderResponse.ok) {
      console.error('Could not verify order for notification:', await orderResponse.text());
      return NextResponse.json({ error: 'Could not verify saved order.' }, { status: 502 });
    }
    const orders = await orderResponse.json();
    const order = orders?.[0];
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.notification_status === 'sent' || order.notification_status === 'sending') {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Claim this order so repeated public requests cannot send duplicate emails.
    const claimResponse = await fetch(`${baseUrl}?id=eq.${encodeURIComponent(order.id)}&notification_status=eq.not_sent`, {
      method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify({ notification_status: 'sending' }), cache: 'no-store',
    });
    if (!claimResponse.ok) {
      console.error('Could not claim order notification:', await claimResponse.text());
      return NextResponse.json({ error: 'Could not prepare notification.' }, { status: 502 });
    }
    const claimed = await claimResponse.json();
    if (!Array.isArray(claimed) || claimed.length === 0) return NextResponse.json({ ok: true, alreadyProcessed: true });

    const items = Array.isArray(order.items) ? order.items : [];
    const itemRows = items.map((item: any) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.product_name || item.name || 'Item')}</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(item.quantity || item.qty || 1)}</td><td style="padding:8px;border-bottom:1px solid #eee">₱${Number(item.line_total ?? item.total ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td></tr>`).join('');
    const money = (value: unknown) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const html = `<div style="font-family:Arial,sans-serif;color:#292524;max-width:680px;margin:auto"><h2 style="color:#92400e">New order received — Exousia &amp; Co.</h2><p>A customer has placed a new order on your website.</p><p><strong>Tracking code:</strong> ${escapeHtml(order.tracking_code)}</p><h3>Customer details</h3><p><strong>Name:</strong> ${escapeHtml(order.customer_name)}<br><strong>Email:</strong> ${escapeHtml(order.customer_email)}<br><strong>Phone:</strong> ${escapeHtml(order.customer_phone)}<br><strong>Address:</strong> ${escapeHtml(order.customer_address)}</p><h3>Order items</h3><table style="width:100%;border-collapse:collapse"><thead><tr><th align="left" style="padding:8px">Product</th><th align="left" style="padding:8px">Qty</th><th align="left" style="padding:8px">Amount</th></tr></thead><tbody>${itemRows}</tbody></table><p><strong>Payment:</strong> ${escapeHtml(order.payment_method)} (${escapeHtml(order.payment_status)})</p><p>Subtotal: ${money(order.subtotal)}<br>Shipping: ${money(order.shipping_fee ?? order.shipping)}<br>Discount: ${money(order.discount)}<br><strong>Total: ${money(order.total)}</strong></p><p style="color:#78716c;font-size:12px">This notification was generated from the saved order record.</p></div>`;

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `Exousia & Co. Orders <${SENDER_EMAIL}>`, to: [ADMIN_EMAIL], subject: `New order ${order.tracking_code} — Exousia & Co.`, html }),
    });
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      await fetch(`${baseUrl}?id=eq.${encodeURIComponent(order.id)}`, { method: 'PATCH', headers, body: JSON.stringify({ notification_status: 'failed' }) });
      console.error('Resend error:', errorText);
      return NextResponse.json({ error: 'Email provider rejected the notification.' }, { status: 502 });
    }

    await fetch(`${baseUrl}?id=eq.${encodeURIComponent(order.id)}`, { method: 'PATCH', headers, body: JSON.stringify({ notification_status: 'sent' }) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Order notification error:', error);
    return NextResponse.json({ error: 'Unable to send order notification.' }, { status: 500 });
  }
}
