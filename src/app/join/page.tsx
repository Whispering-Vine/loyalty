// src/app/join/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CountrySelector } from "@/components/country-select";
import { NumberPad } from "@/components/number-pad";
import {
  formatPhoneNumber,
  isValidPhoneNumber,
  unformatPhoneNumber,
} from "@/utils/phone-number";
import { toast } from "sonner";

export default function JoinPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [showNumberPad, setShowNumberPad] = useState(true);

  const [koronaReady, setKoronaReady] = useState(false);

  // 1) Inject Korona plugin script
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      toast.warning(args.map(String).join(' '));
      originalWarn.apply(console, args);
    };
    const script = document.createElement('script');
    script.src = '/korona-plugin-api.js';
    script.type = 'text/javascript';
    script.onload = () => {
      toast.success("Korona POS plugin loaded");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).korona_plugin_api?.ready(() => {
        setKoronaReady(true);    
        toast.success("Korona POS API ready");
      });
    };
    script.onerror = () => {
      toast.error("Failed to load Korona POS plugin");
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 2) Expose full phone number
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__JOIN_PHONE = `${countryCode}${unformatPhoneNumber(phoneNumber)}`;
  }, [countryCode, phoneNumber]);

  const handleJoinRewards = async () => {
    const unformatted = unformatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(unformatted)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const resp = await fetch('/api/join', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ phoneNumber: `${countryCode}${unformatted}` }),
      });
      if (!resp.ok) throw new Error('Join failed');

      const { firstName, lastName, phone, email, newUser, id } = await resp.json();
      toast.success(
        newUser
          ? 'Thanks for joining our rewards!'
          : `Welcome back ${firstName}!`
      );

      // Define a type for korona_plugin_api
      interface KoronaPluginApi {
        response: {
          setReceiptCustomer: (data: {
            firstName: string;
            lastName: string;
            phone: string;
            email: string;
            number: string;
          }) => void;
          callExternalSystemByNumber: (data: { externalSystemNumber: number }) => void;
        };
        backToKorona: () => void;
        request: {
          FollowUpExternalSystemCall: number;
        };
      }

      const api = (window as { korona_plugin_api?: KoronaPluginApi }).korona_plugin_api;
      if (api && koronaReady) {
        api.response.setReceiptCustomer({
          firstName: firstName || '',
          lastName:  lastName  || '',
          phone:     phone     || '',
          email:     email     || '',
          number:    id.toString(),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const followUp = api.request?.FollowUpExternalSystemCall;
        if (typeof followUp === 'number') {
          api.response.callExternalSystemByNumber({
            externalSystemNumber: followUp
          });
        }
        api.backToKorona();
      } else {
        toast.error('Korona API not available');
      }

      setPhoneNumber('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to join rewards');
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
          size="lg"
        >
          Join Rewards
        </Button>

        {showNumberPad && (
          <NumberPad
            value={unformatPhoneNumber(phoneNumber)}
            onChange={(val) => {
              const un = unformatPhoneNumber(val);
              setPhoneNumber(formatPhoneNumber(un));
            }}
            onClose={() => setShowNumberPad(false)}
          />
        )}
      </div>
    </div>
  );
}