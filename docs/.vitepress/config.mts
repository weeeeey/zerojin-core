import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'zerojin',
  description: '현대적인 웹 애플리케이션을 위한 React 훅과 컴포넌트 모음',
  base: '/zerojin-core/',
  lang: 'ko-KR',

  themeConfig: {
    nav: [
      { text: '가이드', link: '/guide/getting-started' },
      { text: 'API', link: '/api/hooks/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '소개',
          items: [
            { text: '시작하기', link: '/guide/getting-started' },
            { text: '설치', link: '/guide/installation' }
          ]
        }
      ],
      '/api/': [
        {
          text: '훅',
          items: [
            { text: '개요', link: '/api/hooks/' },
            { text: 'useDebounce', link: '/api/hooks/useDebounce' },
            { text: 'useThrottle', link: '/api/hooks/useThrottle' },
            { text: 'useLocalStorage', link: '/api/hooks/useLocalStorage' },
            { text: 'useSessionStorage', link: '/api/hooks/useSessionStorage' },
            { text: 'useBroadcastChannel', link: '/api/hooks/useBroadcastChannel' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/weeey/zerojin-core' }
    ],

    footer: {
      message: 'MIT 라이선스로 배포됩니다.',
      copyright: 'Copyright © 2024 weeey'
    }
  }
})
