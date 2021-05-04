/** @jsxRuntime classic */
/** @jsx jsx * */
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';
import { Box, Flex, Grid, jsx, Themed } from 'theme-ui';

import {
  HistoryContainer,
  HistoryItem,
} from '@/components/pages/biography/History';
import { SkillItem } from '@/components/pages/biography/Skill';
import { Sns } from '@/components/pages/biography/Sns';
import { getAllContents } from '@/lib/microcms';
import { History, Skill } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  histories: History[];
  skills: Skill[];
}> = async () => {
  const histories = await getAllContents<History>('history', {
    orders: 'year',
    limit: 100,
  });
  const skills = await getAllContents<Skill>('skill', {
    limit: 100,
  });

  return {
    props: {
      histories,
      skills,
    },
  };
};

const BiographyPage: React.FC<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ histories, skills }) => {
  return (
    <>
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
            src="/avatar.png"
            alt="me"
            objectFit="contain"
            width={300}
            height={300}
            unoptimized
          />
        </Flex>
        <Box>
          <Themed.h1
            sx={{
              variant: 'text.display',
              color: 'primary',
              mb: 1,
              textAlign: ['center', 'left'],
            }}
          >
            kamatte
          </Themed.h1>
          <Box
            sx={{
              mb: 2,
            }}
          >
            <Sns />
          </Box>
          <HistoryContainer>
            {histories.map(item => (
              <HistoryItem key={item.id} year={item.year} body={item.body} />
            ))}
          </HistoryContainer>
        </Box>
      </Flex>

      <Box>
        <Flex
          sx={{
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Themed.h2
            sx={{
              variant: 'text.display',
            }}
          >
            Skills
          </Themed.h2>
        </Flex>
        <Grid gap={3} columns={[2, 3, 4, 5]}>
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
