/* @jsx jsx */
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { GoMarkGithub } from 'react-icons/go';
import { Box, Donut, Flex, Grid, Heading, jsx, Link, Text } from 'theme-ui';

import Layout from '@/layout';

const IndexPage: React.FC = () => {
  const chronology = {
    1994: '富山生まれ。',
    2012: '金沢に移住。',
    2013: 'IT革命児になる。',
    2014: '20歳になる。',
    2016: 'Web蜃気楼になる。',
    2017: 'シティーボーイになる',
    2018: '21世紀のWebシンデレラになる。',
    2021: 'スマホを買い換える。',
  };

  return (
    <Layout>
      <Box
        sx={{
          mb: 4,
        }}
      >
        <Flex
          sx={{
            flexDirection: ['column', 'row'],
            alignItems: ['center', 'flex-start'],
            justifyContent: 'center',
          }}
        >
          <Flex
            sx={{
              justifyContent: 'center',
              mr: [0, 4],
            }}
          >
            <StaticImage
              src="../images/avatar.png"
              alt="me"
              width={300}
              placeholder="none"
              formats={['png']}
            />
          </Flex>
          <Box>
            <Heading
              as="h1"
              sx={{
                color: 'primary',
                mb: 2,
                textAlign: ['center', 'left'],
              }}
            >
              kamatte
            </Heading>
            <Box
              sx={{
                textAlign: ['center', 'left'],
              }}
            >
              <Link href="https://github.com/kamatte-me" target="_blank">
                <GoMarkGithub size={32} color="#24292e" />
              </Link>
            </Box>
            <dl>
              {Object.entries(chronology).map(([year, value]) => (
                <div
                  key={year}
                  sx={{
                    ':not(:last-child)': {
                      marginBottom: '2px',
                    },
                  }}
                >
                  <dt
                    sx={{
                      width: 72,
                      float: 'left',
                      clear: 'left',
                    }}
                  >
                    <Text>{year}年</Text>
                  </dt>
                  <dd sx={{ marginLeft: 72 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </Box>
        </Flex>
      </Box>

      <Box>
        <Flex
          sx={{
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Heading as="h2">Skills</Heading>
        </Flex>
        <Grid gap={2} columns={[2, 3, 4, 5]}>
          <Box>
            <Flex
              sx={{
                position: 'relative',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                sx={{
                  display: 'block',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                JavaScript
              </Text>
              <Donut title="JavaScript" value={1 / 2} color="secondary" />
            </Flex>
          </Box>
          <Box>
            <Donut title="JavaScript" value={1 / 2} />
          </Box>
          <Box>
            <Donut title="JavaScript" value={1 / 2} />
          </Box>
          <Box>
            <Donut title="JavaScript" value={1 / 2} />
          </Box>
          <Box>
            <Donut title="JavaScript" value={1 / 2} />
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
};

export default IndexPage;
