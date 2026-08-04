import ReactImageCollection, {
  manifest as imageManifest,
} from 'virtual:react-optimized-responsive-image/collection?src=./images&base=/media&widths=160;original';
import ReactImage from 'virtual:react-optimized-responsive-image?src=./image.jpg&widths=160;320';
import type {
  ImageVariantEntry,
  ImageVariantManifest,
} from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image';
import type { ReactImageCollectionProps } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react';

const singleImage = <ReactImage alt="Single image" />;
const collectionImage = (
  <ReactImageCollection src="/media/image.jpg" alt="Collection image" />
);
const aspectAwareCollectionImage = (
  <ReactImageCollection
    src="/media/image.jpg"
    alt="Aspect-aware collection image"
    sizes={({ height, width }) => `${width}x${height}`}
  />
);

// @ts-expect-error A single image already has its source bound at build time.
const singleImageWithSource = <ReactImage src="/other.jpg" alt="Invalid" />;

// @ts-expect-error Collection images require a logical source URL.
const collectionImageWithoutSource = <ReactImageCollection alt="Invalid" />;

const collectionImageWithBlobProps: ReactImageCollectionProps = {
  alt: 'Invalid',
  // @ts-expect-error Collection source lookup only accepts string URLs.
  src: new Blob(),
};

declare const singleModule: typeof import('virtual:react-optimized-responsive-image?src=./image.jpg&widths=160;320');
declare const collectionModule: typeof import('virtual:react-optimized-responsive-image/collection?src=./images&base=/media&widths=160;320');
declare const manifest: ImageVariantManifest;

// @ts-expect-error An arbitrary manifest lookup can refer to an unknown image.
const requiredEntry: ImageVariantEntry = manifest['/media/unknown.jpg'];

// @ts-expect-error Low-level image entries are intentionally not exported.
void singleModule.variant;

const exportedManifest: ImageVariantManifest = collectionModule.manifest;

void [
  singleImage,
  collectionImage,
  aspectAwareCollectionImage,
  singleImageWithSource,
  collectionImageWithoutSource,
  collectionImageWithBlobProps,
  exportedManifest,
  imageManifest,
  requiredEntry,
];
