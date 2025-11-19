import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs'
};

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await req.json();
    const items = body.items || [];
    const origin = body.origin || '';

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            id: item.id,
            color: item.color,
            size: item.size
          }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/cart.html`
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ error: 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
