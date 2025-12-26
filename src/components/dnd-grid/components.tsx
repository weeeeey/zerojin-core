function DndGridContainer({
    item,
    split,
}: {
    split: React.ReactNode;
    item: React.ReactNode;
}) {
    return (
        <div>
            {item}
            {split}
        </div>
    );
}

function DndGridItem() {}
function DndGridSplit() {}

export { DndGridContainer, DndGridItem, DndGridSplit };
