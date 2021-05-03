/** @jsxRuntime classic */
/** @jsx jsx * */

import React from 'react';
import { Flex, jsx, Text } from 'theme-ui';

export const FooterHeight = 60;

const year = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <Flex
      as="footer"
      sx={{
        position: 'absolute',
        bottom: 0,
        height: FooterHeight,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        as="small"
        color="lightgray"
        sx={{ fontSize: 1, textAlign: 'center' }}
      >
        <span sx={{ display: 'block', mb: 1 }}>
          © {year} かまって☆しんどろ〜む
        </span>
        <span sx={{ fontSize: '8px' }}>
          すべての発言は個人のジョークであり、所属組織を代表するものではありません。
        </span>
      </Text>
    </Flex>
  );
};
