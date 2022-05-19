import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Image from 'next/image';
import { BreadcrumbJsonLd, NextSeo, SocialProfileJsonLd } from 'next-seo';
import React from 'react';
import { Box, Flex, Grid, Heading } from 'theme-ui';

import { HistoryItem } from '@/components/pages/biography/History';
import { SkillItem } from '@/components/pages/biography/Skill';
import { Sns } from '@/components/pages/biography/Sns';
import { author, baseUrl } from '@/constants/site';
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

const PAGE_TITLE = 'Biography';

const BiographyPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ histories, skills }) => {
  return (
    <>
      <NextSeo
        title={PAGE_TITLE}
        description={`${author}のすべて`}
        openGraph={{
          title: PAGE_TITLE,
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: PAGE_TITLE,
            item: `${baseUrl}/biography`,
          },
        ]}
      />
      <SocialProfileJsonLd
        type="Person"
        name={author}
        url={`${baseUrl}/biography`}
        sameAs={[
          'https://twitter.com/kamatte_me',
          'https://github.com/kamatte-me',
        ]}
      />

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
