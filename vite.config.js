import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey from 'vite-plugin-monkey'

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: '超星skills',
        namespace: 'https://mine.lcode.space/',
        match: [
          'https://*.chaoxing.com/*',
          'https://i.chaoxing.com/*',
          'https://*.xueyinonline.com/*',
          'https://*.xuexitong.com/*'
        ],
        grant: ['GM_getValue', 'GM_setValue'],
      },
    })
  ],
})