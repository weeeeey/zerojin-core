import { useState } from 'react';
import {
    DndGridContainer,
    DndGridItem,
    DndGridSplit,
    DndGridItemContent,
} from 'zerojin/components';

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
                        <DndGridItemContent>
                            <AA />
                        </DndGridItemContent>
                    </DndGridItem>
                    <DndGridSplit direction="horizontal" ratio={0.6}>
                        <DndGridItem>
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                </DndGridSplit>

                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridSplit direction="vertical" ratio={0.6}>
                        <DndGridItem>
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </DndGridItem>
                        <DndGridItem>
                            <DndGridItemContent>
                                <AA />
                            </DndGridItemContent>
                        </DndGridItem>
                    </DndGridSplit>
                    <DndGridItem>
                        <DndGridItemContent>
                            <AA />
                        </DndGridItemContent>
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
