import type { FrameworkAdapter } from './types';

/**
 * Next.js App Router 어댑터 생성 시도
 * @returns FrameworkAdapter 또는 null (감지 실패 시)
 */
function createNextAppAdapter(): FrameworkAdapter | null {
    try {
        // 동적 import로 Next.js App Router 모듈 감지
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const navigation = require('next/navigation');
        const { useSearchParams, useRouter, usePathname } = navigation;

        return {
            framework: 'nextjs-app',
            getSearchParams: () => {
                const searchParams = useSearchParams();
                return new URLSearchParams(searchParams.toString());
            },
            updateUrl: (params, mode) => {
                const router = useRouter();
                const pathname = usePathname();
                const url = `${pathname}?${params.toString()}`;

                if (mode === 'push') {
                    router.push(url);
                } else {
                    router.replace(url);
                }
            },
            subscribe: () => {
                // Next.js App Router는 React의 reactivity로 자동 처리
                return () => {};
            },
        };
    } catch (e) {
        return null;
    }
}

/**
 * Next.js Pages Router 어댑터 생성 시도
 * @returns FrameworkAdapter 또는 null (감지 실패 시)
 */
function createNextPagesAdapter(): FrameworkAdapter | null {
    try {
        // 동적 import로 Next.js Pages Router 모듈 감지
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nextRouter = require('next/router');
        const { useRouter } = nextRouter;

        return {
            framework: 'nextjs-pages',
            getSearchParams: () => {
                const router = useRouter();
                // asPath에서 query string 추출
                const queryString = router.asPath.split('?')[1] || '';
                return new URLSearchParams(queryString);
            },
            updateUrl: (params, mode) => {
                const router = useRouter();
                const url = `${router.pathname}?${params.toString()}`;

                if (mode === 'push') {
                    router.push(url, undefined, { shallow: true });
                } else {
                    router.replace(url, undefined, { shallow: true });
                }
            },
            subscribe: (callback) => {
                const router = useRouter();
                router.events.on('routeChangeComplete', callback);
                return () => router.events.off('routeChangeComplete', callback);
            },
        };
    } catch (e) {
        return null;
    }
}

/**
 * React Router v6 어댑터 생성 시도
 * @returns FrameworkAdapter 또는 null (감지 실패 시)
 */
function createReactRouterAdapter(): FrameworkAdapter | null {
    try {
        // 동적 import로 React Router 모듈 감지
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const reactRouterDom = require('react-router-dom');
        const { useSearchParams, useNavigate } = reactRouterDom;

        return {
            framework: 'react-router',
            getSearchParams: () => {
                const [searchParams] = useSearchParams();
                return new URLSearchParams(searchParams);
            },
            updateUrl: (params, mode) => {
                const navigate = useNavigate();
                navigate(`?${params.toString()}`, { replace: mode === 'replace' });
            },
            subscribe: () => {
                // React Router는 hook의 reactivity로 자동 처리
                return () => {};
            },
        };
    } catch (e) {
        return null;
    }
}

/**
 * 네이티브 History API 어댑터 (폴백)
 * @returns FrameworkAdapter
 */
function createNativeAdapter(): FrameworkAdapter {
    return {
        framework: 'native',
        getSearchParams: () => {
            if (typeof window === 'undefined') {
                return new URLSearchParams();
            }
            return new URLSearchParams(window.location.search);
        },
        updateUrl: (params, mode) => {
            if (typeof window === 'undefined') {
                return;
            }

            const url = `${window.location.pathname}?${params.toString()}`;

            if (mode === 'push') {
                window.history.pushState({}, '', url);
            } else {
                window.history.replaceState({}, '', url);
            }
        },
        subscribe: (callback) => {
            if (typeof window === 'undefined') {
                return () => {};
            }

            // popstate 이벤트 감지 (뒤로/앞으로 버튼)
            window.addEventListener('popstate', callback);
            return () => window.removeEventListener('popstate', callback);
        },
    };
}

/**
 * 프레임워크 감지 및 어댑터 생성
 * 감지 순서: Next.js App Router → Next.js Pages Router → React Router → Native
 * @returns FrameworkAdapter
 */
export function createFrameworkAdapter(): FrameworkAdapter {
    return (
        createNextAppAdapter() ||
        createNextPagesAdapter() ||
        createReactRouterAdapter() ||
        createNativeAdapter()
    );
}
