/* @jsxRuntime classic */
/* @jsx jsx */
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Flex, jsx } from 'theme-ui';

import { ArrowLeft, ArrowRight } from '@/components/elements/Icon';

const ICON_SIZE = 32;

export const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  basePath: string;
  paginationBasePath: string;
}> = ({ totalPages, currentPage, basePath, paginationBasePath }) => {
  const { prevPath, nextPath } = useMemo(() => {
    return {
      prevPath:
        // eslint-disable-next-line no-nested-ternary
        currentPage <= 1
          ? null
          : currentPage === 2
          ? basePath
          : `${paginationBasePath}${currentPage - 1}`,
      nextPath:
        currentPage === totalPages
          ? null
          : `${paginationBasePath}${currentPage + 1}`,
    };
  }, [currentPage]);

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Flex sx={{ width: ICON_SIZE, height: ICON_SIZE }}>
        {prevPath && (
          <Link href={prevPath}>
            <a>
              <ArrowLeft
                size={ICON_SIZE}
                sx={{
                  color: 'black',
                }}
              />
            </a>
          </Link>
        )}
      </Flex>
      <Flex sx={{ alignItems: 'flex-end', mx: 4, cursor: 'default' }}>
        <span sx={{ fontSize: 4, color: 'black' }}>{currentPage}</span>
        <span sx={{ fontSize: 1, color: 'darkgray' }}>/{totalPages}</span>
      </Flex>
      <Flex sx={{ width: ICON_SIZE, height: ICON_SIZE }}>
        {nextPath && (
          <Link href={nextPath}>
            <a>
              <ArrowRight
                size={ICON_SIZE}
                sx={{
                  color: 'black',
                }}
              />
            </a>
          </Link>
        )}
      </Flex>
    </Flex>
  );
};
