import sharp, { type Metadata } from 'sharp';

export function getImageDisplayDimensions(metadata: Metadata) {
  const width = metadata.autoOrient.width ?? metadata.width;
  const orientedHeight = metadata.autoOrient.height ?? metadata.height;
  return {
    height:
      (metadata.pages ?? 1) > 1
        ? (metadata.pageHeight ?? orientedHeight)
        : orientedHeight,
    width,
  };
}

export function getSharpEncoderVersion() {
  return Object.entries(sharp.versions)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, version]) => `${name}:${version}`)
    .join('\0');
}
