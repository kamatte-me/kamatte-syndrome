/** @jsxRuntime classic */
/** @jsx jsx * */
import Image from 'next/image';
import React from 'react';
import { Card, jsx, Themed } from 'theme-ui';

import { Illustration } from '@/lib/microcms/model';

export const IllustrationCard: React.FC<{
  illustration: Illustration;
}> = ({ illustration }) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
      }}
    >
      <Themed.h1 sx={{ fontFamily: 'body', fontSize: 3, mb: 3 }}>
        {illustration.title}
      </Themed.h1>
      <Image
        src={illustration.image.url}
        alt={illustration.title}
        objectFit="contain"
        width={500}
        height={500}
      />
    </Card>
  );
};
