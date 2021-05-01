import dotenv from 'dotenv';
import { GatsbyConfig } from 'gatsby';

dotenv.config();

export default (): GatsbyConfig => {
  return {
    siteMetadata: { title: 'kamatte syndrome' },
    plugins: [
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
        resolve: 'gatsby-source-microcms',
        options: {
          apiKey: process.env.MICROCMS_API_KEY,
          serviceId: process.env.MICROCMS_SERVICE_ID,
          apis: [
            {
              endpoint: 'blog',
            },
            {
              endpoint: 'history',
            },
            {
              endpoint: 'skill',
            },
            {
              endpoint: 'portfolio',
            },
            {
              endpoint: 'illustration',
            },
            {
              endpoint: 'culture',
            },
          ],
        },
      },
      {
        resolve: 'gatsby-plugin-web-font-loader',
        options: {
          google: {
            families: ['Josefin Sans:700'],
            timeout: 2000,
          },
        },
      },
      {
        resolve: 'gatsby-plugin-web-font-loader',
        options: {
          google: {
            families: ['Caveat:700'],
            text: 'plzkamte!',
            timeout: 2000,
          },
        },
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
