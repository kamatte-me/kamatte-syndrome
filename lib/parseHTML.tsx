import { Themed } from '@theme-ui/mdx';
import { ElementType as DOMElementType } from 'domelementtype';
import type {
  DOMNode,
  Element,
  HTMLReactParserOptions,
  Text,
} from 'html-react-parser';
import parse, {
  attributesToProps,
  domToReact,
  htmlToDOM,
} from 'html-react-parser';
import NextImage from 'next/image';
import NextLink from 'next/link';
import type { ElementType } from 'react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Embed, Flex, Heading, Link } from 'theme-ui';

import { baseUrl } from '@/constants/site';

// eslint-disable-next-line react-refresh/only-export-components -- sometime fix
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
  src?: string;
  children?: string;
}

// eslint-disable-next-line react-refresh/only-export-components -- sometime fix
const SafeScript: React.FC<SafeScriptProps> = ({ children, src }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const script = document.createElement('script');
    if (src) {
      script.src = src;
    }
    script.async = true;
    if (children) {
      script.innerHTML = children;
    }
    ref.current.appendChild(script);

    return () => {
      if (!ref.current) {
        return;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- need cleanup
      ref.current.removeChild(script);
    };
  }, [children, ref, src]);

  return <div ref={ref} />;
};

const parseStyleString = (styleStr?: string | null): Record<string, string> => {
  if (!styleStr) {
    return {};
  }
  return styleStr.split(';').reduce((acc, style) => {
    const colonPosition = style.indexOf(':');

    if (colonPosition === -1) {
      return acc;
    }

    const camelCaseProperty = style
      .slice(0, Math.max(0, colonPosition))
      .trim()
      .replace(/^-ms-/, 'ms-')
      .replaceAll(/-./g, (c) => c.slice(1).toUpperCase());
    const value = style.slice(Math.max(0, colonPosition + 1)).trim();

    return value ? { ...acc, [camelCaseProperty]: value } : acc;
  }, {});
};

const parseOption: HTMLReactParserOptions = {
  replace: (domNode) => {
    const { name, attribs } = domNode as Element;
    const children = (domNode as Element).children as DOMNode[];

    const attrProps = attributesToProps(attribs);
    if (domNode.prev === null && domNode.parent === null) {
      attrProps.style = {
        marginTop: '0',
        ...attrProps.style,
      };
    }

    if (
      typeof attrProps.className === 'string' &&
      attrProps.className.startsWith('iframely-')
    ) {
      return domNode;
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- default case is handled
    switch (name as ElementType) {
      case 'h1': {
        return (
          <Heading {...attrProps} as="h2" variant="styles.h1">
            {parseChildren(children)}
          </Heading>
        );
      }
      case 'h2': {
        return (
          <Heading {...attrProps} as="h3" variant="styles.h2">
            {parseChildren(children)}
          </Heading>
        );
      }
      case 'h3': {
        return (
          <Heading {...attrProps} as="h4" variant="styles.h3">
            {parseChildren(children)}
          </Heading>
        );
      }
      case 'h4': {
        return (
          <Heading {...attrProps} as="h5" variant="styles.h4">
            {parseChildren(children)}
          </Heading>
        );
      }
      case 'h5': {
        return (
          <Heading {...attrProps} as="h6" variant="styles.h5">
            {parseChildren(children)}
          </Heading>
        );
      }
      case 'a': {
        if (
          attribs.href &&
          new RegExp(`^(/|${baseUrl})`).test(attribs.href) &&
          !attribs.target
        ) {
          return (
            <NextLink href={attribs.href.replace(baseUrl, '')}>
              {parseChildren(children)}
            </NextLink>
          );
        }
        return <Link {...attrProps}>{parseChildren(children)}</Link>;
      }
      case 'img': {
        if (!attribs.src) {
          return null;
        }

        return (
          <MediaWrapper>
            <NextImage
              alt={attribs.alt ?? attribs.src}
              height={360}
              src={attribs.src}
              width={480}
              style={{
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            />
          </MediaWrapper>
        );
      }
      case 'div': {
        if (children.some((child) => (child as Element).name === 'iframe')) {
          return <MediaWrapper>{parseChildren(children)}</MediaWrapper>;
        }
        return domNode;
      }
      case 'iframe': {
        const elm = <Embed {...attrProps} loading="lazy" />;
        if ((domNode.parent as Element | null)?.name === 'div') {
          return elm;
        }
        return <MediaWrapper>{elm}</MediaWrapper>;
      }
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
        if (attrProps.src === '//cdn.iframe.ly/embed.js') {
          attrProps.src += '?theme=light';
        }
        return (
          <SafeScript src={attrProps.src as string | undefined}>
            {children.length > 0 ? (children[0] as Text).data : ''}
          </SafeScript>
        );
      }
      default: {
        if (name in Themed) {
          // @ts-expect-error -- ThemeUIのせい
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ThemeUIのせい
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
        return domNode;
      }
    }
  },
};

const parseChildren = (
  children: Parameters<typeof domToReact>[0],
): ReturnType<typeof domToReact> => domToReact(children, parseOption);

export const htmlToThemed = (html: string): ReturnType<typeof domToReact> =>
  parse(html, parseOption);

const parseDOMText = (dom: ReturnType<typeof htmlToDOM>): string =>
  dom
    .reduce<string[]>((acc, current) => {
      if (['script', 'iframe'].includes((current as Element).name)) {
        return acc;
      }

      let newText = '';
      if ('children' in current) {
        newText = parseDOMText(
          current.children as ReturnType<typeof htmlToDOM>,
        );
      } else if (current.type === DOMElementType.Text) {
        newText = current.data;
      }

      return newText === '' ? acc : [...acc, newText];
    }, [])
    .join(' ');

export const htmlToTextContent = (html: string): string =>
  parseDOMText(htmlToDOM(html));
