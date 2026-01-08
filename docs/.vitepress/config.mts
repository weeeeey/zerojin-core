import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'zerojin',
    description: '웹 애플리케이션을 위한 React 훅과 컴포넌트 모음',
    base: '/zerojin-core/',
    lang: 'ko-KR',

    themeConfig: {
        nav: [
            { text: '가이드', link: '/guide/getting-started' },
            { text: 'API', link: '/api/components/' },
        ],

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
                        text: '컴포넌트',
                        items: [
                            { text: '개요', link: '/api/components/' },
                            {
                                text: 'dnd-grid',
                                link: '/api/components/dnd-grid',
                            },
                        ],
                    },
                    {
                        text: '훅',
                        items: [
                            { text: '개요', link: '/api/hooks/' },
                            {
                                text: 'useThrottle',
                                link: '/api/hooks/useThrottle',
                            },
                            {
                                text: 'useDebounce',
                                link: '/api/hooks/useDebounce',
                            },
                            {
                                text: 'useDebouncedCallback',
                                link: '/api/hooks/useDebouncedCallback',
                            },
                            {
                                text: 'useInputDebounce',
                                link: '/api/hooks/useInputDebounce',
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

        outline: {
            level: [2, 3],
            label: '목차',
        },

        docFooter: {
            prev: '이전',
            next: '다음',
        },

        darkModeSwitchLabel: '다크 모드',
        sidebarMenuLabel: '메뉴',
        returnToTopLabel: '맨 위로',
    },
});
