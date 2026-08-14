export type RectOverlap = {
  height: number;
  left: number;
  top: number;
  width: number;
};

export function getRectOverlap(
  foregroundRect: DOMRectReadOnly,
  backgroundRect: DOMRectReadOnly,
): RectOverlap | null {
  const overlapLeft = Math.max(0, foregroundRect.left - backgroundRect.left);
  const overlapTop = Math.max(0, foregroundRect.top - backgroundRect.top);
  const overlapRight = Math.min(
    backgroundRect.width,
    foregroundRect.right - backgroundRect.left,
  );
  const overlapBottom = Math.min(
    backgroundRect.height,
    foregroundRect.bottom - backgroundRect.top,
  );
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);

  if (overlapWidth <= 0 || overlapHeight <= 0) {
    return null;
  }

  return {
    height: overlapHeight,
    left: overlapLeft,
    top: overlapTop,
    width: overlapWidth,
  };
}
