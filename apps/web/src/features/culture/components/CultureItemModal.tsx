import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { Modal } from '@/components/ui/Modal';
import type { CultureListItem } from '../types';

type CultureItemModalProps = {
  item: CultureListItem;
  onClose: () => void;
};

export function CultureItemModal({ item, onClose }: CultureItemModalProps) {
  return (
    <Modal onClose={onClose} titleId="culture-modal-title">
      {({ isContentLayer }) => (
        <div className="w-full md:grid md:grid-cols-[48%_1fr] md:self-start [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:flex">
          <div className="shrink-0 px-4 sm:px-5 md:col-start-1 md:row-start-2 md:px-7 md:pt-6 md:pb-7 [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:flex [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:w-[48%] [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:items-start [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:justify-center [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:px-4">
            <div className="mx-auto aspect-video w-full max-w-xl lg:max-w-none [@media_(min-width:768px)_and_(max-width:1023px)_and_(max-height:900px)]:max-w-md">
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

          <div className="flex flex-col gap-5 p-5 md:contents [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:min-h-0 [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:flex-1 [@media_(orientation:landscape)_and_(max-width:767px)_and_(max-height:500px)]:p-5">
            <header className="shrink-0 border-cutout-hole border-b pb-3 md:col-span-2 md:col-start-1 md:row-start-1 md:mx-7 md:mt-6 md:pb-4">
              <h2
                className="font-bold text-3xl leading-tight md:text-center lg:text-4xl"
                id="culture-modal-title"
              >
                {item.name}
              </h2>
            </header>

            <MarkdownContent
              className="md:col-start-2 md:row-start-2 md:pt-6 md:pr-7 md:pb-7"
              variant="compact"
            >
              {item.body}
            </MarkdownContent>
          </div>
        </div>
      )}
    </Modal>
  );
}
