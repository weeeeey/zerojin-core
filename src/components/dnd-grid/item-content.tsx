'use client';

import { memo } from 'react';

const DndGridItemContent = memo(
    ({ children }: { children: React.ReactNode }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div>{children}</div>;
    }
);

DndGridItemContent.displayName = 'DndGridItemContent';
export default DndGridItemContent;
