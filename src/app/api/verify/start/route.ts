import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { SINCH_API_USER, SINCH_API_PASS } = process.env;
  if (!SINCH_API_USER || !SINCH_API_PASS) {
    return NextResponse.json({ error: 'Missing Sinch credentials' }, { status: 500 });
  }
  const { phone } = await req.json();
  const url = 'https://verification.api.sinch.com/verification/v1/verifications';
  const auth = Buffer.from(`${SINCH_API_USER}:${SINCH_API_PASS}`).toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: { type: 'number', endpoint: phone }, method: 'sms' })
  }); // swagger.json](file-service://file-QgkHyipNhGCMnPKan6Fgax)

  const payload = await res.json();
  if (!res.ok) return NextResponse.json({ error: payload }, { status: res.status });
  return NextResponse.json(payload);
}