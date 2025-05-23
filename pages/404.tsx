import type { NextPage } from 'next';
import { NextSeo } from 'next-seo';
import { Box, Flex, Heading } from 'theme-ui';

import { FitScreenContainer } from '@/components/elements/FitScreenContainer';

const Custom404: NextPage = () => {
  const text = 'This page exists in the future!!!';

  return (
    <>
      <NextSeo description={text} title="404" />
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
            {text}
          </Box>
        </Flex>
      </FitScreenContainer>
    </>
  );
};

export default Custom404;
