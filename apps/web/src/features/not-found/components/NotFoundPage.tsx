import { PageMain } from '@/components/layouts/PageMain';
import { notFoundMessage } from '@/features/not-found/constants/notFound';

export function NotFoundPage() {
  return (
    <PageMain className="flex-1 items-center justify-center gap-2 text-center sm:gap-3">
      <h1 className="font-display font-normal text-[8rem] leading-none sm:text-[12rem] lg:text-[15rem]">
        404
      </h1>
      <p className="m-0 font-display text-md leading-relaxed sm:text-2xl lg:text-3xl">
        {notFoundMessage}
      </p>
    </PageMain>
  );
}
