import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { privacyPolicy } from 'content-collections';
import { ArticleLayout } from '@/components/layouts/ArticleLayout';
import { PageMain } from '@/components/layouts/PageMain';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { formatPostDate } from '@/utils/posts';

const PAGE_TITLE = 'プライバシーポリシー';

const getPrivacyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const MDXContent = privacyPolicy.mdx;

    return {
      body: await renderServerComponent(<MDXContent />),
      revisedAt: privacyPolicy.revisedAt,
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
  const { body, revisedAt } = Route.useLoaderData();

  return (
    <PageMain size="narrow">
      <ArticleLayout
        metadata={`最終改定日: ${formatPostDate(revisedAt)}`}
        title={PAGE_TITLE}
      >
        <MarkdownContent>{body}</MarkdownContent>
      </ArticleLayout>
    </PageMain>
  );
}
