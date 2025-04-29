// src/app/api/join/route.ts
export const runtime = 'edge';

import { NextResponse } from 'next/server';

const BASE_URL = process.env.KORONA_BASE_URL!;
const KORONA_ACCOUNT_ID = process.env.KORONA_ACCOUNT_ID!;
const AUTH_HEADER =
  'Basic ' +
  Buffer
    .from(`${process.env.KORONA_USER}:${process.env.KORONA_PASS}`)
    .toString('base64');

interface KoronaCustomer {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email?: string;
}

interface KoronaSearchResults<T> {
  currentPage: number;
  pagesTotal: number;
  results: T[];
  resultsTotal: number;
}

async function koronaFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
      ...(opts.headers ?? {}),
    },
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const body = await res.text();
    console.error(`Korona API error ${res.status}:`, body);
    throw new Error(`Korona API ${res.status}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    if (!phoneNumber || phoneNumber.length < 8) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Build exact-match candidates: raw input + or - without +1 for US numbers
    const candidates = new Set<string>();
    candidates.add(phoneNumber);
    if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
      // strip the "+1"
      candidates.add(phoneNumber.slice(2));
    } else if (!phoneNumber.startsWith('+') && phoneNumber.length === 10) {
      // add the "+1" variant
      candidates.add(`+1${phoneNumber}`);
    }

    let isNew = false;
    let customer: KoronaCustomer | null = null;

    // 1️⃣ Page through all customers (100/page) and look for any exact candidate
    const pageSize = 100;
    let page = 1;
    let totalPages = 1;

    outer: do {
      const resp = (await koronaFetch(
        `/accounts/${KORONA_ACCOUNT_ID}/customers?` +
          new URLSearchParams({
            page: String(page),
            size: String(pageSize),
            includeDeleted: 'false',
          }).toString(),
        { method: 'GET' }
      )) as KoronaSearchResults<KoronaCustomer> | null;

      if (resp?.results) {
        for (const c of resp.results) {
          if (candidates.has(c.phone)) {
            customer = c;
            break outer;
          }
        }
      }

      totalPages = resp?.pagesTotal ?? 1;
      page++;
    } while (page <= totalPages);

    // 2️⃣ If not found, create new
    if (customer) {
      isNew = false;
    } else {
      isNew = true;
      const payload = [{
        firstname: '',
        lastname: '',
        phone: phoneNumber,
        privacyPolicyAccepted: false,
        marketingContactPermitted: false,
      }];

      const createArray = (await koronaFetch(
        `/accounts/${KORONA_ACCOUNT_ID}/customers?writeMode=ADD_OR_UPDATE`,
        { method: 'POST', body: JSON.stringify(payload) }
      )) as { id: string }[] | null;

      if (!createArray || createArray.length === 0) {
        throw new Error('Failed to create new customer');
      }
      const newId = createArray[0].id;
      customer = (await koronaFetch(
        `/accounts/${KORONA_ACCOUNT_ID}/customers/${newId}`,
        { method: 'GET' }
      )) as KoronaCustomer;
    }

    // 3️⃣ Return exactly what the client needs
    return NextResponse.json(
      {
        id: customer!.id,
        firstName: customer!.firstname,
        lastName:  customer!.lastname,
        phone:     customer!.phone,
        email:     customer!.email || '',
        newUser:   isNew,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Join API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}