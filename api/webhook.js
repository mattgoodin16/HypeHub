import Stripe from 'stripe';

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('ORDER PAID:', {
      amount: session.amount_total / 100,
      email: session.customer_details.email,
      sessionId: session.id
    });

    // Here you will store the order in Supabase (next step)
  }

  return new Response('OK', { status: 200 });
}
