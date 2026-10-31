import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#0b0b0f' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#0b0b0f' } },
  },
  images: ['public/logo.svg'],
})
