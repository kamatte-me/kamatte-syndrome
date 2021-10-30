/** @jsxImportSource theme-ui */
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { Card, Flex } from 'theme-ui';

import { PlayIcon } from '@/components/elements/Icon';
import { YouTubeModal } from '@/components/pages/culture/YouTubeModal';
import { Culture } from '@/lib/microcms/model';

export const CultureItem: React.FC<{
  item: Culture;
}> = ({ item }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    history.pushState(null, '', router.asPath);
    router.beforePopState(() => {
      setIsOpen(false);
      router.beforePopState(() => true);
      return true;
    });
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
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            alt={item.name}
            objectFit="cover"
            width={480}
            height={360}
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
        open={isOpen}
        handleClose={handleClose}
        cultureItem={item}
      />
    </Card>
  );
};
