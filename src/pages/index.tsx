import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { Flex, get, Heading } from 'theme-ui';

import Layout from '@/layout';
import { FooterHeight } from '@/layout/footer';
import { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight + 80;

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: `calc(100vh - ${negativeHeight}px)`,
        }}
      >
        <Link to="/bio" style={{ textDecoration: 'none' }}>
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <Flex>
              <StaticImage
                src="../images/avatar.png"
                alt="me"
                width={380}
                placeholder="none"
                formats={['png']}
              />
            </Flex>
            <Flex>
              <Heading
                sx={{
                  fontFamily: t => get(t, 'fonts.hand'),
                  fontSize: 6,
                  color: 'black',
                  textDecoration: 'none',
                }}
              >
                plz kamatte me!!!
              </Heading>
            </Flex>
          </Flex>
        </Link>
      </Flex>
    </Layout>
  );
};

export default IndexPage;
