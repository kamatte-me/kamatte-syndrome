import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allCultures } from 'content-collections';
import { Play, X } from 'lucide-react';
import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
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
const modalRootSelector = `.${cultureStyles.modalRoot}`;

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

  useEffect(() => {
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

  useEffect(() => {
    if (!selectedItem || isStencilPage) {
      return;
    }

    const clearObscuredMedia = () => {
      for (const media of document.querySelectorAll<HTMLElement>(
        '[data-cutout-layer="content"] [data-culture-card-media]',
      )) {
        delete media.dataset.cultureModalObscured;
        delete media.dataset.cultureModalCutout;
        media.style.removeProperty('--culture-modal-mask-height');
        media.style.removeProperty('--culture-modal-mask-left');
        media.style.removeProperty('--culture-modal-mask-top');
        media.style.removeProperty('--culture-modal-mask-width');
      }
    };

    const updateObscuredMedia = () => {
      const dialog = document.querySelector<HTMLElement>(
        `[data-cutout-layer="content"] ${modalRootSelector} [role="dialog"]`,
      );

      if (!dialog) {
        return;
      }

      const dialogRect = dialog.getBoundingClientRect();

      for (const media of document.querySelectorAll<HTMLElement>(
        '[data-cutout-layer="content"] [data-culture-card-media]',
      )) {
        const mediaRect = media.getBoundingClientRect();
        const overlapLeft = Math.max(0, dialogRect.left - mediaRect.left);
        const overlapTop = Math.max(0, dialogRect.top - mediaRect.top);
        const overlapRight = Math.min(
          mediaRect.width,
          dialogRect.right - mediaRect.left,
        );
        const overlapBottom = Math.min(
          mediaRect.height,
          dialogRect.bottom - mediaRect.top,
        );
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);
        const overlapHeight = Math.max(0, overlapBottom - overlapTop);

        delete media.dataset.cultureModalObscured;
        delete media.dataset.cultureModalCutout;
        media.style.removeProperty('--culture-modal-mask-height');
        media.style.removeProperty('--culture-modal-mask-left');
        media.style.removeProperty('--culture-modal-mask-top');
        media.style.removeProperty('--culture-modal-mask-width');

        if (overlapWidth <= 0 || overlapHeight <= 0) {
          continue;
        }

        const coversImage =
          overlapLeft <= 0.5 &&
          overlapTop <= 0.5 &&
          overlapRight >= mediaRect.width - 0.5 &&
          overlapBottom >= mediaRect.height - 0.5;

        if (coversImage) {
          media.dataset.cultureModalObscured = 'true';
          continue;
        }

        media.dataset.cultureModalCutout = 'true';
        media.style.setProperty(
          '--culture-modal-mask-height',
          `${overlapHeight}px`,
        );
        media.style.setProperty(
          '--culture-modal-mask-left',
          `${overlapLeft}px`,
        );
        media.style.setProperty('--culture-modal-mask-top', `${overlapTop}px`);
        media.style.setProperty(
          '--culture-modal-mask-width',
          `${overlapWidth}px`,
        );
      }
    };

    const animationFrame = window.requestAnimationFrame(updateObscuredMedia);

    window.addEventListener('resize', updateObscuredMedia);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateObscuredMedia);
      clearObscuredMedia();
    };
  }, [isStencilPage, selectedItem]);

  useEffect(() => {
    if (!selectedItem || isStencilPage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isStencilPage, selectedItem]);

  useEffect(() => {
    if (!selectedItem || isStencilPage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal, isStencilPage, selectedItem]);

  return (
    <main
      ref={pageRef}
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12"
      data-culture-modal-open={selectedItem ? true : undefined}
    >
      <section className="border-cutout-hole border-b pb-8">
        <p className="mb-3 font-semibold text-cutout-hole text-xs uppercase tracking-[0.3em]">
          Culture
        </p>
        <div className="grid gap-5">
          <div>
            <h1
              className="font-bold text-5xl leading-none sm:text-6xl"
              style={{
                fontFamily: 'var(--font-latin-dot-gothic)',
              }}
            >
              カルチャー
            </h1>
            <p className="mt-4 max-w-2xl text-base text-cutout-readable leading-8">
              ぼくを構成する音楽、動画、いろいろ。
            </p>
          </div>
        </div>
      </section>

      <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cultureItems.map((item) => (
          <CultureCard item={item} key={item.slug} onOpen={openModal} />
        ))}
      </ul>

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
        <span className="relative block aspect-[4/3] overflow-hidden">
          <img
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            data-culture-card-media
            className={`${cultureStyles.cardMedia} size-full object-cover opacity-90`}
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-100">
            <span className="flex size-14 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole">
              <Play
                aria-hidden="true"
                className="ml-0.5 size-7 fill-current"
                strokeWidth={1.8}
              />
            </span>
          </span>
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
  const modalRootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const [renderMedia, setRenderMedia] = useState(false);
  const [stencilScrollY, setStencilScrollY] = useState<number | null>(null);

  useEffect(() => {
    const isStencilModal = Boolean(
      modalRootRef.current?.closest('[data-cutout-layer="stencil"]'),
    );

    setRenderMedia(!isStencilModal);
    setStencilScrollY(isStencilModal ? window.scrollY : null);

    if (!isStencilModal) {
      dialogRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const modalRoot = modalRootRef.current;
    const isStencilModal = Boolean(
      modalRoot?.closest('[data-cutout-layer="stencil"]'),
    );

    if (!modalRoot || isStencilModal) {
      return;
    }

    const sourceBody = modalRoot.querySelector<HTMLElement>(
      '[data-culture-modal-body]',
    );

    if (!sourceBody) {
      return;
    }

    let stencilBody: HTMLElement | null = null;
    const getStencilBody = () => {
      stencilBody ??= document.querySelector<HTMLElement>(
        `[data-cutout-layer="stencil"] ${modalRootSelector} [data-culture-modal-body]`,
      );

      return stencilBody;
    };

    const syncStencilScroll = () => {
      const targetBody = getStencilBody();

      if (!targetBody) {
        return;
      }

      targetBody.scrollTop = sourceBody.scrollTop;
      targetBody.scrollLeft = sourceBody.scrollLeft;
    };

    const animationFrame = window.requestAnimationFrame(syncStencilScroll);

    sourceBody.addEventListener('scroll', syncStencilScroll, {
      passive: true,
    });
    window.addEventListener('resize', syncStencilScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      sourceBody.removeEventListener('scroll', syncStencilScroll);
      window.removeEventListener('resize', syncStencilScroll);
    };
  }, []);

  const modalStyle =
    stencilScrollY === null
      ? undefined
      : ({
          '--modal-scroll-y': `${stencilScrollY}px`,
        } as CSSProperties);

  return (
    <div
      ref={modalRootRef}
      className={`${cultureStyles.modalRoot} fixed inset-0 z-50 flex items-center justify-center`}
      style={modalStyle}
    >
      <button
        type="button"
        aria-label="モーダルを閉じる"
        className="fixed inset-0 size-full cursor-default"
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        aria-labelledby="culture-modal-title"
        aria-modal="true"
        className="relative flex h-[80dvh] w-[80vw] flex-col overflow-hidden border-8 border-cutout-hole outline-none"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex shrink-0 justify-end border-cutout-hole border-b p-1.5 sm:p-2">
          <button
            type="button"
            aria-label="モーダルを閉じる"
            className="flex size-9 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole hover:text-cutout-hole focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole sm:size-11 [@media_(orientation:landscape)_and_(max-height:500px)]:size-9"
            onClick={onClose}
          >
            <X
              aria-hidden="true"
              className="size-4 sm:size-5 [@media_(orientation:landscape)_and_(max-height:500px)]:size-4"
              strokeWidth={2}
            />
          </button>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row"
          data-culture-modal-body
        >
          <div className="shrink-0 border-cutout-hole border-b p-4 sm:p-5 lg:flex lg:w-[42%] lg:items-center lg:border-r lg:border-b-0 lg:p-6">
            <div className="mx-auto aspect-video w-full md:max-w-2xl lg:max-w-none">
              {renderMedia ? (
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

          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:min-h-0 lg:flex-1 lg:p-8">
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
        </div>
      </section>
    </div>
  );
}
