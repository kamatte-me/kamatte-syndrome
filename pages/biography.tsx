/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Image from 'next/image';
import React from 'react';
import { Box, Flex, Grid, Heading, jsx } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { HistoryItem } from '@/components/pages/biography/History';
import { SkillItem } from '@/components/pages/biography/Skill';
import { Sns } from '@/components/pages/biography/Sns';
import { author } from '@/constants/site';
import { client } from '@/lib/microcms';
import { History, Skill } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  histories: History[];
  skills: Skill[];
}> = async () => {
  const [histories, skills] = await Promise.all([
    client.getAllContents('history', {
      orders: 'year',
      limit: 50,
    }),
    client.getAllContents('skill', {
      limit: 50,
    }),
  ]);

  return {
    props: {
      histories,
      skills,
    },
  };
};

const BiographyPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> =
  ({ histories, skills }) => {
    return (
      <>
        <SEO title="Biography" description={`${author}のすべて`} />
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
            <Image
              src="/avatar.svg"
              alt="me"
              objectFit="contain"
              width={300}
              height={300}
              priority
            />
          </Flex>
          <Box>
            <Heading
              as="h1"
              sx={{
                variant: 'text.display',
                color: 'primary',
                mb: 1,
                fontSize: 5,
                textAlign: ['center', 'left'],
              }}
            >
              {author}
            </Heading>
            <Box
              sx={{
                mb: 2,
              }}
            >
              <Sns />
            </Box>
            <Box as="dl">
              {histories.map(item => (
                <HistoryItem key={item.id} year={item.year} body={item.body} />
              ))}
            </Box>
          </Box>
        </Flex>

        <Box>
          <Flex
            sx={{
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Heading
              as="h2"
              sx={{
                fontSize: 5,
              }}
            >
              Skills
            </Heading>
          </Flex>
          <Grid as="ul" gap={3} columns={[2, 3, 4, 5]}>
            {skills.map(item => (
              <SkillItem key={item.id} name={item.name} level={item.level} />
            ))}
            <SkillItem name="kawaii" level={100} />
          </Grid>
        </Box>
      </>
    );
  };

export default BiographyPage;
