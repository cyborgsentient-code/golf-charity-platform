import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Webhook endpoint is reachable' })
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'POST received' })
}
