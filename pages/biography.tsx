import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import Image from 'next/image';
import { BreadcrumbJsonLd, NextSeo, SocialProfileJsonLd } from 'next-seo';
import { Box, Flex, Grid, Heading } from 'theme-ui';

import { HistoryItem } from '@/components/pages/biography/History';
import { SkillItem } from '@/components/pages/biography/Skill';
import { Sns } from '@/components/pages/biography/Sns';
import { author, baseUrl } from '@/constants/site';
import { client } from '@/lib/microcms';
import type { History, Skill } from '@/lib/microcms/model';

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
        description={`${author}のすべて`}
        title={PAGE_TITLE}
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
        name={author}
        type="Person"
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
            priority
            alt="me"
            height={300}
            src="/avatar.svg"
            width={300}
            style={{
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'contain',
            }}
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
              mb: 3,
            }}
          >
            <Sns />
          </Box>
          <Box as="dl">
            {histories.map((item) => (
              <HistoryItem body={item.body} key={item.id} year={item.year} />
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
        <Grid as="ul" columns={[2, 3, 4, 5]} gap={3}>
          {skills.map((item) => (
            <SkillItem key={item.id} level={item.level} name={item.name} />
          ))}
          <SkillItem level={100} name="kawaii" />
        </Grid>
      </Box>
    </>
  );
};

export default BiographyPage;
