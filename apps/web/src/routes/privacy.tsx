import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPrivacyPolicies } from 'content-collections';

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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <article className="rounded-3xl border border-white/12 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <header className="mb-8 border-white/10 border-b pb-6">
          <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
            Privacy
          </p>
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {PAGE_TITLE}
          </h1>
        </header>

        <div className="prose prose-invert max-w-none prose-a:text-cyan-300 prose-code:text-cyan-200 prose-headings:text-white prose-li:text-white/82 prose-p:text-white/82">
          {body}
        </div>
      </article>
    </main>
  );
}
