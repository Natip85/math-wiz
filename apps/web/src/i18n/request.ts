import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { IntlErrorCode } from "next-intl";

// Supported locales - add more as you create translation files
const locales = ["en", "he", "es", "fr", "de"] as const;
type Locale = (typeof locales)[number];

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  // Read locale from cookie, fallback to 'en'
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale: Locale = cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : "en";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,

    // Global formats for consistent date/number formatting
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
        long: {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        },
      },
      number: {
        integer: {
          maximumFractionDigits: 0,
        },
        percent: {
          style: "percent",
        },
      },
    },

    // Error handling for missing/invalid translations
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Missing translations are expected during development
        console.warn(error.message);
      } else {
        // Other errors should be reported
        console.error(error);
      }
    },

    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter(Boolean).join(".");

      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        return `[${path}]`; // Shows the key path for missing translations
      }

      return `[Error: ${path}]`;
    },
  };
});
