import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (ordersError) {
    console.error(ordersError);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }

  const orderIds = orders.map((o) => o.id);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error(itemsError);
    return res.status(500).json({ error: 'Failed to fetch items' });
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

  return res.status(200).json({ orders: combined });
}
