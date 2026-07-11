import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { GlobalLayout } from '@/components/layouts/GlobalLayout';
import { getOpenGraph } from '@/features/url-embeds/api/openGraph.functions';
import '../styles.css';
import { siteName, slogan } from '@/constants/site';
import { createPageMeta } from '@/utils/pageMeta';

// LinkCard can be rendered through RSC client references from multiple routes.
// Keep the server function in the root route graph so production builds register it.
void getOpenGraph;

export const Route = createRootRoute({
  head: () => ({
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
        rel: 'alternate',
        type: 'application/atom+xml',
        title: `${siteName} Atom Feed`,
        href: '/feed.xml',
      },
    ],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...createPageMeta({
        title: siteName,
        description: slogan,
        path: '/',
      }),
    ],
  }),
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
