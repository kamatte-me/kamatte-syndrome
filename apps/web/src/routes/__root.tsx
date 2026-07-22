import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { GlobalLayout } from '@/components/layouts/GlobalLayout';
import { createGoogleAnalyticsScripts } from '@/features/analytics/utils/googleAnalytics';
import { NotFoundPage } from '@/features/not-found/components/NotFoundPage';
import { getOpenGraph } from '@/features/url-embeds/api/openGraph.functions';
import '../styles.css';
import { siteName, slogan } from '@/constants/site';
import { createPageMeta, formatPageTitle } from '@/utils/pageMeta';

// LinkCard can be rendered through RSC client references from multiple routes.
// Keep the server function in the root route graph so production builds register it.
void getOpenGraph;

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

export const Route = createRootRoute({
  head: ({ match }) => {
    const isNotFound =
      match.status === 'notFound' || match.globalNotFound === true;

    return {
      links: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Matemasie&display=block',
        },
        {
          rel: 'shortcut icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
        {
          rel: 'alternate',
          type: 'application/atom+xml',
          title: siteName,
          href: '/feed.xml',
        },
      ],
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#000000' },
        ...(facebookAppId
          ? [{ property: 'fb:app_id', content: facebookAppId }]
          : []),
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@kamatte_me' },
        ...createPageMeta({
          title: isNotFound ? formatPageTitle('404') : siteName,
          description: slogan,
          path: '/',
        }),
      ],
      scripts: createGoogleAnalyticsScripts(googleAnalyticsId),
    };
  },
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <GlobalLayout>{children}</GlobalLayout>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
