import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPrivacyPolicies } from 'content-collections';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

const PAGE_TITLE = 'プライバシーポリシー';

const getPrivacyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const privacyPolicy = allPrivacyPolicies[0];

    if (!privacyPolicy) {
      throw notFound();
    }

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
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <article className="border border-white p-7 sm:p-9">
        <header className="mb-8 border-white border-b pb-6">
          <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
            Privacy
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
