'use client';

import { useEffect, useState } from 'react';

export function useIsMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (mounted === true) return;
        setMounted(true);
    }, []);
    return mounted;
}
