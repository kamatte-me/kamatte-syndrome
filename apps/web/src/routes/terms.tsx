import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { terms } from 'content-collections';
import { ArticleLayout } from '@/components/layouts/ArticleLayout';
import { PageMain } from '@/components/layouts/PageMain';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { formatPostDate } from '@/utils/posts';

const PAGE_TITLE = '免責事項';

const getTermsPageData = createServerFn({ method: 'GET' }).handler(async () => {
  const MDXContent = terms.mdx;

  return {
    body: await renderServerComponent(<MDXContent />),
    revisedAt: terms.revisedAt,
  };
});

export const Route = createFileRoute('/terms')({
  loader: async () => getTermsPageData(),
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
  component: TermsPage,
});

function TermsPage() {
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
