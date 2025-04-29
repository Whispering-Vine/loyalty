// src/app/api/join/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 8) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Validate the phone number format
    // 2. Check if the user already exists
    // 3. Store the phone number in your database
    // 4. Send a verification SMS
    // For this example, we'll just return success

    return NextResponse.json(
      { message: 'Successfully joined rewards program' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}