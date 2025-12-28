'use client';

import React from 'react';

function DndGrid() {
    return (
        <DndGridContainer>
            <DndGridSplit>
                <DndGridSplit>
                    <DndGridItem />
                    <DndGridItem />
                </DndGridSplit>
                <DndGridItem />
            </DndGridSplit>
        </DndGridContainer>
    );
}

function DndGridContainer({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}

function DndGridItem() {
    return <div>item</div>;
}

function DndGridSplit({
    children,
    direction = 'horizontal', // 추가 옵션
}: {
    children: [React.ReactNode, React.ReactNode];
    direction?: 'horizontal' | 'vertical';
}) {
    const [primary, secondary] = React.Children.toArray(children);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: direction === 'horizontal' ? 'row' : 'column',
            }}
        >
            <div style={{ flex: 1 }}>{primary}</div>
            <div style={{ flex: 1 }}>{secondary}</div>
        </div>
    );
}

export { DndGrid, DndGridContainer, DndGridItem, DndGridSplit };
