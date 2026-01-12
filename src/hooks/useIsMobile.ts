import { useMediaQuery } from './useMediaQuery';

export function useIsMobile(query = '(max-width: 767px)'): boolean {
    return useMediaQuery(query);
}
