type GoogleAnalyticsScript = {
  async?: boolean;
  children?: string;
  src?: string;
};

const googleAnalyticsIdPattern = /^G-[A-Z0-9]+$/;

export function createGoogleAnalyticsScripts(
  measurementId: string | undefined,
): GoogleAnalyticsScript[] {
  if (!measurementId || !googleAnalyticsIdPattern.test(measurementId)) {
    return [];
  }

  return [
    {
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
    },
    {
      children: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(measurementId)});`,
    },
  ];
}
