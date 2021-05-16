/** @jsxRuntime classic */
/** @jsx jsx * */
/* eslint-disable @typescript-eslint/no-use-before-define */
import parse, {
  domToReact,
  Element,
  HTMLReactParserOptions,
} from 'html-react-parser';
import NextImage from 'next/image';
import NextLink from 'next/link';
import React from 'react';
import { Embed, Flex, jsx, Link, Themed } from 'theme-ui';

import { baseUrl } from '@/constants/site';

const MediaWrapper: React.FC = ({ children }) => {
  return (
    <Flex sx={{ justifyContent: 'center', my: 3 }}>
      <Flex sx={{ width: '100%', maxWidth: '576px' }}>{children}</Flex>
    </Flex>
  );
};

const parseOption: HTMLReactParserOptions = {
  replace: domNode => {
    const { name, attribs, children } = domNode as Element;

    switch (name) {
      case 'h1':
        return <Themed.h1 as="h2">{parseChildren(children)}</Themed.h1>;
      case 'h2':
        return <Themed.h2 as="h3">{parseChildren(children)}</Themed.h2>;
      case 'h3':
        return <Themed.h3 as="h4">{parseChildren(children)}</Themed.h3>;
      case 'h4':
        return <Themed.h4 as="h5">{parseChildren(children)}</Themed.h4>;
      case 'h5':
        return <Themed.h5 as="h6">{parseChildren(children)}</Themed.h5>;
      case 'a':
        if (attribs.href.startsWith(baseUrl)) {
          return (
            <NextLink href={attribs.href.replace(baseUrl, '')}>
              <a>
                <span sx={{ variant: 'styles.a' }}>
                  {parseChildren(children)}
                </span>
              </a>
            </NextLink>
          );
        }
        return (
          <Link href={attribs.href} target="_blank">
            {parseChildren(children)}
          </Link>
        );
      case 'img':
        return (
          <MediaWrapper>
            <NextImage
              src={attribs.src}
              objectFit="contain"
              width={480}
              height={360}
            />
          </MediaWrapper>
        );
      case 'iframe':
        return (
          <MediaWrapper>
            <Embed src={attribs.src} loading="lazy" />
          </MediaWrapper>
        );
      default:
        if (name in Themed) {
          // @ts-ignore
          const ThemedComponent = Themed[name];
          return <ThemedComponent>{parseChildren(children)}</ThemedComponent>;
        }
        return null;
    }
  },
};

const parseChildren = (children: Element['children']) => {
  return domToReact(children, parseOption);
};

export const htmlToThemed = (html: string): ReturnType<typeof parse> => {
  return parse(html, parseOption);
};
