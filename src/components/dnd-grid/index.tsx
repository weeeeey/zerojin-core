'use client';

import { DndGridSplit } from './split';
import { DndGridItem } from './item';
import { DndGridContainer } from './container';

import ItemDrag from './item-drag';
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
                        <ItemDrag />
                        <ItemContent>
                            <AA />
                        </ItemContent>
                    </DndGridItem>
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem>
                            <ItemDrag />
                            <ItemContent>
                                <AA />
                            </ItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemDrag />
                            <ItemContent>
                                <div>asd</div>
                            </ItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                </DndGridSplit>

                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem>
                            <ItemDrag />
                            <ItemContent>
                                <div>asd</div>
                            </ItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemDrag />
                            <ItemContent>
                                <div>asd</div>
                            </ItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                    <DndGridItem>
                        <ItemDrag />
                        <ItemContent>
                            <div>asd</div>
                        </ItemContent>
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
