import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allCultures } from 'content-collections';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { modalDialogSelector } from '@/components/ui/Modal';
import { author } from '@/constants/site';
import { CultureCardList } from '@/features/culture/components/CultureCardList';
import { CultureItemModal } from '@/features/culture/components/CultureItemModal';
import { cn } from '@/utils/classNames';
import { createPageMeta, formatPageTitle } from '@/utils/pageMeta';
import cultureStyles from './culture.module.css';

const cultureModalChangeEvent = 'culture-modal-change';

const getCulturePageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (allCultures.length === 0) {
      throw notFound();
    }

    return Promise.all(
      [...allCultures]
        .sort((a, b) => a.order - b.order)
        .map(
          async ({
            content: _content,
            mdx: MDXContent,
            revisedAt: _revisedAt,
            ...item
          }) => ({
            ...item,
            body: await renderServerComponent(<MDXContent />),
          }),
        ),
    );
  },
);

export const Route = createFileRoute('/culture')({
  loader: async () => getCulturePageData(),
  head: () => ({
    meta: createPageMeta({
      title: formatPageTitle('Culture'),
      openGraphTitle: 'Culture',
      description: `${author}を構成するもの`,
      path: '/culture',
    }),
  }),
  component: CulturePage,
});

function CulturePage() {
  const cultureItems = Route.useLoaderData();
  const pageRef = useRef<HTMLElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => cultureItems.find((item) => item.slug === selectedSlug),
    [cultureItems, selectedSlug],
  );

  const openModal = useCallback(
    (slug: string) => {
      if (selectedSlug === slug) {
        return;
      }

      setSelectedSlug(slug);
      window.history.pushState(
        { cultureModal: slug },
        '',
        window.location.href,
      );
      window.dispatchEvent(
        new CustomEvent<{ slug: string | null }>(cultureModalChangeEvent, {
          detail: { slug },
        }),
      );
    },
    [selectedSlug],
  );

  const closeModal = useCallback(() => {
    if (!selectedSlug) {
      return;
    }

    window.history.back();
  }, [selectedSlug]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedSlug(null);
    };

    const handleModalChange = (event: Event) => {
      setSelectedSlug(
        (event as CustomEvent<{ slug: string | null }>).detail.slug,
      );
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener(cultureModalChangeEvent, handleModalChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(cultureModalChangeEvent, handleModalChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (
      !selectedItem ||
      pageRef.current?.closest('[data-cutout-layer="stencil"]')
    ) {
      return;
    }

    let updateFrame: number | null = null;

    const clearObscuredPageContent = () => {
      const pageContent = pageContentRef.current;

      if (!pageContent) {
        return;
      }

      delete pageContent.dataset.cultureModalCutout;
      pageContent.style.removeProperty('--culture-modal-mask-height');
      pageContent.style.removeProperty('--culture-modal-mask-left');
      pageContent.style.removeProperty('--culture-modal-mask-top');
      pageContent.style.removeProperty('--culture-modal-mask-width');
    };

    const updateObscuredPageContent = () => {
      updateFrame = null;

      const pageContent = pageContentRef.current;
      const dialog = document.querySelector<HTMLElement>(
        `[data-cutout-layer="content"] ${modalDialogSelector}`,
      );

      if (!pageContent || !dialog) {
        return;
      }

      const dialogRect = dialog.getBoundingClientRect();
      const pageContentRect = pageContent.getBoundingClientRect();
      const overlapLeft = Math.max(0, dialogRect.left - pageContentRect.left);
      const overlapTop = Math.max(0, dialogRect.top - pageContentRect.top);
      const overlapRight = Math.min(
        pageContentRect.width,
        dialogRect.right - pageContentRect.left,
      );
      const overlapBottom = Math.min(
        pageContentRect.height,
        dialogRect.bottom - pageContentRect.top,
      );
      const overlapWidth = Math.max(0, overlapRight - overlapLeft);
      const overlapHeight = Math.max(0, overlapBottom - overlapTop);

      clearObscuredPageContent();

      if (overlapWidth <= 0 || overlapHeight <= 0) {
        return;
      }

      pageContent.dataset.cultureModalCutout = 'true';
      pageContent.style.setProperty(
        '--culture-modal-mask-height',
        `${overlapHeight}px`,
      );
      pageContent.style.setProperty(
        '--culture-modal-mask-left',
        `${overlapLeft}px`,
      );
      pageContent.style.setProperty(
        '--culture-modal-mask-top',
        `${overlapTop}px`,
      );
      pageContent.style.setProperty(
        '--culture-modal-mask-width',
        `${overlapWidth}px`,
      );
    };

    const scheduleObscuredPageContentUpdate = () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      updateFrame = window.requestAnimationFrame(updateObscuredPageContent);
    };

    const resizeObserver = new ResizeObserver(
      scheduleObscuredPageContentUpdate,
    );
    const dialog = document.querySelector<HTMLElement>(
      `[data-cutout-layer="content"] ${modalDialogSelector}`,
    );

    if (pageContentRef.current) {
      resizeObserver.observe(pageContentRef.current);
    }

    if (dialog) {
      resizeObserver.observe(dialog);
    }

    updateObscuredPageContent();

    window.addEventListener('resize', scheduleObscuredPageContentUpdate);
    window.addEventListener('scroll', scheduleObscuredPageContentUpdate, {
      passive: true,
    });
    window.visualViewport?.addEventListener(
      'resize',
      scheduleObscuredPageContentUpdate,
    );
    window.visualViewport?.addEventListener(
      'scroll',
      scheduleObscuredPageContentUpdate,
    );

    return () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleObscuredPageContentUpdate);
      window.removeEventListener('scroll', scheduleObscuredPageContentUpdate);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleObscuredPageContentUpdate,
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        scheduleObscuredPageContentUpdate,
      );
      clearObscuredPageContent();
    };
  }, [selectedItem]);

  return (
    <PageMain
      ref={pageRef}
      data-culture-modal-open={selectedItem ? true : undefined}
    >
      <div
        ref={pageContentRef}
        className={cn(cultureStyles.pageContent, 'flex flex-col')}
      >
        <PageTitle>Culture</PageTitle>

        <CultureCardList items={cultureItems} onOpen={openModal} />
      </div>

      {selectedItem ? (
        <CultureItemModal item={selectedItem} onClose={closeModal} />
      ) : null}
    </PageMain>
  );
}
