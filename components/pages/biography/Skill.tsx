/** @jsxRuntime classic */
/** @jsx jsx * */
import { Box, Donut, Flex, jsx, Text } from 'theme-ui';

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
          sx={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'heading',
          }}
          dangerouslySetInnerHTML={{
            __html: name.replace('\n', '<br>'),
          }}
        />
        <Donut
          title={name}
          value={level / 100}
          color={level >= 90 ? 'secondary' : 'primary'}
          strokeWidth={3}
        />
      </Flex>
    </Box>
  );
};
