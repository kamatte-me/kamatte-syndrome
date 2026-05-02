import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allTerms } from 'content-collections';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

const PAGE_TITLE = '免責事項';

const getTermsPageData = createServerFn({ method: 'GET' }).handler(async () => {
  const terms = allTerms[0];

  if (!terms) {
    throw notFound();
  }

  const MDXContent = terms.mdx;

  return {
    body: await renderServerComponent(<MDXContent />),
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
  const { body } = Route.useLoaderData();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <article className="rounded-3xl border border-white/12 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <header className="mb-8 border-white/10 border-b pb-6">
          <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
            Terms
          </p>
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {PAGE_TITLE}
          </h1>
        </header>

        <MarkdownContent>{body}</MarkdownContent>
      </article>
    </main>
  );
}
