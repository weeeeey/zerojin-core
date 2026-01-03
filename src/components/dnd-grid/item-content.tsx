import { memo } from 'react';

const ItemContent = memo(
    ({ children, id }: { children: React.ReactNode; id: number }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div key={`content-${id}`}>{children}</div>;
    }
);

ItemContent.displayName = 'ItemContent';
export default ItemContent;
