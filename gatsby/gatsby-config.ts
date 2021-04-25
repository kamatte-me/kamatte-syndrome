import { GatsbyConfig } from 'gatsby';

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
        options: {
          accessToken:
            '4136515a9706d0158d4da16e0ceb555d6395fee658b5925a19b417cddce7ba11',
          spaceId: 'ky376v5x3o44',
        },
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
      'gatsby-plugin-typegen',
    ],
  };
};
