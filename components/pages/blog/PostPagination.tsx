/* @jsxRuntime classic */
/* @jsx jsx */
import Link from 'next/link';
import React from 'react';
import { Flex, jsx } from 'theme-ui';

import { ArrowLeft, ArrowRight } from '@/components/elements/Icon';
import { ICON_SIZE } from '@/components/elements/Pagination';
import { Blog } from '@/lib/microcms/model';

export const PostPagination: React.FC<{
  prev?: Blog | null;
  next?: Blog | null;
}> = ({ prev, next }) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Flex
        sx={{
          width: '45%',
          overflowWrap: 'anywhere',
          justifyContent: 'flex-start',
        }}
      >
        {prev && (
          <Link href={`/blog/${prev.id}`}>
            <a>
              <Flex
                sx={{
                  variant: 'styles.a',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'black',
                }}
              >
                <ArrowLeft
                  size={ICON_SIZE}
                  sx={{
                    color: 'black',
                    minWidth: ICON_SIZE,
                    minHeight: ICON_SIZE,
                    mr: 2,
                  }}
                />
                {prev.title}
              </Flex>
            </a>
          </Link>
        )}
      </Flex>
      <Flex
        sx={{
          width: '45%',
          overflowWrap: 'anywhere',
          justifyContent: 'flex-end',
        }}
      >
        {next && (
          <Link href={`/blog/${next.id}`}>
            <a>
              <Flex
                sx={{
                  variant: 'styles.a',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'black',
                }}
              >
                {next.title}
                <ArrowRight
                  size={ICON_SIZE}
                  sx={{
                    color: 'black',
                    minWidth: ICON_SIZE,
                    minHeight: ICON_SIZE,
                    ml: 2,
                  }}
                />
              </Flex>
            </a>
          </Link>
        )}
      </Flex>
    </Flex>
  );
};
