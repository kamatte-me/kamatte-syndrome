/** @jsxRuntime classic */
/** @jsx jsx * */
import Image from 'next/image';
import React from 'react';
import { Card, jsx } from 'theme-ui';

import { Illustration } from '@/lib/microcms/model';

export const IllustrationItem: React.FC<{
  item: Illustration;
}> = ({ item }) => {
  return (
    <Card
      sx={{
        textAlign: 'center',
      }}
    >
      <dt sx={{ fontFamily: 'body', fontSize: 3, fontWeight: 'bold', mb: 3 }}>
        {item.title}
      </dt>
      <dl>
        <Image
          src={item.image.url}
          alt={item.title}
          objectFit="contain"
          width={500}
          height={500}
        />
      </dl>
    </Card>
  );
};
