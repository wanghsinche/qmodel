// This is your test secret API key.
import Stripe from 'stripe';
import { getEnv } from './store';

export async function createCheckoutSession(priceId: string, quantity: number, resultURL: string) {
    const env = getEnv();
    const stripe = new Stripe(env.STRIPE_SECRET_KEY as string);

    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: priceId,
            quantity,
          },
        ],
        mode: 'payment',
        success_url: `${resultURL}?success=true`,
        cancel_url: `${resultURL}?canceled=true`,
      });

      return session.url;
}