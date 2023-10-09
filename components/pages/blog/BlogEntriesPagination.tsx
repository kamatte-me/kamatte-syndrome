import Link from 'next/link';
import React from 'react';
import { Flex } from 'theme-ui';

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/elements/Icon';
import { ICON_SIZE } from '@/components/elements/Pagination';
import type { Blog } from '@/lib/microcms/model';

export const BlogEntriesPagination: React.FC<{
  prev?: Blog | null;
  next?: Blog | null;
}> = ({ prev, next }) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 1,
      }}
    >
      <Flex
        sx={{
          width: '45%',
          overflowWrap: 'anywhere',
          justifyContent: 'flex-start',
        }}
      >
        {prev ? (
          <Link href={`/blog/${prev.id}`}>
            <Flex
              sx={{
                variant: 'styles.a',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'black',
              }}
            >
              <ArrowLeftIcon
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
          </Link>
        ) : null}
      </Flex>
      <Flex
        sx={{
          width: '45%',
          overflowWrap: 'anywhere',
          justifyContent: 'flex-end',
        }}
      >
        {next ? (
          <Link href={`/blog/${next.id}`}>
            <Flex
              sx={{
                variant: 'styles.a',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'black',
              }}
            >
              {next.title}
              <ArrowRightIcon
                size={ICON_SIZE}
                sx={{
                  color: 'black',
                  minWidth: ICON_SIZE,
                  minHeight: ICON_SIZE,
                  ml: 2,
                }}
              />
            </Flex>
          </Link>
        ) : null}
      </Flex>
    </Flex>
  );
};
