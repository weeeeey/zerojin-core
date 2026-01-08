import { useState } from 'react';
import {
    DndGridContainer,
    DndGridItem,
    DndGridSplit,
    DndGridItemContent,
    ItemDrag,
} from 'zerojin/components';

function AA() {
    const [a, aa] = useState(0);

    return <div onClick={() => aa((v) => v + 1)}>{a} asd</div>;
}

export default function DndGrid() {
    return (
        <DndGridContainer width={1000} height={1000}>
            <DndGridSplit direction="horizontal" ratio={0.24}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem>
                        <ItemDrag className="bg-red-300">
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem>
                            <ItemDrag>
                                <DndGridItemContent>
                                    <AA />
                                </DndGridItemContent>
                            </ItemDrag>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemDrag>
                                <DndGridItemContent>
                                    <AA />
                                </DndGridItemContent>
                            </ItemDrag>
                        </DndGridItem>
                    </DndGridSplit>
                </DndGridSplit>

                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem>
                            <ItemDrag>
                                <DndGridItemContent>
                                    <AA />
                                </DndGridItemContent>
                            </ItemDrag>
                        </DndGridItem>
                        <DndGridItem>
                            <ItemDrag>
                                <DndGridItemContent>
                                    <AA />
                                </DndGridItemContent>
                            </ItemDrag>
                        </DndGridItem>
                    </DndGridSplit>
                    <DndGridItem>
                        <ItemDrag>
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
