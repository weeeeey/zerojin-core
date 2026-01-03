import { memo } from 'react';

const ItemContent = memo(
    ({ children, id }: { children: React.ReactNode; id?: number }) => {
        // console.log('ItemContent rendered, id:', id);
        return <div key={`content-${id}`}>{children}</div>;
    },
    (prevProps, nextProps) => {
        // 비교 함수가 호출되는지 확인
        console.log('=== ItemContent memo compare ===');
        console.log('prev id:', prevProps.id, 'next id:', nextProps.id);
        console.log(
            'children same?',
            prevProps.children === nextProps.children
        );

        const shouldSkipRender =
            prevProps.id === nextProps.id &&
            prevProps.children === nextProps.children;

        console.log('shouldSkipRender:', shouldSkipRender);
        return shouldSkipRender;
    }
);

ItemContent.displayName = 'ItemContent';
export default ItemContent;
