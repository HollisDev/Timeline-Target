import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Try to get user, but do not require auth for checkout; we will create a Stripe customer regardless
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required field: priceId' },
        { status: 400 }
      );
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

    let customerParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      }/dashboard?payment=success`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
      }/#pricing?payment=cancelled`,
    };

    if (user) {
      // Ensure we have or create a Stripe customer for this user
      let stripeCustomerId: string | null = null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

      stripeCustomerId = profile?.stripe_customer_id ?? null;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          metadata: { supabase_user_id: user.id },
        });
        stripeCustomerId = customer.id;
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', user.id);
      }

      customerParams = {
        ...customerParams,
        customer: stripeCustomerId!,
        metadata: { supabase_user_id: user.id },
      };
    } else {
      // No auth: let Stripe collect customer and email
      customerParams = {
        ...customerParams,
        customer_creation: 'always',
      } as Stripe.Checkout.SessionCreateParams;
    }

    const session = await stripe.checkout.sessions.create(customerParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Unexpected error in Stripe checkout:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
