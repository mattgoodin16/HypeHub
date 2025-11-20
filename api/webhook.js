import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  let rawBody = '';
  await new Promise((resolve) => {
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', resolve);
  });

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Invalid signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100
      });

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          customer_email: session.customer_details?.email || null,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = lineItems.data.map((li) => ({
        order_id: order.id,
        product_name: li.description,
        quantity: li.quantity,
        unit_amount: li.price?.unit_amount || 0,
        currency: li.price?.currency || 'usd'
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      console.log('Stored order', order.id);
    } catch (err) {
      console.error('Error storing order:', err);
      return res.status(500).send('Failed to store order');
    }
  }

  res.status(200).send('OK');
}
