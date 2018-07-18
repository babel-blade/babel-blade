/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/docusaurus.svg'.
    image: '/img/blade.svg',
    infoLink: 'https://twitter.com/swyx',
    pinned: true,
  },
];

const siteConfig = {
  title: 'babel-blade docs' /* title for your website */,
  tagline: 'Solving the Double Declaration problem in GraphQL',
  url: 'https://babel-blade.netlify.com/' /* your website url */,
  baseUrl: '/' /* base url for your project */,
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'babel-blade',
  organizationName: 'sw-yx',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: 'index', label: 'Docs'},
    {doc: 'graphql-spec', label: 'API'},
    {page: 'help', label: 'Help'},
    { href: 'https://github.com/sw-yx/babel-blade', label: 'GitHub', external: true },
    { href: 'https://github.com/sw-yx/babel-blade/projects/1', label: 'Roadmap', external: true },
    {blog: true, label: 'Blog'},
    // { search: true }, // probably not needed
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/blade.svg',
  footerIcon: 'img/blade.svg',
  favicon: 'img/favicon/favicon.ico',

  /* colors for website */
  colors: {
    primaryColor: '#2E8555',
    secondaryColor: '#205C3B',
  },

  // https://docusaurus.io/docs/en/search
  algolia: {
    apiKey: 'my-api-key',
    indexName: 'my-index-name',
    algoliaOptions: {} // Optional, if provided by Algolia
  },

  /* custom fonts for website */
  /*fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },*/

  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'MIT License. Maintained by @swyx',
    //  Copyright © ' +
    // new Date().getFullYear() +
    // ' Your Name or Your Company Name',

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    // theme: 'default',
    theme: 'darcula',
  },

  // Add custom scripts here that would be placed in <script> tags
  scripts: ['https://buttons.github.io/buttons.js'],

  /* On page navigation for the current documentation page */
  onPageNav: 'separate',

  /* Open Graph and Twitter card images */
  ogImage: 'img/docusaurus.png',
  twitterImage: 'img/docusaurus.png',

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
