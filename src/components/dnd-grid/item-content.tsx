import { memo } from 'react';

const DndItemContent = memo(
    ({ children, id }: { children: React.ReactNode; id: number }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div key={`content-${id}`}>{children}</div>;
    }
);

DndItemContent.displayName = 'DndItemContent';
export default DndItemContent;
