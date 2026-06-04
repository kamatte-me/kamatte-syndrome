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
        <>
          <div className="shrink-0 px-4 sm:px-5 lg:flex lg:w-[48%] lg:items-center lg:p-6 [@media_(orientation:landscape)_and_(max-height:500px)]:flex [@media_(orientation:landscape)_and_(max-height:500px)]:w-[48%] [@media_(orientation:landscape)_and_(max-height:500px)]:items-center [@media_(orientation:landscape)_and_(max-height:500px)]:px-4">
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

          <div className="flex flex-col gap-5 p-5 lg:min-h-0 lg:flex-1 lg:p-7 lg:p-8 [@media_(orientation:landscape)_and_(max-height:500px)]:min-h-0 [@media_(orientation:landscape)_and_(max-height:500px)]:flex-1 [@media_(orientation:landscape)_and_(max-height:500px)]:p-5">
            <header className="shrink-0 border-cutout-hole border-b pb-3 lg:pb-4">
              <h2
                className="font-bold text-3xl leading-tight lg:text-4xl"
                id="culture-modal-title"
              >
                {item.name}
              </h2>
            </header>

            <MarkdownContent variant="compact">{item.body}</MarkdownContent>
          </div>
        </>
      )}
    </Modal>
  );
}
