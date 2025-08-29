import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const sig = request.headers.get('stripe-signature');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (!sig || !endpointSecret || !stripeSecret) {
      return NextResponse.json(
        { error: 'Stripe webhook not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
      console.error(
        'Stripe webhook signature verification failed',
        err?.message
      );
      return new NextResponse('Invalid signature', { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata as any)?.supabase_user_id as
        | string
        | undefined;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan: 'pro', subscription_status: 'active' })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Unexpected error in Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
