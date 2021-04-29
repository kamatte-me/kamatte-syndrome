/* @jsx jsx */
import { graphql, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { GoMarkGithub } from 'react-icons/go';
import { Box, Donut, Flex, Grid, jsx, Link, Styled, Text } from 'theme-ui';

import Layout from '@/layout';

export const pageQuery = graphql`
  query BioQuery {
    allContentfulChronology(sort: { fields: [year], order: ASC }) {
      edges {
        node {
          year
          body
        }
      }
    }
  }
`;

const IndexPage: React.FC<PageProps<GatsbyTypes.BioQueryQuery>> = props => {
  const chronology = props.data.allContentfulChronology.edges;

  return (
    <Layout>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['center', 'flex-start'],
          justifyContent: 'center',
          mb: 5,
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
          <Styled.h1
            sx={{
              color: 'primary',
              mb: 1,
              textAlign: ['center', 'left'],
            }}
          >
            kamatte
          </Styled.h1>
          <Box
            sx={{
              textAlign: ['center', 'left'],
              transition: 'opacity .2s ease-in',
              '&:hover': {
                opacity: 0.7,
              },
              mb: 2,
            }}
          >
            <Link href="https://github.com/kamatte-me" target="_blank">
              <GoMarkGithub size={32} color="#24292e" />
            </Link>
          </Box>
          <dl>
            {chronology.map(({ node }) => (
              <div key={node.year}>
                <dt
                  sx={{
                    width: 72,
                    float: 'left',
                    clear: 'left',
                    fontWeight: 'normal',
                  }}
                >
                  <Text>{node.year}年</Text>
                </dt>
                <dd sx={{ marginLeft: 72 }}>{node.body}</dd>
              </div>
            ))}
          </dl>
        </Box>
      </Flex>

      <Box>
        <Flex
          sx={{
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Styled.h2>Skills</Styled.h2>
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
