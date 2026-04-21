import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { charity_id, amount } = await request.json()
    if (!charity_id || !amount || amount < 1)
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 })

    const { data: charity } = await supabase.from('charities').select('name').eq('id', charity_id).single()
    if (!charity) return NextResponse.json({ error: 'Charity not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: profile?.email || user.email!, metadata: { supabase_user_id: user.id } })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(amount * 100),
          product_data: { name: `Donation to ${charity.name}` },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charity_id}?donated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/charities/${charity_id}`,
      metadata: { user_id: user.id, charity_id, amount: String(amount), type: 'donation' },
    })

    // Record pending donation
    await supabase.from('donations').insert({
      user_id: user.id,
      charity_id,
      amount,
      stripe_payment_intent_id: session.id,
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
