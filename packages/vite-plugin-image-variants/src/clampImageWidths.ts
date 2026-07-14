export function clampImageWidths(
  widths: readonly number[],
  naturalWidth: number,
) {
  return [
    ...new Set(widths.map((width) => Math.min(width, naturalWidth))),
  ].sort((a, b) => a - b);
}
