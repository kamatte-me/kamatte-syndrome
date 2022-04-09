/* eslint-disable @typescript-eslint/no-use-before-define, react/jsx-pascal-case, react/jsx-props-no-spreading */

import parse, {
  attributesToProps,
  domToReact,
  Element,
  HTMLReactParserOptions,
  htmlToDOM,
  Text,
} from 'html-react-parser';
import NextImage from 'next/image';
import NextLink from 'next/link';
import Script from 'next/script';
import React, { ElementType } from 'react';
import { Embed, Flex, Link, Themed } from 'theme-ui';

import { baseUrl } from '@/constants/site';

const MediaWrapper: React.FC = ({ children }) => (
  <Flex sx={{ justifyContent: 'center', my: 3 }}>
    <Flex sx={{ flexDirection: 'column', width: '100%', maxWidth: '576px' }}>
      {children}
    </Flex>
  </Flex>
);

const parseStyleString = (styleStr?: string | null) => {
  if (!styleStr) {
    return {};
  }
  return styleStr.split(';').reduce((acc, style) => {
    const colonPosition = style.indexOf(':');

    if (colonPosition === -1) {
      return acc;
    }

    const camelCaseProperty = style
      .substr(0, colonPosition)
      .trim()
      .replace(/^-ms-/, 'ms-')
      .replace(/-./g, c => c.substr(1).toUpperCase());
    const value = style.substr(colonPosition + 1).trim();

    return value ? { ...acc, [camelCaseProperty]: value } : acc;
  }, {});
};

const parseOption: HTMLReactParserOptions = {
  replace: domNode => {
    const { name, attribs, children } = domNode as Element;
    const attrProps = attributesToProps(attribs);

    switch (name as ElementType) {
      case 'h1':
        return (
          <Themed.h1 {...attrProps} as="h2">
            {parseChildren(children)}
          </Themed.h1>
        );
      case 'h2':
        return (
          <Themed.h2 {...attrProps} as="h3">
            {parseChildren(children)}
          </Themed.h2>
        );
      case 'h3':
        return (
          <Themed.h3 {...attrProps} as="h4">
            {parseChildren(children)}
          </Themed.h3>
        );
      case 'h4':
        return (
          <Themed.h4 {...attrProps} as="h5">
            {parseChildren(children)}
          </Themed.h4>
        );
      case 'h5':
        return (
          <Themed.h5 {...attrProps} as="h6">
            {parseChildren(children)}
          </Themed.h5>
        );
      case 'a':
        if (attribs.href.startsWith(baseUrl)) {
          return (
            <NextLink href={attribs.href.replace(baseUrl, '')}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a>
                <span sx={{ variant: 'styles.a' }}>
                  {parseChildren(children)}
                </span>
              </a>
            </NextLink>
          );
        }
        return (
          <Link {...attrProps} target="_blank">
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
            <Embed {...attrProps} loading="lazy" />
          </MediaWrapper>
        );
      case 'blockquote': {
        const elm = (
          <Themed.blockquote {...attrProps}>
            {parseChildren(children)}
          </Themed.blockquote>
        );
        if (attrProps.className && attrProps.className === 'twitter-tweet') {
          return (
            <MediaWrapper>
              {elm}
              {/* eslint-disable-next-line @next/next/inline-script-id */}
              <Script strategy="lazyOnload">
                {'if (window.twttr) { window.twttr.widgets.load() }'}
              </Script>
            </MediaWrapper>
          );
        }
        return elm;
      }
      case 'script': {
        return (
          <Script
            id={attrProps.id}
            src={attrProps.src}
            strategy="lazyOnload"
            async={!!attrProps.async}
            defer={!!attrProps.defer}
          >
            {children.length > 0 && (children[0] as Text).data}
          </Script>
        );
      }
      default:
        if (name in Themed) {
          // @ts-ignore
          const ThemedComponent = Themed[name];
          return (
            <ThemedComponent
              {...attrProps}
              style={parseStyleString(attribs.style)}
            >
              {parseChildren(children)}
            </ThemedComponent>
          );
        }
        return null;
    }
  },
};

const parseChildren = (children: Element['children']) =>
  domToReact(children, parseOption);

export const htmlToThemed = (html: string): ReturnType<typeof parse> =>
  parse(html, parseOption);

const parseDOMText = (dom: ReturnType<typeof htmlToDOM>): string =>
  dom
    .reduce((acc, current) => {
      if (['script', 'iframe'].includes((current as Element).name)) {
        return acc;
      }

      let newText = '';
      if ((current as Element).children) {
        newText = parseDOMText(
          (current as Element).children as ReturnType<typeof htmlToDOM>,
        );
      } else if (current.type === 'text') {
        newText = (current as Text).data;
      }

      return newText === '' ? acc : [...acc, newText];
    }, [] as string[])
    .join(' ');

export const htmlToTextContent = (html: string): string =>
  parseDOMText(htmlToDOM(html));
