/* eslint-disable @typescript-eslint/no-use-before-define, react/jsx-pascal-case, react/jsx-props-no-spreading */
import { Themed } from '@theme-ui/mdx';
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
import React, { ElementType, useEffect, useRef } from 'react';
import { Embed, Flex, Heading, Link } from 'theme-ui';

import { baseUrl } from '@/constants/site';

const MediaWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Flex sx={{ justifyContent: 'center', my: 3 }}>
    <Flex sx={{ flexDirection: 'column', width: '100%', maxWidth: '576px' }}>
      {children}
    </Flex>
  </Flex>
);

interface SafeScriptProps {
  src: string;
  children?: string;
}
const SafeScript: React.FC<SafeScriptProps> = ({ children, src }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref || !ref.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (children) {
      script.innerHTML = children;
    }
    ref.current.appendChild(script);

    return () => {
      if (!ref || !ref.current) {
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current.removeChild(script);
    };
  }, [children, ref, src]);

  return <div ref={ref} />;
};

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
      .substring(0, colonPosition)
      .trim()
      .replace(/^-ms-/, 'ms-')
      .replace(/-./g, c => c.substring(1).toUpperCase());
    const value = style.substring(colonPosition + 1).trim();

    return value ? { ...acc, [camelCaseProperty]: value } : acc;
  }, {});
};

export interface ParseReplaceOption {
  removeFirstChildMarginTop?: boolean;
}

const parseOption = (option?: ParseReplaceOption): HTMLReactParserOptions => ({
  replace: domNode => {
    const { name, attribs, children } = domNode as Element;
    const attrProps = attributesToProps(attribs);

    if (option && option.removeFirstChildMarginTop) {
      if (domNode.prev === null && domNode.parent === null) {
        attrProps.style = {
          marginTop: '0',
          ...attrProps.style,
        };
      }
    }

    switch (name as ElementType) {
      case 'h1':
        return (
          <Heading {...attrProps} variant="styles.h1" as="h2">
            {parseChildren(children)}
          </Heading>
        );
      case 'h2':
        return (
          <Heading {...attrProps} variant="styles.h2" as="h3">
            {parseChildren(children)}
          </Heading>
        );
      case 'h3':
        return (
          <Heading {...attrProps} variant="styles.h3" as="h4">
            {parseChildren(children)}
          </Heading>
        );
      case 'h4':
        return (
          <Heading {...attrProps} variant="styles.h4" as="h5">
            {parseChildren(children)}
          </Heading>
        );
      case 'h5':
        return (
          <Heading {...attrProps} variant="styles.h5" as="h6">
            {parseChildren(children)}
          </Heading>
        );
      case 'a':
        if (attribs.href.startsWith(baseUrl)) {
          return (
            <NextLink href={attribs.href.replace(baseUrl, '')}>
              <span sx={{ variant: 'styles.a' }}>
                {parseChildren(children)}
              </span>
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
              width={480}
              height={360}
              alt={attribs.alt}
              style={{
                maxWidth: '100%',
                objectFit: 'contain',
              }}
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
          return <MediaWrapper>{elm}</MediaWrapper>;
        }
        return elm;
      }
      case 'script': {
        return (
          <SafeScript src={attrProps.src}>
            {children.length > 0 ? (children[0] as Text).data : ''}
          </SafeScript>
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
});

const parseChildren = (children: Element['children']) =>
  domToReact(children, parseOption());

export const htmlToThemed = (
  html: string,
  option?: ParseReplaceOption,
): ReturnType<typeof parse> => parse(html, parseOption(option));

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
