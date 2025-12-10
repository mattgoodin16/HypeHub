import Stripe from 'stripe';

// Same promo codes as in public/script.js
const PROMO_CODES = {
  '18492': 0.10,   // 10%
  '30751': 0.15,   // 15%
  '52937': 0.175,  // 17.5%
  '64018': 0.20,   // 20%
  '75293': 0.225,  // 22.5%
  '89640': 0.25    // 25%
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { items = [], origin = '', promoCode = null } = req.body || {};

    if (!items.length) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Recalculate subtotal + discount on the server
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    // Auto deal: Buy 2, get 10% off
    const autoDiscountRate = totalItems >= 2 ? 0.10 : 0;

    // Promo code (if valid)
    const promoRate = promoCode && PROMO_CODES[promoCode] ? PROMO_CODES[promoCode] : 0;

    // Promo overrides auto-discount if present
    const discountRate = promoRate > 0 ? promoRate : autoDiscountRate;

    // Build Stripe line items, applying discountRate to unit_amount
    const lineItems = items.map((item) => {
      const basePrice = Number(item.price || 0);
      const qty = Number(item.quantity || 1);

      const discountedUnit =
        discountRate > 0 ? basePrice * (1 - discountRate) : basePrice;

      return {
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
          unit_amount: Math.round(discountedUnit * 100) // cents
        },
        quantity: qty
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/cart.html`,
      metadata: {
        promoCode: promoCode || '',
        discountRate: discountRate.toString()
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
}
