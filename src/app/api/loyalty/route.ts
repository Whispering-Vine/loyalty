export const runtime = 'edge';

// app/api/loyalty/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CustomerData {
  name: string;
  email: string; // Required field
  phone: string; // Required field
  gender?: string;
  birthday?: string;
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  agreePrivacy?: boolean;
  optInEmail?: boolean;
  [key: string]: unknown;
}

interface KoronaCredentials {
  baseUrl: string;
  accountId: string;
  user: string;
  pass: string;
}

/**
 * Validate and retrieve Korona credentials from environment variables
 */
function getKoronaCredentials(): KoronaCredentials | null {
  const {
    KORONA_BASE_URL,
    KORONA_ACCOUNT_ID,
    KORONA_USER,
    KORONA_PASS,
  } = process.env;

  if (
    !KORONA_BASE_URL ||
    !KORONA_ACCOUNT_ID ||
    !KORONA_USER ||
    !KORONA_PASS
  ) {
    return null;
  }

  return {
    baseUrl: KORONA_BASE_URL,
    accountId: KORONA_ACCOUNT_ID,
    user: KORONA_USER,
    pass: KORONA_PASS,
  };
}

interface KoronaCustomerPayload {
  firstname: string;
  lastname: string;
  email: string; // Required field
  phone: string; // Required field
  gender?: string;
  birthday?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  customerGroup: {
    id: string;
  };
  active?: boolean;
  privacyPolicyAccepted?: boolean;
  marketingContactPermitted?: boolean;
  useEmailForDigitalReceipt?: boolean;
  lockDeliveryNoteSales?: boolean;
  [key: string]: unknown;
}

// Fixed customer group ID as per your requirement
const FIXED_CUSTOMER_GROUP_ID = "ef48161a-02a7-4042-8091-40717d7421ff";

/**
 * Format customer data for Korona API
 */
function getTimezoneOffset(date: Date): string {
  const offset = -date.getTimezoneOffset(); // in minutes
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const mins = String(absOffset % 60).padStart(2, '0');
  return `${sign}${hours}:${mins}`;
}

function formatCustomerData(customerData: CustomerData): KoronaCustomerPayload {
  // Split full name into firstName and lastName
  const [firstname, ...rest] = customerData.name.trim().split(' ');
  const lastname = rest.join(' ') || '';

  // Normalize gender to Korona enum
  const normalizedGender =
    customerData.gender?.toLowerCase() === 'male'
      ? 'MALE'
      : customerData.gender?.toLowerCase() === 'female'
      ? 'FEMALE'
      : undefined;

  // Format birthday as ISO with timezone offset, dropping milliseconds
  let formattedBirthday: string | undefined = undefined;
  if (customerData.birthday) {
    const date = new Date(customerData.birthday as string);
    // Remove milliseconds and replace Z
    const iso = date.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"
    const noMs = iso.replace(/\.\d{3}/, ''); // "YYYY-MM-DDTHH:mm:ssZ"
    formattedBirthday = noMs.replace('Z', getTimezoneOffset(date)); // "YYYY-MM-DDTHH:mm:ss±HH:mm"
  }

  const { 
    address1, 
    address2, 
    city, 
    region, 
    postalCode, 
    country, 
    agreePrivacy, 
    optInEmail,
    ...baseData 
  } = customerData;

  // Create a properly typed payload object
  const finalPayload: KoronaCustomerPayload = {
    firstname,
    lastname,
    email: customerData.email,
    phone: customerData.phone,
    ...baseData as Omit<
      CustomerData, 
      'name' | 'address1' | 'address2' | 'city' | 'region' | 'postalCode' | 'country' | 'agreePrivacy' | 'optInEmail'
    >,
    ...(normalizedGender && { gender: normalizedGender }),
    ...(formattedBirthday && { birthday: formattedBirthday }),
    ...(address1 || address2 || city || region || postalCode || country ? {
      address: {
        ...(address1 && { addressLine1: address1 }),
        ...(address2 && { addressLine2: address2 }),
        ...(city && { city }),
        ...(region && { state: region.toUpperCase() }),
        ...(postalCode && { zipCode: postalCode }),
        ...(country && { country }),
      }
    } : {}),
    // Always use the fixed customer group ID
    customerGroup: { 
      id: FIXED_CUSTOMER_GROUP_ID 
    },
    active: true,
    privacyPolicyAccepted: agreePrivacy,
    marketingContactPermitted: optInEmail,
    useEmailForDigitalReceipt: false,
    lockDeliveryNoteSales: false
  };

  // Remove keys with empty string values
  Object.keys(finalPayload).forEach(key => {
    const k = key as keyof KoronaCustomerPayload;
    if (finalPayload[k] === '') {
      delete finalPayload[k];
    }
  });

  return finalPayload;
}

function getAuthHeader(credentials: KoronaCredentials): string {
  const auth = Buffer.from(
    `${credentials.user}:${credentials.pass}`
  ).toString('base64');
  return `Basic ${auth}`;
}

/**
 * Search for existing customer by email or name
 */
async function searchCustomer(credentials: KoronaCredentials, customerData: CustomerData) {
  const searchParams = new URLSearchParams();
  if (customerData.email) {
    searchParams.set('email', customerData.email);
  } else {
    // fallback: search by name
    searchParams.set('name', customerData.name);
  }

  const listUrl = `${credentials.baseUrl}/accounts/${credentials.accountId}/customers?${searchParams}`;
  console.log('Calling URL:', listUrl, 'with payload:', null);

  const listRes = await fetch(
    listUrl,
    {
      headers: {
        Authorization: getAuthHeader(credentials),
      },
    }
  );
  console.log('Response status:', listRes.status);
  const listText = await listRes.text();
  console.log('Response text:', listText);

  if (!listRes.ok) {
    let err: unknown;
    try {
      err = JSON.parse(listText);
    } catch {
      err = listText;
    }
    throw { error: err, status: listRes.status };
  }

  let listPayload: unknown;
  if (listRes.status === 204) {
    listPayload = { results: [] };
  } else {
    try {
      listPayload = JSON.parse(listText);
    } catch {
      listPayload = { results: [] };
    }
  }
  
  // Korona returns { results: Customer[] }
  const existingResults = (listPayload as { results?: unknown[] }).results;
  return Array.isArray(existingResults) ? existingResults : [];
}

/**
 * Create a new customer
 */
async function createCustomer(credentials: KoronaCredentials, formattedData: KoronaCustomerPayload) {
  const postUrl = `${credentials.baseUrl}/accounts/${credentials.accountId}/customers?writeMode=ADD_OR_UPDATE`;
  console.log('Calling URL:', postUrl, 'with payload:', [formattedData]);

  const postRes = await fetch(
    postUrl,
    {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(credentials),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([formattedData]),
    }
  );
  console.log('Response status:', postRes.status);
  const postText = await postRes.text();
  console.log('Response text:', postText);

  let postPayload: unknown;
  try {
    postPayload = JSON.parse(postText);
  } catch {
    postPayload = postText;
  }

  if (!postRes.ok) {
    throw { error: postPayload, status: postRes.status };
  }

  return postPayload;
}

/**
 * Update an existing customer
 */
async function updateCustomer(credentials: KoronaCredentials, customerId: string, formattedData: KoronaCustomerPayload) {
  const patchUrl = `${credentials.baseUrl}/accounts/${credentials.accountId}/customers/${customerId}`;
  console.log('Calling URL:', patchUrl, 'with payload:', formattedData);

  const patchRes = await fetch(
    patchUrl,
    {
      method: 'PATCH',
      headers: {
        Authorization: getAuthHeader(credentials),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    }
  );
  console.log('Response status:', patchRes.status);
  const patchText = await patchRes.text();
  console.log('Response text:', patchText);

  if (!patchRes.ok) {
    let err: unknown;
    try {
      err = JSON.parse(patchText);
    } catch {
      err = patchText;
    }
    throw { error: err, status: patchRes.status };
  }

  return customerId;
}

export async function POST(req: NextRequest) {
  try {
    const credentials = getKoronaCredentials();
    if (!credentials) {
      return NextResponse.json(
        { error: 'Missing Korona configuration.' },
        { status: 500 }
      );
    }

    const customerData = await req.json() as CustomerData;
    console.log('Received customerData:', customerData);

    // Validate required fields
    if (!customerData.email || !customerData.phone) {
      return NextResponse.json(
        { error: 'Email and phone are required fields.' },
        { status: 400 }
      );
    }

    const formattedData = formatCustomerData(customerData);
    const existingCustomers = await searchCustomer(credentials, customerData);

    // If found, return that customer already exists
    if (existingCustomers.length > 0) {
      return NextResponse.json(
        { message: "Customer already exists" },
        { status: 200 }
      );
    }

    // Otherwise create new
    const created = await createCustomer(credentials, formattedData);
    return NextResponse.json({ created }, { status: 200 });
  } catch (error: unknown) {
    const err = error as { error?: unknown; status?: number; message?: string };
    return NextResponse.json(
      { error: err.error || err.message || 'Unknown error' },
      { status: err.status || 500 }
    );
  }
}

export async function PUT(req: NextRequest & { nextUrl: URL }) {
  try {
    const credentials = getKoronaCredentials();
    if (!credentials) {
      return NextResponse.json(
        { error: 'Missing Korona configuration.' },
        { status: 500 }
      );
    }

    const urlParts = req.nextUrl.pathname.split('/');
    const customerId = urlParts[urlParts.length - 1];

    const customerData = await req.json() as CustomerData;
    console.log('Received customerData for update:', customerData);

    if (!customerData.email || !customerData.phone) {
      return NextResponse.json(
        { error: 'Email and phone are required fields.' },
        { status: 400 }
      );
    }

    const formattedData = formatCustomerData(customerData);
    const updated = await updateCustomer(credentials, customerId, formattedData);
    
    return NextResponse.json(
      { updated },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as { error?: unknown; status?: number; message?: string };
    return NextResponse.json(
      { error: err.error || err.message || 'Unknown error' },
      { status: err.status || 500 }
    );
  }
}