import Image from 'next/image';
import React from 'react';
import { Flex, Heading } from 'theme-ui';

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
          src="/avatar.png"
          alt="me"
          objectFit="contain"
          width={380}
          height={380}
          unoptimized
        />
      </Flex>
      <Flex>
        <Heading
          sx={{
            variant: 'text.hand',
            fontSize: 6,
          }}
        >
          plz kamatte me!!!
        </Heading>
      </Flex>
    </Flex>
  );
};
