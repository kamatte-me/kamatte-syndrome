import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageLightboxController } from './ImageLightboxController';
import { ImageLightboxTrigger } from './ImageLightboxTrigger';

const lightboxRenderSpy = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('./ImageLightbox', () => ({
  ImageLightbox: ({
    alt,
    height,
    onClose,
    src,
    width,
  }: {
    alt: string;
    height: number;
    onClose: () => void;
    src: string;
    width: number;
  }) => {
    lightboxRenderSpy();

    return (
      <section aria-label="画像の拡大表示" role="dialog">
        <img src={src} alt={alt} height={height} width={width} />
        <button type="button" onClick={onClose}>
          閉じる
        </button>
      </section>
    );
  },
}));

beforeEach(() => {
  lightboxRenderSpy.mockClear();
  navigateMock.mockClear();
  window.history.replaceState({}, '', '/');
});

function PostImage() {
  return (
    <ImageLightboxTrigger alt="記事画像" originalSrc="/media/original.jpg">
      <img
        src="/optimized/image.avif"
        alt="記事画像"
        height={600}
        width={800}
      />
    </ImageLightboxTrigger>
  );
}

function LayeredControllerFixture() {
  return (
    <>
      <div aria-hidden="true" data-cutout-layer="stencil" inert>
        <ImageLightboxController>
          <PostImage />
        </ImageLightboxController>
      </div>
      <div data-cutout-layer="content">
        <ImageLightboxController>
          <PostImage />
        </ImageLightboxController>
      </div>
    </>
  );
}

function getImageTrigger() {
  return screen.getByRole('button', {
    name: '記事画像を拡大表示',
  }) as HTMLButtonElement;
}

function openImage() {
  fireEvent.click(getImageTrigger());
}

function mockImageTriggerRect(trigger: HTMLButtonElement) {
  vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    bottom: 200,
    height: 200,
    left: 0,
    right: 200,
    top: 0,
    width: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

type TouchReleaseOptions = {
  clientX?: number;
  clientY?: number;
  endClientX?: number;
  endClientY?: number;
  synthesizeClick?: boolean;
};

function releaseTouchOnImage({
  clientX = 100,
  clientY = 100,
  endClientX = clientX,
  endClientY = clientY,
  synthesizeClick = false,
}: TouchReleaseOptions = {}) {
  const trigger = getImageTrigger();

  mockImageTriggerRect(trigger);

  fireEvent.pointerDown(trigger, {
    clientX,
    clientY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  });
  fireEvent.pointerUp(trigger, {
    clientX: endClientX,
    clientY: endClientY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  });

  if (synthesizeClick) {
    fireEvent.click(trigger, { detail: 1 });
  }
}

describe('ImageLightboxController', () => {
  it('opens the original image from only the interactive content tree', () => {
    render(
      <StrictMode>
        <LayeredControllerFixture />
      </StrictMode>,
    );

    openImage();

    const dialog = screen.getByRole('dialog');
    const image = within(dialog).getByRole('img', { name: '記事画像' });

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(image).toHaveAttribute('src', '/media/original.jpg');
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '600');
  });

  it('opens once from touch release when Android omits the synthesized click', async () => {
    render(<LayeredControllerFixture />);
    releaseTouchOnImage();

    await screen.findByRole('dialog');

    expect(lightboxRenderSpy).toHaveBeenCalledOnce();
  });

  it('does not open an image when a touch gesture moves like a page scroll', async () => {
    render(<LayeredControllerFixture />);
    releaseTouchOnImage({
      endClientX: 100,
      endClientY: 180,
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open twice when Android also dispatches a synthesized click', async () => {
    render(<LayeredControllerFixture />);
    releaseTouchOnImage({ synthesizeClick: true });

    await screen.findByRole('dialog');

    expect(lightboxRenderSpy).toHaveBeenCalledOnce();
  });

  it('closes immediately and can reopen the same image', () => {
    render(<LayeredControllerFixture />);
    openImage();

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    openImage();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('adds a non-scrolling history entry and closes it with browser back', () => {
    const historyBack = vi
      .spyOn(window.history, 'back')
      .mockImplementation(() => undefined);

    try {
      render(<LayeredControllerFixture />);
      openImage();

      expect(navigateMock).toHaveBeenCalledOnce();
      const [navigateOptions] = navigateMock.mock.calls[0] ?? [];

      expect(navigateOptions).toMatchObject({
        resetScroll: false,
        to: '.',
      });
      expect(navigateOptions.state({})).toEqual({
        imageLightbox: '/media/original.jpg',
      });

      window.history.replaceState({ imageLightbox: '/media/original.jpg' }, '');
      fireEvent.click(screen.getByRole('button', { name: '閉じる' }));

      expect(historyBack).toHaveBeenCalledOnce();

      fireEvent.popState(window);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      historyBack.mockRestore();
    }
  });

  it('leaves image triggers inside links to the link interaction', () => {
    render(
      <div data-cutout-layer="content">
        <ImageLightboxController>
          <a href="/media/original.jpg">
            <PostImage />
          </a>
        </ImageLightboxController>
      </div>,
    );

    openImage();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
