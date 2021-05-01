/* @jsx jsx */
import { Box, Donut, Flex, jsx, Text } from 'theme-ui';

interface SkillProps {
  name: string;
  level: number;
}

export const Skill: React.FC<SkillProps> = ({ name, level }) => {
  return (
    <Box>
      <Flex
        sx={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          sx={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
          dangerouslySetInnerHTML={{
            __html: name.replace('\n', '<br>'),
          }}
        />
        <Donut
          title="JavaScript"
          value={level / 100}
          color={level >= 90 ? 'secondary' : 'primary'}
        />
      </Flex>
    </Box>
  );
};
