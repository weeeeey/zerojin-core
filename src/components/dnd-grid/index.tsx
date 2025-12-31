'use client';

import { DndGridSplit } from './split';
import { DndGridItem } from './item';
import { DndGridContainer } from './container';

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.24}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem />
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem />
                        <DndGridItem />
                    </DndGridSplit>
                </DndGridSplit>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem />
                        <DndGridItem />
                    </DndGridSplit>
                    <DndGridItem />
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
