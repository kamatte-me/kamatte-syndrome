export function PortfolioImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-cutout-hole p-6 text-center">
      <span className="text-black text-xs">大人の事情で</span>
      <span className="whitespace-nowrap font-display font-normal text-2xl text-black leading-none sm:text-3xl">
        No Image
      </span>
    </div>
  );
}
