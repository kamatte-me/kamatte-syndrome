import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allCultures } from 'content-collections';
import type { ReactElement } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { Modal, modalDialogSelector } from '@/components/ui/Modal';
import { cn } from '@/utils/classNames';
import cultureStyles from './culture.module.css';

type RenderedServerComponent = RenderableServerComponent<ReactElement>;

type CultureListItem = {
  body: RenderedServerComponent;
  name: string;
  order: number;
  slug: string;
  youtubeVideoId: string;
};

const cultureModalChangeEvent = 'culture-modal-change';
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
    meta: [
      {
        title: 'Culture | kamatte syndrome',
      },
      {
        name: 'description',
        content: 'kamatte を構成する音楽や動画の記録。',
      },
    ],
  }),
  component: CulturePage,
});

function CulturePage() {
  const cultureItems = Route.useLoaderData();
  const pageRef = useRef<HTMLElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isStencilPage, setIsStencilPage] = useState(false);

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

  useBrowserLayoutEffect(() => {
    setIsStencilPage(
      Boolean(pageRef.current?.closest('[data-cutout-layer="stencil"]')),
    );
  }, []);

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

  useBrowserLayoutEffect(() => {
    if (!selectedItem || isStencilPage) {
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
  }, [isStencilPage, selectedItem]);

  return (
    <main
      ref={pageRef}
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12"
      data-culture-modal-open={selectedItem ? true : undefined}
    >
      <div
        ref={pageContentRef}
        className={cn(cultureStyles.pageContent, 'flex flex-col gap-8')}
      >
        <section className="border-cutout-hole border-b pb-8">
          <div className="grid gap-5">
            <div>
              <h1 className="font-display font-normal text-5xl leading-none sm:text-6xl">
                Culture
              </h1>
            </div>
          </div>
        </section>

        <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cultureItems.map((item) => (
            <CultureCard item={item} key={item.slug} onOpen={openModal} />
          ))}
        </ul>
      </div>

      {selectedItem ? (
        <CultureModal item={selectedItem} onClose={closeModal} />
      ) : null}
    </main>
  );
}

function CultureCard({
  item,
  onOpen,
}: {
  item: CultureListItem;
  onOpen: (slug: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="grid h-full w-full overflow-hidden border border-cutout-hole text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole"
        onClick={() => onOpen(item.slug)}
      >
        <span
          className={cn(
            cultureStyles.cardFrame,
            'relative block aspect-[4/3] overflow-hidden',
          )}
        >
          <img
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            data-culture-card-media
            className={cn(
              cultureStyles.cardMedia,
              'size-full object-cover opacity-90',
            )}
          />
          <span aria-hidden="true" className={cultureStyles.playIndicator} />
        </span>
        <span className="flex min-h-20 items-center px-4 py-3 font-bold text-cutout-hole text-lg leading-snug">
          {item.name}
        </span>
      </button>
    </li>
  );
}

function CultureModal({
  item,
  onClose,
}: {
  item: CultureListItem;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose} titleId="culture-modal-title">
      {({ isContentLayer }) => (
        <>
          <div className="shrink-0 border-cutout-hole border-b p-4 sm:p-5 lg:flex lg:w-[42%] lg:items-center lg:border-r lg:border-b-0 lg:p-6 [@media_(orientation:landscape)_and_(max-height:500px)]:flex [@media_(orientation:landscape)_and_(max-height:500px)]:w-[48%] [@media_(orientation:landscape)_and_(max-height:500px)]:items-center [@media_(orientation:landscape)_and_(max-height:500px)]:border-r [@media_(orientation:landscape)_and_(max-height:500px)]:border-b-0 [@media_(orientation:landscape)_and_(max-height:500px)]:p-4">
            <div className="mx-auto aspect-video w-full md:max-w-2xl lg:max-w-none">
              {isContentLayer ? (
                <iframe
                  title={`${item.name} - YouTube`}
                  src={`https://www.youtube.com/embed/${item.youtubeVideoId}?autoplay=1`}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div aria-hidden="true" className="size-full" />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:min-h-0 lg:flex-1 lg:p-8 [@media_(orientation:landscape)_and_(max-height:500px)]:min-h-0 [@media_(orientation:landscape)_and_(max-height:500px)]:flex-1 [@media_(orientation:landscape)_and_(max-height:500px)]:p-5">
            <header className="shrink-0 border-cutout-hole border-b pb-4">
              <p className="mb-2 font-semibold text-cutout-hole text-xs uppercase tracking-[0.28em]">
                Now Playing
              </p>
              <h2
                className="font-bold text-3xl leading-tight sm:text-4xl"
                id="culture-modal-title"
                style={{
                  fontFamily: 'var(--font-latin-dot-gothic)',
                }}
              >
                {item.name}
              </h2>
            </header>

            <MarkdownContent className="pr-1" variant="compact">
              {item.body}
            </MarkdownContent>
          </div>
        </>
      )}
    </Modal>
  );
}
