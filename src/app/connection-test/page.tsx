'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function ConnectionTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function testOrder() {
    setLoading(true);
    setResult('Testing...');
    try {
      if (!isSupabaseConfigured || !supabase) {
        setResult('NOT CONNECTED: .env.local was not loaded. Check the filename and restart npm run dev.');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer: {
            first_name: 'Connection',
            last_name: 'Test',
            email: 'test@example.com',
            phone: '0000',
            address: 'Test only',
            payment_method: 'Test',
          },
          items: [
            {
              product_id: 'connection-test',
              product_name: 'Connection Test Product',
              size: '10ml',
              concentration: 'EDP',
              quantity: 1,
              unit_price: 1,
              line_total: 1,
            },
          ],
          subtotal: 1,
          status: 'connection-test',
        })
        .select('id')
        .single();

      if (error) {
        setResult(`SUPABASE ERROR: ${error.message}`);
        return;
      }

      setResult(`CONNECTED ✅ Test order saved. Order ID: ${data?.id}`);
    } catch (err: any) {
      setResult(`ERROR: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-6 py-16 text-stone-950 dark:bg-[#0f0d0a] dark:text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-xl dark:bg-white/5">
        <Link href="/" className="font-bold text-amber-800">← Back home</Link>
        <h1 className="mt-6 text-4xl font-black">Supabase Connection Test</h1>
        <p className="mt-4 text-stone-600 dark:text-white/60">
          Click the button below. If successful, a test row will appear in Supabase Table Editor → orders.
        </p>
        <button
          onClick={testOrder}
          disabled={loading}
          className="mt-8 rounded-full bg-stone-950 px-8 py-4 font-black text-white hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-700"
        >
          {loading ? 'Testing...' : 'Test Supabase Order Save'}
        </button>
        {result && (
          <pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-stone-100 p-5 font-bold text-stone-900 dark:bg-black/30 dark:text-white">
            {result}
          </pre>
        )}
      </div>
    </main>
  );
}
