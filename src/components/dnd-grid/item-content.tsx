import { memo } from 'react';

const DndGridItemContent = memo(
    ({ children, id }: { children: React.ReactNode; id: number }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div key={`content-${id}`}>{children}</div>;
    }
);

DndGridItemContent.displayName = 'DndGridItemContent';
export default DndGridItemContent;
