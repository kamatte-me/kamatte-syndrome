import { fetchOEmbedMetadata } from '@/utils/oEmbed.server';
import { LinkCard } from './LinkCard';
import { OEmbedView } from './OEmbedView';

type OEmbedProps = {
  url: string;
};

export async function OEmbed({ url }: OEmbedProps) {
  const metadata = await fetchOEmbedMetadata(url);

  if (!metadata) {
    return <LinkCard url={url} />;
  }

  return <OEmbedView metadata={metadata} url={url} />;
}
