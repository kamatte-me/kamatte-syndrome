import type React from 'react';
import { Box, Donut, Flex, Text } from 'theme-ui';

interface SkillItemProps {
  name: string;
  level: number;
}

export const SkillItem: React.FC<SkillItemProps> = ({ name, level }) => {
  return (
    <Box as="li">
      <Flex
        sx={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- no XSS risk
          dangerouslySetInnerHTML={{
            __html: name.replace('\n', '<br>'),
          }}
          sx={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'heading',
            fontWeight: 'bold',
          }}
        />
        <Donut
          color={level >= 90 ? 'secondary' : 'primary'}
          strokeWidth={3}
          title={name}
          value={level / 100}
        />
      </Flex>
    </Box>
  );
};
