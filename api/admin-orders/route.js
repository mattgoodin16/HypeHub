import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const adminKey = req.headers.get('x-admin-key');

  if (!adminKey || adminKey !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (ordersError) {
    console.error(ordersError);
    return new Response(JSON.stringify({ error: 'Failed to fetch orders' }), {
      status: 500
    });
  }

  const orderIds = orders.map((o) => o.id);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error(itemsError);
    return new Response(JSON.stringify({ error: 'Failed to fetch items' }), {
      status: 500
    });
  }

  const itemsByOrder = {};
  items.forEach((it) => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
    itemsByOrder[it.order_id].push(it);
  });

  const combined = orders.map((o) => ({
    ...o,
    items: itemsByOrder[o.id] || []
  }));

  return new Response(JSON.stringify({ orders: combined }), { status: 200 });
}
