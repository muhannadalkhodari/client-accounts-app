import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// ملاحظة: base يجب أن يطابق اسم مستودع GitHub الذي سيتم النشر عليه.
// مثال: إذا كان رابط المستودع github.com/username/client-accounts-app
// فيجب أن يبقى base كما هو أدناه "/client-accounts-app/".
// إذا اخترت اسماً مختلفاً للمستودع، غيّر القيمة هنا لتطابقه بالضبط.
export default defineConfig({
  base: '/client-accounts-app/',
  build: {
    outDir: 'docs',
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'حسابات العملاء',
        short_name: 'حسابات العملاء',
        description: 'إدارة حسابات العملاء المالية (قبض ودفع)',
        theme_color: '#0f1115',
        background_color: '#0f1115',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        lang: 'ar',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
