'use client';

import { DndGridSplit } from './split';
import { DndGridItem } from './item';
import { DndGridContainer } from './container';

import ItemContent from './item-content';
import { useState } from 'react';

function AA() {
    const [a, aa] = useState(0);

    return <div onClick={() => aa((v) => v + 1)}>{a}</div>;
}

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.24}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem>
                        <ItemContent id={1212}>
                            <AA />
                        </ItemContent>
                    </DndGridItem>
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem>
                            <ItemContent id={12121}>
                                <AA />
                            </ItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemContent id={121211}>
                                <AA />
                            </ItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                </DndGridSplit>

                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem>
                            <ItemContent id={121211}>
                                <AA />
                            </ItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemContent id={1212112}>
                                <AA />
                            </ItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                    <DndGridItem>
                        <ItemContent id={121}>
                            <AA />
                        </ItemContent>
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
