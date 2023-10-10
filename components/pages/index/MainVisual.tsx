import Image from 'next/image';
import React from 'react';
import { Flex, Heading } from 'theme-ui';

import { slogan } from '@/constants/site';

export const MainVisual: React.FC = () => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Flex>
        <Image
          alt="me"
          height={380}
          priority
          src="/avatar.svg"
          style={{
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
          }}
          width={380}
        />
      </Flex>
      <Flex sx={{ width: '100%' }}>
        <Heading
          sx={{
            variant: 'text.hand',
            fontSize: 6,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {slogan}
        </Heading>
      </Flex>
    </Flex>
  );
};
