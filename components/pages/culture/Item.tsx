/** @jsxRuntime classic */
/** @jsx jsx * */
import Image, { ImageLoader } from 'next/image';
import React, { useState } from 'react';
import { IoPlayCircleOutline } from 'react-icons/io5';
import { Card, Flex, jsx } from 'theme-ui';

import { YouTubeModal } from '@/components/pages/culture/YouTubeModal';
import { Culture } from '@/lib/microcms/model';

const youtubeThumbnailLoader: ImageLoader = ({ src }) => {
  return `https://img.youtube.com/vi/${src}/hqdefault.jpg`;
};

export const Item: React.FC<{
  item: Culture;
}> = ({ item }) => {
  const [play, setPlay] = useState<boolean>(false);

  return (
    <Card>
      <dl sx={{ mb: 1 }}>
        <Flex
          onClick={() => setPlay(true)}
          sx={{
            position: 'relative',
            cursor: 'pointer',
            bg: 'black',
          }}
        >
          <Image
            loader={youtubeThumbnailLoader}
            src={item.youtubeVideoId}
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
            <IoPlayCircleOutline
              color="#fff"
              size={64}
              sx={{
                filter: 'drop-shadow(0 0 3px rgba(0, 0, 0, 0.3))',
              }}
            />
          </Flex>
        </Flex>
      </dl>
      <dt sx={{ fontWeight: 'normal' }}>{item.name}</dt>
      <YouTubeModal
        open={play}
        handleClose={() => setPlay(false)}
        cultureItem={item}
      />
    </Card>
  );
};
