import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
    plugins: [svelte()],
    resolve: {
        alias: {
            "@": new URL('./src', import.meta.url).pathname,
            "siyuan": new URL('./tests/__mocks__/siyuan.ts', import.meta.url).pathname,
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/vitest.setup.ts'],
        include: ['tests/**/*.test.ts'],
    },
})
