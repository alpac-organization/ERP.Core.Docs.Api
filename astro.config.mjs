import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://alpac-organization.github.io/erp-api-docs',
  integrations: [
    starlight({
      title: 'ERP Grupo Vassalli · API',
      description: 'Documentación de los endpoints del backend ERP.Core.Manager.Api',
      favicon: '/favicon.svg',
      editLink: {
        baseUrl: 'https://github.com/alpac-organization/erp-api-docs/edit/main/',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/alpac-organization/erp-api-docs',
        },
      ],
      sidebar: [
        {
          label: '📘 Guías',
          autogenerate: { directory: 'guides' },
        },
        {
          label: '🔌 API',
          autogenerate: { directory: 'api', collapsed: false },
        },
      ],
      customCss: ['./src/styles/theme.css'],
    }),
  ],
  trailingSlash: 'always',
});
