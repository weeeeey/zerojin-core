'use client';

import { DndGridSplit } from './split';
import { DndGridItem } from './item';
import { DndGridContainer } from './container';
import { useState } from 'react';

function AA() {
    const [n, sn] = useState(0);
    return (
        <div
            className="bg-blue-500 text-white"
            onClick={() => sn((v) => v + 1)}
        >
            {' '}
            asdasd{n}
        </div>
    );
}

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.24}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem>
                        <AA />
                    </DndGridItem>
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem>
                            <AA />
                        </DndGridItem>
                        <DndGridItem>
                            <AA />
                        </DndGridItem>
                    </DndGridSplit>
                </DndGridSplit>

                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem>
                            <AA />
                        </DndGridItem>
                        <DndGridItem>
                            <AA />
                        </DndGridItem>
                    </DndGridSplit>
                    <DndGridItem>
                        <AA />
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
