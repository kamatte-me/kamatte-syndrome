import { NextPage, NextPageContext } from 'next';
import { ErrorProps } from 'next/error';
import React from 'react';
import { Box, Flex, Heading } from 'theme-ui';

import { FitScreenContainer } from '@/components/elements/FitScreenContainer';
import { SEO } from '@/components/elements/SEO';

const statusMessageMap: {
  [statusCode: number]: string;
} = {
  404: 'This page exists in the future!!!',
};

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const message =
    statusCode in statusMessageMap ? statusMessageMap[statusCode] : 'suman';

  return (
    <>
      <SEO title={`${statusCode}: ${message}`} />
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
            {statusCode}
          </Heading>
          <Box
            sx={{
              fontFamily: 'heading',
            }}
          >
            {message}
          </Box>
        </Flex>
      </FitScreenContainer>
    </>
  );
};

Error.getInitialProps = async ({ res, err }: NextPageContext) => {
  // eslint-disable-next-line no-nested-ternary
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return { statusCode } as ErrorProps;
};

export default Error;
