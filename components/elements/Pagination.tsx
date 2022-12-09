import Link from 'next/link';
import React, { useMemo } from 'react';
import { Flex } from 'theme-ui';

import { ArrowLeftIcon, ArrowRightIcon } from '@/components/elements/Icon';

export const ICON_SIZE = 32;

export const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  basePath: string;
  paginationBasePath: string;
}> = ({ totalPages, currentPage, basePath, paginationBasePath }) => {
  const { prevPath, nextPath } = useMemo(() => {
    let prev: string | null = null;
    if (currentPage === 2) {
      prev = basePath;
    } else if (currentPage > 2) {
      prev = `${paginationBasePath}${currentPage - 1}`;
    }
    const next =
      currentPage === totalPages
        ? null
        : `${paginationBasePath}${currentPage + 1}`;

    return {
      prevPath: prev,
      nextPath: next,
    };
  }, [currentPage, basePath, paginationBasePath, totalPages]);

  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Flex sx={{ variant: 'styles.a', width: ICON_SIZE, height: ICON_SIZE }}>
        {prevPath && (
          <Link href={prevPath}>
            <ArrowLeftIcon
              size={ICON_SIZE}
              sx={{
                color: 'black',
              }}
            />
          </Link>
        )}
      </Flex>
      <Flex sx={{ alignItems: 'flex-end', mx: 4, cursor: 'default' }}>
        <span sx={{ fontSize: 4, color: 'black' }}>{currentPage}</span>
        <span sx={{ fontSize: 1, color: 'darkgray' }}>/{totalPages}</span>
      </Flex>
      <Flex sx={{ variant: 'styles.a', width: ICON_SIZE, height: ICON_SIZE }}>
        {nextPath && (
          <Link href={nextPath}>
            <ArrowRightIcon
              size={ICON_SIZE}
              sx={{
                color: 'black',
              }}
            />
          </Link>
        )}
      </Flex>
    </Flex>
  );
};
