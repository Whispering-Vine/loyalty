// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/country-select";
import { NumberPad } from "@/components/number-pad";
import { formatPhoneNumber, isValidPhoneNumber, unformatPhoneNumber } from "@/utils/phone-number";

export default function PhonePage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // US by default
  const [showNumberPad, setShowNumberPad] = useState(false);

  const handlePhoneNumberChange = (value: string) => {
    const unformatted = unformatPhoneNumber(value);
    setPhoneNumber(formatPhoneNumber(unformatted));
  };

  const handleJoinRewards = async () => {
    const unformattedNumber = unformatPhoneNumber(phoneNumber);
    
    if (!isValidPhoneNumber(unformattedNumber)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: `${countryCode}${unformattedNumber}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join rewards');
      }

      // Handle success
      alert('Successfully joined rewards!');
      setPhoneNumber(''); // Clear the input after successful submission
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to join rewards. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex gap-2">
          <CountrySelector
            value={countryCode}
            onValueChange={setCountryCode}
          />
          <Button 
            className="flex-1 cursor-pointer transition-colors"
            onClick={() => setShowNumberPad(true)}
            variant="outline"
          >
            <span className={`${phoneNumber ? 'text-foreground' : 'text-muted-foreground'}`}>
              {phoneNumber || 'Enter phone number'}
            </span>
          </Button>
        </div>

        <Button 
          data-join-rewards
          className="w-full"
          onClick={handleJoinRewards}
          variant="default"
          disabled={!isValidPhoneNumber(unformatPhoneNumber(phoneNumber))}
          size={'lg'}
        >
          Join Rewards
        </Button>

        {showNumberPad && (
          <NumberPad
            value={unformatPhoneNumber(phoneNumber)}
            onChange={handlePhoneNumberChange}
            onClose={() => setShowNumberPad(false)}
          />
        )}
      </div>
    </div>
  );
}