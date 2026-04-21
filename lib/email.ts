import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Golf Charity Platform <onboarding@resend.dev>'

export async function sendDrawResultEmail(to: string, name: string, matchedCount: number, prizeTier: string | null, prizeAmount: number, drawDate: string) {
  const subject = prizeTier ? `🏆 You won in the ${drawDate} draw!` : `Your draw results for ${drawDate}`
  const body = prizeTier
    ? `Hi ${name},\n\nCongratulations! You matched ${matchedCount} numbers in the ${drawDate} draw and won $${prizeAmount.toFixed(2)}.\n\nLog in to your dashboard to submit your winner proof.\n\nhttps://golfcharity.com/dashboard`
    : `Hi ${name},\n\nThe ${drawDate} draw has been completed. You matched ${matchedCount} number${matchedCount !== 1 ? 's' : ''} this time. Keep playing — the jackpot rolls over!\n\nhttps://golfcharity.com/dashboard`

  await resend.emails.send({ from: FROM, to, subject, text: body })
}

export async function sendWinnerAlertEmail(to: string, name: string, prizeAmount: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '🎉 Your winner verification has been approved!',
    text: `Hi ${name},\n\nYour winner verification has been approved. Your prize of $${prizeAmount.toFixed(2)} is being processed.\n\nYou will receive payment shortly.\n\nhttps://golfcharity.com/dashboard`,
  })
}

export async function sendPaymentConfirmationEmail(to: string, name: string, prizeAmount: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '💰 Your prize payment has been sent!',
    text: `Hi ${name},\n\nGreat news! Your prize payment of $${prizeAmount.toFixed(2)} has been marked as paid.\n\nThank you for playing Golf Charity Platform!\n\nhttps://golfcharity.com/dashboard`,
  })
}

export async function sendSubscriptionConfirmationEmail(to: string, name: string, planName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: '✅ Welcome to Golf Charity Platform!',
    text: `Hi ${name},\n\nYour ${planName} subscription is now active. You can now enter your golf scores and participate in monthly draws.\n\nEvery subscription contributes to your chosen charity — thank you for making a difference!\n\nhttps://golfcharity.com/dashboard`,
  })
}
