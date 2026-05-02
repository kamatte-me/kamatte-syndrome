import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allCultures } from 'content-collections';
import { Play, X } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

type RenderedServerComponent = RenderableServerComponent<ReactElement>;

type CultureListItem = {
  body: RenderedServerComponent;
  name: string;
  order: number;
  slug: string;
  youtubeVideoId: string;
};

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

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
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
  }, [closeModal, selectedItem]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="border-white/15 border-b pb-8">
        <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
          Culture
        </p>
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1
              className="font-bold text-5xl leading-none sm:text-6xl"
              style={{
                fontFamily: 'var(--font-latin-dot-gothic)',
              }}
            >
              カルチャー
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/72 leading-8">
              ぼくを構成する音楽、動画、いろいろ。
            </p>
          </div>
          <Link
            to="/"
            className="w-fit rounded-full border border-white/20 px-5 py-2 text-sm text-white/75 transition hover:border-white/40 hover:text-white"
          >
            Back Home
          </Link>
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
        className="group grid h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black/30 text-left shadow-[0_18px_54px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
        onClick={() => onOpen(item.slug)}
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-white/5">
          <img
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            className="size-full object-cover opacity-90 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/12 opacity-100 transition group-hover:bg-black/0">
            <span className="flex size-14 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white shadow-[0_0_28px_rgba(0,0,0,0.45)] backdrop-blur">
              <Play
                aria-hidden="true"
                className="ml-0.5 size-7 fill-current"
                strokeWidth={1.8}
              />
            </span>
          </span>
        </span>
        <span className="flex min-h-20 items-center px-4 py-3 font-bold text-lg text-white leading-snug">
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
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
        className="relative flex h-[80dvh] w-[80vw] flex-col overflow-hidden rounded-3xl border border-white/15 bg-black/85 shadow-[0_28px_96px_rgba(0,0,0,0.62)] outline-none backdrop-blur-sm"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex shrink-0 justify-end border-white/10 border-b bg-black/70 p-2">
          <button
            type="button"
            aria-label="モーダルを閉じる"
            className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="shrink-0 border-white/10 border-b bg-black/35 p-4 sm:p-5 lg:flex lg:w-[42%] lg:items-center lg:border-r lg:border-b-0 lg:p-6">
            <div className="mx-auto aspect-video w-full bg-black md:max-w-2xl lg:max-w-none">
              <iframe
                title={`${item.name} - YouTube`}
                src={`https://www.youtube.com/embed/${item.youtubeVideoId}?autoplay=1`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-5 sm:p-7 lg:p-8">
            <header className="shrink-0 border-white/10 border-b pb-4">
              <p className="mb-2 font-semibold text-white/45 text-xs uppercase tracking-[0.28em]">
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

            <MarkdownContent
              className="min-h-0 flex-1 overflow-y-auto pr-1"
              variant="compact"
            >
              {item.body}
            </MarkdownContent>
          </div>
        </div>
      </section>
    </div>
  );
}
