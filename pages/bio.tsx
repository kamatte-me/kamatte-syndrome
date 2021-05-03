/** @jsxRuntime classic */
/** @jsx jsx * */
import { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';
import { Box, Flex, Grid, jsx, Themed } from 'theme-ui';

import { HistoryContainer, HistoryItem } from '@/components/bio/History';
import { SkillItem } from '@/components/bio/Skill';
import { Sns } from '@/components/bio/Sns';
import { getAllContents } from '@/lib/microcms';
import { History, Skill } from '@/lib/microcms/model';

export const getStaticProps = async () => {
  const histories = await getAllContents<History>('history', {
    orders: 'year',
  });
  const skills = await getAllContents<Skill>('skill');

  return {
    props: {
      histories,
      skills,
    },
  };
};

type BioPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const BioPage: React.FC<BioPageProps> = ({ histories, skills }) => {
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
          <Themed.h2>Skills</Themed.h2>
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

export default BioPage;
