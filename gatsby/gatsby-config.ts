import 'gatsby-source-contentful';

// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { GatsbyConfig } from 'gatsby';

dotenv.config();

/**
 * Contentful config
 * https://www.gatsbyjs.com/plugins/gatsby-source-contentful/
 */
type ContentfulConfig = {
  spaceId: string;
  accessToken: string;
  host?: string;
};

const contentfulConfig: ContentfulConfig = (() => {
  const config: ContentfulConfig = {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
  };
  if (
    process.env.CONTENTFUL_HOST &&
    process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
  ) {
    config.host = process.env.CONTENTFUL_HOST;
    config.accessToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
  }

  if (!config.spaceId || !config.accessToken) {
    throw new Error(
      'Contentful spaceId and the access token need to be provided.',
    );
  }

  return config;
})();

export default (): GatsbyConfig => {
  return {
    siteMetadata: { title: 'kamatte syndrome' },
    plugins: [
      'gatsby-plugin-theme-ui',
      {
        resolve: `gatsby-plugin-alias-imports`,
        options: {
          alias: {
            '@': 'src',
          },
          extensions: ['js'],
        },
      },
      {
        resolve: 'gatsby-source-contentful',
        options: contentfulConfig,
      },
      'gatsby-plugin-image',
      'gatsby-plugin-react-helmet',
      'gatsby-plugin-sitemap',
      {
        resolve: 'gatsby-plugin-manifest',
        options: {
          icon: 'src/images/icon.png',
        },
      },
      'gatsby-plugin-sharp',
      'gatsby-transformer-sharp',
      {
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'images',
          path: './src/images/',
        },
        // @ts-ignore
        __key: 'images',
      },
      {
        resolve: `gatsby-plugin-typegen`,
        options: {
          emitSchema: {
            'src/__generated__/gatsby-introspection.json': true,
          },
          emitPluginDocuments: {
            'src/__generated__/gatsby-plugin-documents.graphql': true,
          },
        },
      },
    ],
  };
};
