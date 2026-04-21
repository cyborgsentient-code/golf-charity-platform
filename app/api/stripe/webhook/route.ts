import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendSubscriptionConfirmationEmail } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  console.log('=== WEBHOOK RECEIVED ===')
  console.log('Signature present:', !!signature)
  console.log('Body length:', body.length)

  if (!signature) {
    console.error('❌ No signature provided')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Event verified:', event.type)
    console.log('Event ID:', event.id)
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message)
    console.error('Webhook secret (first 10 chars):', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10))
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Handle one-time donation
        if (session.metadata?.type === 'donation') {
          await supabase
            .from('donations')
            .update({ status: 'completed' })
            .eq('stripe_payment_intent_id', session.id)
          break
        }

        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id

        if (!userId) {
          console.error('❌ No user_id in metadata')
          break
        }

        if (!session.subscription) {
          console.error('❌ No subscription ID in session')
          break
        }

        // Fetch Stripe subscription to get period dates
        const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)

        console.log('Attempting to update profile...')
        const { data, error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            stripe_subscription_id: session.subscription as string,
            subscription_plan_id: planId,
            subscription_start_date: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            subscription_end_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)
          .select()

        if (error) {
          console.error('❌ Database update error:', error)
        } else {
          console.log('✅ Profile updated successfully:', data)
          // Send subscription confirmation email
          const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', userId).single()
          const { data: plan } = await supabase.from('subscription_plans').select('name').eq('id', planId).single()
          if (profile?.email) {
            sendSubscriptionConfirmationEmail(profile.email, profile.full_name || 'Golfer', plan?.name || 'subscription').catch(() => {})
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log('=== SUBSCRIPTION UPDATED ===')
        console.log('Subscription ID:', subscription.id)
        console.log('Customer ID:', customerId)
        console.log('Status:', subscription.status)

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        console.log('Found profile:', profile)

        if (profile) {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', profile.id)
            .select()

          if (error) {
            console.error('❌ Update error:', error)
          } else {
            console.log('✅ Updated profile:', data)
          }
        } else {
          console.error('❌ No profile found for customer:', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log('=== SUBSCRIPTION DELETED ===')
        console.log('Subscription ID:', subscription.id)
        console.log('Customer ID:', customerId)

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        console.log('Found profile:', profile)

        if (profile) {
          const { data, error } = await supabase
            .from('profiles')
            .update({ subscription_status: 'inactive' })
            .eq('id', profile.id)
            .select()

          if (error) {
            console.error('❌ Update error:', error)
          } else {
            console.log('✅ Updated profile:', data)
          }
        } else {
          console.error('❌ No profile found for customer:', customerId)
        }
        break
      }
    }

    console.log('=== WEBHOOK PROCESSING COMPLETE ===')
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
