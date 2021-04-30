/* @jsx jsx */
import { graphql, PageProps } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { Box, Flex, Grid, jsx, Styled } from 'theme-ui';

import { Chronology, ChronologyItem } from '@/components/bio/chronology';
import { Skill } from '@/components/bio/skill';
import { Sns } from '@/components/bio/sns';
import { Layout } from '@/layout';

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
    allContentfulSkill(sort: { fields: [priority], order: ASC }) {
      edges {
        node {
          name
          level
        }
      }
    }
  }
`;

const BioPage: React.FC<PageProps<GatsbyTypes.BioQueryQuery>> = props => {
  const chronology = props.data.allContentfulChronology.edges;
  const skills = props.data.allContentfulSkill.edges;

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
              mb: 2,
            }}
          >
            <Sns />
          </Box>
          <Chronology>
            {chronology.map(({ node }) => (
              <ChronologyItem
                key={node.year}
                year={node.year!}
                body={node.body!}
              />
            ))}
          </Chronology>
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
        <Grid gap={3} columns={[2, 3, 4, 5]}>
          {skills.map(({ node }) => (
            <Skill key={node.name} name={node.name!} level={node.level!} />
          ))}
        </Grid>
      </Box>
    </Layout>
  );
};

export default BioPage;
