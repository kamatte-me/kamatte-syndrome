import { fetchOEmbedMetadata } from '../server/oEmbed.server';
import { LinkCard } from './LinkCard';
import { OEmbedView } from './OEmbedView';

export type OEmbedProps = {
  url: string;
  className?: string;
};

export async function OEmbed({ url, className }: OEmbedProps) {
  const metadata = await fetchOEmbedMetadata(url);

  if (!metadata) {
    return <LinkCard className={className} url={url} />;
  }

  return <OEmbedView className={className} metadata={metadata} url={url} />;
}
