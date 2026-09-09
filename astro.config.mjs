import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://alpac-organization.github.io/ERP.Core.Docs.Api/',
  base: '/ERP.Core.Docs.Api/',
  integrations: [
    starlight({
      title: 'ERP Grupo Vassalli · API',
      description: 'Documentación de los endpoints del backend ERP.Core.Manager.Api',
      favicon: '/favicon.svg',
      editLink: {
        baseUrl: 'https://github.com/alpac-organization/ERP.Core.Docs.Api/edit/configuracion-documentacion/',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/alpac-organization/ERP.Core.Docs.Api',
        },
      ],
      sidebar: [
        {
          label: '📘 Guías',
          autogenerate: { directory: 'guides' },
        },
        {
          label: '🔌 API',
          collapsed: false,
          items: [
            {
              label: 'Vista general',
              items: [
                {
                  label: 'Contrato y convenciones',
                  slug: 'api/overview',
                },
              ],
            },
            {
              label: 'ERP.Core.Manager.Api',
              autogenerate: { directory: 'api/administracion', collapsed: false },
            },
            {
              label: 'ERP.Core.Warehouse.Api',
              autogenerate: { directory: 'api/almacen', collapsed: false },
            },
          ],
        },
      ],
      customCss: ['./src/styles/theme.css'],
    }),
  ],
  trailingSlash: 'always',
});
