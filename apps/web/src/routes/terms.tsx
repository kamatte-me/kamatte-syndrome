import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { terms } from 'content-collections';
import { ArticleLayout } from '@/components/layouts/ArticleLayout';
import { PageMain } from '@/components/layouts/PageMain';
import { contentImageMdxComponents } from '@/components/ui/contentImageMdxComponents';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { siteName } from '@/constants/site';
import {
  createCanonicalLink,
  createPageMeta,
  formatPageTitle,
} from '@/utils/pageMeta';
import { formatPostDate } from '@/utils/posts';

const PAGE_TITLE = '免責事項';

const getTermsPageData = createServerFn({ method: 'GET' }).handler(async () => {
  const MDXContent = terms.mdx;

  return {
    body: await renderServerComponent(
      <MDXContent components={contentImageMdxComponents} />,
    ),
    revisedAt: terms.revisedAt,
  };
});

export const Route = createFileRoute('/terms')({
  loader: async () => getTermsPageData(),
  head: () => ({
    links: [createCanonicalLink('/terms')],
    meta: createPageMeta({
      title: formatPageTitle(PAGE_TITLE),
      openGraphTitle: PAGE_TITLE,
      description: `${siteName}の${PAGE_TITLE}`,
      path: '/terms',
    }),
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
