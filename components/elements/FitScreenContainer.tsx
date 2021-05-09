import React from 'react';
import { Flex } from 'theme-ui';

import { FooterHeight } from '@/layout/Footer';
import { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight + 100;

export const FitScreenContainer: React.FC = ({ children }) => {
  return (
    <Flex
      sx={{
        minHeight: `calc(100vh - ${negativeHeight}px)`,
        width: '100%',
      }}
    >
      {children}
    </Flex>
  );
};
