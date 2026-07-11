import { createFileRoute } from '@tanstack/react-router';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { author, formatPageTitle } from '@/constants/site';
import { DonationSection } from '@/features/subscribe/components/DonationSection';
import { LineOfficialAccountSection } from '@/features/subscribe/components/LineOfficialAccountSection';
import { createPageMeta } from '@/utils/pageMeta';

const PAGE_TITLE = 'Subscribe';

export const Route = createFileRoute('/subscribe')({
  head: () => ({
    meta: createPageMeta({
      title: formatPageTitle(PAGE_TITLE),
      openGraphTitle: PAGE_TITLE,
      description: `${author}を信仰する`,
      path: '/subscribe',
    }),
  }),
  component: SubscribePage,
});

function SubscribePage() {
  return (
    <PageMain size="narrow">
      <PageTitle>Subscribe</PageTitle>

      <div className="grid gap-8">
        <LineOfficialAccountSection />
        <DonationSection />
      </div>
    </PageMain>
  );
}
