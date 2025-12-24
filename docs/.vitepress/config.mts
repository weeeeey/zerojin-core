import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'zerojin',
    description: '웹 애플리케이션을 위한 React 훅과 컴포넌트 모음',
    base: '/zerojin-core/',
    lang: 'ko-KR',

    themeConfig: {
        sidebar: [
            {
                text: '가이드',
                items: [
                    {
                        text: '소개',
                        items: [
                            {
                                text: '시작하기',
                                link: '/guide/getting-started',
                            },
                            { text: '설치', link: '/guide/installation' },
                        ],
                    },
                ],
            },
            {
                text: 'API',
                items: [
                    {
                        text: '훅',
                        items: [
                            { text: '개요', link: '/api/hooks/' },
                            {
                                text: 'useDebouncedCallback',
                                link: '/api/hooks/useDebouncedCallback',
                            },
                            {
                                text: 'useInputDebounce',
                                link: '/api/hooks/useInputDebounce',
                            },
                            {
                                text: 'useThrottle',
                                link: '/api/hooks/useThrottle',
                            },
                            {
                                text: 'useLocalStorage',
                                link: '/api/hooks/useLocalStorage',
                            },
                            {
                                text: 'useSessionStorage',
                                link: '/api/hooks/useSessionStorage',
                            },
                            {
                                text: 'useBroadcastChannel',
                                link: '/api/hooks/useBroadcastChannel',
                            },
                        ],
                    },
                ],
            },
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/weeeeey/zerojin-core' },
        ],

        footer: {
            message: 'MIT 라이선스로 배포됩니다.',
            copyright: 'Copyright © 2025 weeeeey',
        },
    },
});
