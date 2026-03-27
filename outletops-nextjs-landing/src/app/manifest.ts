import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OutletOps - POS, Inventory & HR for Restaurants & Retail',
    short_name: 'OutletOps',
    description: 'Complete SaaS platform for restaurants and retail outlets. Manage POS billing, inventory, staff attendance, tasks/SOP, salary, and multi-outlet analytics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5838ff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
