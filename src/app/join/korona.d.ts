//korona.d.ts
export {};

declare global {
  interface KoronaPluginAPI {
    ready: (cb: () => void) => void;
    request: {
      receipt: unknown; // specify a more precise type if possible
    };
    response: {
      setReceiptCustomer: (data: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        number: string;
      }) => void;
      backToKorona: () => void;
    };
  }

  interface Window {
    korona_plugin_api?: KoronaPluginAPI;
  }
}