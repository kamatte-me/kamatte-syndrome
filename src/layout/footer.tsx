import React, { useState } from 'react';
import { Flex, Text } from 'theme-ui';

export const FooterHeight = 100;

const Footer: React.FC = () => {
  const [year] = useState<number>(new Date().getFullYear());

  return (
    <Flex
      as="footer"
      sx={{
        position: 'absolute',
        bottom: 0,
        height: FooterHeight,
        width: '100%',
        pt: 5,
        pb: 2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text color="lightgray" sx={{ fontSize: 1 }}>
        © {year} かまって☆しんどろ〜む
      </Text>
    </Flex>
  );
};

export default Footer;
