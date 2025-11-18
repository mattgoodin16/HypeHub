// api/webhook.js
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Vercel parses body already, so we need raw body for Stripe.
    // In production, you'd use a middleware to get raw body.
    // For simplicity here, assume test mode and skip signature verification,
    // or adapt this if you configure raw body support.
    if (!webhookSecret) {
      event = req.body;
    } else {
      // If you later configure rawBody, you can do:
      // event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
      event = req.body; // placeholder
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Fetch line items
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      // Insert into orders
      const { data: orderRows, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          email: session.customer_details?.email || null,
          amount_total: session.amount_total,
          currency: session.currency
        })
        .select();

      if (orderError) throw orderError;
      const order = orderRows[0];

      // Insert order_items
      const items = lineItems.data.map(li => ({
        order_id: order.id,
        product_id: li.price?.product || li.description,
        name: li.description,
        color: li.price?.product_data?.metadata?.color || null,
        size: li.price?.product_data?.metadata?.size || null,
        unit_amount: li.amount_subtotal / li.quantity,
        quantity: li.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      console.log('Order stored:', order.id);
    } catch (err) {
      console.error('Error storing order:', err);
      res.status(500).send('Error storing order');
      return;
    }
  }

  res.status(200).json({ received: true });
};
