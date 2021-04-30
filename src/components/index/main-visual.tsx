import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { Flex, get, Heading } from 'theme-ui';

export const MainVisual: React.FC = () => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Flex>
        <StaticImage
          src="../images/avatar.png"
          alt="me"
          width={380}
          placeholder="none"
          formats={['png']}
        />
      </Flex>
      <Flex>
        <Heading
          sx={{
            fontFamily: t => get(t, 'fonts.hand'),
            fontSize: 6,
            color: 'black',
          }}
        >
          plz kamatte me!!!
        </Heading>
      </Flex>
    </Flex>
  );
};
