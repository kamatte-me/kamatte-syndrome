import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { privacyPolicy } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

const PAGE_TITLE = 'プライバシーポリシー';

const getPrivacyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const MDXContent = privacyPolicy.mdx;

    return {
      body: await renderServerComponent(<MDXContent />),
    };
  },
);

export const Route = createFileRoute('/privacy')({
  loader: async () => getPrivacyPageData(),
  head: () => ({
    meta: [
      {
        title: `${PAGE_TITLE} | kamatte syndrome`,
      },
      {
        name: 'description',
        content: `kamatte syndromeの${PAGE_TITLE}`,
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { body } = Route.useLoaderData();

  return (
    <PageMain size="narrow">
      <article className="border border-cutout-hole p-7 sm:p-9">
        <header className="mb-8 border-cutout-hole border-b pb-6">
          <p className="mb-3 font-semibold text-cutout-hole text-xs uppercase tracking-[0.3em]">
            Privacy
          </p>
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {PAGE_TITLE}
          </h1>
        </header>

        <MarkdownContent>{body}</MarkdownContent>
      </article>
    </PageMain>
  );
}
