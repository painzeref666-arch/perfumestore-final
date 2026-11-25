import { NextRequest, NextResponse } from 'next/server';

const fields = ['client_name','contact_number','email','preferred_contact','event_type','event_name','event_date','start_time','end_time','guest_count','venue_name','event_address','estimated_budget','package_interest','theme_or_dress_code','special_requests'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ['client_name','contact_number','email','event_type','event_date','guest_count','event_address'];
    if (required.some((key) => !String(body?.[key] ?? '').trim())) return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(String(body.email))) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    const guestCount = Number(body.guest_count);
    if (!Number.isInteger(guestCount) || guestCount < 1) return NextResponse.json({ error: 'Guest count must be at least one.' }, { status: 400 });

    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!base || !anon) return NextResponse.json({ error: 'Booking service is not configured.' }, { status: 503 });

    const record: Record<string, unknown> = {};
    for (const field of fields) record[field] = body[field] || null;
    record.guest_count = guestCount;

    const insert = await fetch(`${base}/rest/v1/event_scents_bookings`, {
      method: 'POST', cache: 'no-store', headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(record),
    });
    const insertText = await insert.text();
    if (!insert.ok) return NextResponse.json({ error: 'We could not save your inquiry. Please try again.', details: insertText.slice(0, 400) }, { status: 500 });

    let emailSent = false;
    const resendKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.EVENT_SCENTS_ADMIN_EMAIL;
    if (resendKey && adminEmail) {
      const safe = (v: unknown) => String(v || '—').replace(/[<>]/g, '');
      const html = `<h2>New Event Scents booking inquiry</h2><h3>Client</h3><p><b>Name:</b> ${safe(body.client_name)}<br/><b>Phone:</b> ${safe(body.contact_number)}<br/><b>Email:</b> ${safe(body.email)}<br/><b>Preferred contact:</b> ${safe(body.preferred_contact)}</p><h3>Event</h3><p><b>Type:</b> ${safe(body.event_type)}<br/><b>Name:</b> ${safe(body.event_name)}<br/><b>Date:</b> ${safe(body.event_date)}<br/><b>Time:</b> ${safe(body.start_time)} – ${safe(body.end_time)}<br/><b>Guests:</b> ${safe(guestCount)}<br/><b>Venue:</b> ${safe(body.venue_name)}<br/><b>Address:</b> ${safe(body.event_address)}</p><h3>Preferences</h3><p><b>Package:</b> ${safe(body.package_interest)}<br/><b>Budget:</b> ${safe(body.estimated_budget)}<br/><b>Theme:</b> ${safe(body.theme_or_dress_code)}<br/><b>Requests:</b> ${safe(body.special_requests)}</p>`;
      const mail = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EVENT_SCENTS_EMAIL_FROM || 'Event Scents <onboarding@resend.dev>', to: [adminEmail], reply_to: body.email, subject: `New Event Scents inquiry — ${safe(body.event_type)} | ${safe(body.event_date)}`, html }) });
      emailSent = mail.ok;
    }
    return NextResponse.json({ success: true, emailSent });
  } catch {
    return NextResponse.json({ error: 'Unexpected booking submission error.' }, { status: 500 });
  }
}
