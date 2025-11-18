// api/admin-orders.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  const auth = req.headers['x-admin-key'];
  if (!auth || auth !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Simple list of latest orders + items
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (ordersError) {
    console.error(ordersError);
    res.status(500).json({ error: 'Failed to fetch orders' });
    return;
  }

  const orderIds = orders.map(o => o.id);

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  if (itemsError) {
    console.error(itemsError);
    res.status(500).json({ error: 'Failed to fetch order items' });
    return;
  }

  // Group items by order_id
  const itemsByOrder = {};
  items.forEach(it => {
    if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
    itemsByOrder[it.order_id].push(it);
  });

  const combined = orders.map(order => ({
    ...order,
    items: itemsByOrder[order.id] || []
  }));

  res.status(200).json({ orders: combined });
};
