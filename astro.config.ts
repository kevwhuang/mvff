import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import robots from 'astro-robots-txt';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
    adapter: netlify(),
    build: {
        format: 'file',
    },
    devToolbar: {
        enabled: false,
    },
    fonts: [
        {
            cssVariable: '--font-bebas-neue',
            display: 'block',
            name: 'Bebas Neue',
            provider: fontProviders.fontsource(),
            styles: ['normal'],
            subsets: ['latin'],
            weights: [400],
        },
        {
            cssVariable: '--font-instrument-serif',
            display: 'block',
            fallbacks: ['Georgia', 'serif'],
            name: 'Instrument Serif',
            provider: fontProviders.fontsource(),
            styles: ['normal', 'italic'],
            subsets: ['latin'],
            weights: [400],
        },
        {
            cssVariable: '--font-jetbrains-mono',
            display: 'block',
            fallbacks: ['Courier New', 'monospace'],
            name: 'JetBrains Mono',
            provider: fontProviders.fontsource(),
            styles: ['normal'],
            subsets: ['latin'],
            weights: [400, 600],
        },
    ],
    integrations: [
        react(),
        robots(),
        sitemap({ lastmod: new Date() }),
    ],
    site: 'https://atxmusicvideofilmfestival.com',
    trailingSlash: 'never',
    vite: {
        plugins: [tailwind()],
    },
});
