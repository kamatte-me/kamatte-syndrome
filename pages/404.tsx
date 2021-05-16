import { NextPage } from 'next';
import React from 'react';
import { Box, Flex, Heading } from 'theme-ui';

import { FitScreenContainer } from '@/components/elements/FitScreenContainer';
import { SEO } from '@/components/elements/SEO';

const Custom404: NextPage = () => {
  return (
    <>
      <SEO title="404" />
      <FitScreenContainer>
        <Flex
          sx={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Heading as="h1" sx={{ fontSize: 5 }}>
            404
          </Heading>
          <Box
            sx={{
              fontFamily: 'heading',
            }}
          >
            This page exists in the future!!!
          </Box>
        </Flex>
      </FitScreenContainer>
    </>
  );
};

export default Custom404;
