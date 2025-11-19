import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        { limit: 100 }
      );

      const { data: insertedOrders, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: session.id,
          email: session.customer_details?.email || null,
          amount_total: session.amount_total,
          currency: session.currency || 'usd'
        })
        .select()
        .limit(1);

      if (orderError) throw orderError;
      const order = insertedOrders[0];

      const itemsToInsert = lineItems.data.map((li) => ({
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
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      console.log('Stored order', order.id);
    } catch (err) {
      console.error('Error storing order:', err);
      return new Response('Failed to store order', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}
