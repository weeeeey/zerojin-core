'use client';

import { memo } from 'react';

const DndGridItemContent = memo(
    ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div className={className}>{children}</div>;
    }
);

DndGridItemContent.displayName = 'DndGridItemContent';
export default DndGridItemContent;
