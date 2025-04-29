// src/app/join/layout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import Script from "next/script";

export default function JoinLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const setupKorona = () => {
      // tell TS/ESLint we know what we're doing here:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const api = (window as any).korona_plugin_api;
      if (!api) return;

      api.ready(() => {
        const btn = document.querySelector<HTMLButtonElement>(
          'button[data-join-rewards]'
        );
        if (!btn) return;

        btn.addEventListener(
          "click",
          async () => {
            try {
              // 1) call your existing join API
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const phoneNumber = (window as any).__JOIN_PHONE;

              const resp = await fetch("/api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
              });
              if (!resp.ok) throw new Error("Join failed");

              const customer = await resp.json();
              // 2) attach to Korona
              api.response.setReceiptCustomer({
                firstName: customer.firstName || "",
                lastName:  customer.lastName  || "",
                phone:     customer.phone     || "",
                email:     customer.email     || "",
                number:    String(customer.id),
              });
              // 3) return control to POS
              api.backToKorona();
            } catch (e) {
              console.error("Error attaching to Korona:", e);
            }
          },
          { once: true }
        );
      });
    };

    // if already loaded, run immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).korona_plugin_api) {
      setupKorona();
    } else {
      window.addEventListener("korona-script-loaded", setupKorona);
    }
  }, []);

  return (
    <>
      <Script
        src="/korona-plugin-api.js"
        strategy="beforeInteractive"
        onLoad={() => {
          window.dispatchEvent(new Event("korona-script-loaded"));
        }}
      />
      <div className="join-page">{children}</div>
    </>
  );
}