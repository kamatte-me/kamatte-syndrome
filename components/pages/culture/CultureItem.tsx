import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { Card, Flex } from 'theme-ui';

import { PlayIcon } from '@/components/elements/Icon';
import { YouTubeModal } from '@/components/pages/culture/YouTubeModal';
import type { Culture } from '@/lib/microcms/model';

export const CultureItem: React.FC<{
  item: Culture;
}> = ({ item }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    window.history.pushState(null, '', router.asPath);
    window.onpopstate = () => {
      setIsOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- clear event handler
      window.onpopstate = () => {};
    };
  }, [router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <Card>
      <dd sx={{ mb: 1 }}>
        <Flex
          onClick={handleOpen}
          sx={{
            position: 'relative',
            cursor: 'pointer',
            bg: 'black',
          }}
        >
          <Image
            alt={item.name}
            height={360}
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
            width={480}
          />
          <Flex
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: [1, 0],
              transition: 'opacity .2s ease-out',
              ':hover': {
                opacity: 1,
              },
            }}
          >
            <PlayIcon
              color="#fff"
              sx={{
                width: 64,
                height: 64,
                filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))',
              }}
            />
          </Flex>
        </Flex>
      </dd>
      <dt sx={{ fontWeight: 'normal' }}>{item.name}</dt>
      <YouTubeModal
        cultureItem={item}
        handleClose={handleClose}
        open={isOpen}
      />
    </Card>
  );
};
