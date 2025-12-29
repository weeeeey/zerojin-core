'use client';

import React, {
    Children,
    JSXElementConstructor,
    useEffect,
    useLayoutEffect,
} from 'react';

export default function DndGrid() {
    return (
        <DndGridContainer>
            <DndGridSplit direction="horizontal" ratio={0.5}>
                <DndGridSplit direction="vertical" ratio={0.6}>
                    <DndGridItem />
                    <DndGridItem />
                </DndGridSplit>
                <DndGridItem />
            </DndGridSplit>
        </DndGridContainer>
    );
}

function DndGridContainer({ children }: { children: React.ReactNode }) {
    // children의 props를 조작하여 새로운 props 주입
    // const injectPropsToChildren = (
    //     node: React.ReactNode,
    //     parentId = 'root'
    // ): React.ReactNode => {
    //     return React.Children.map(node, (child, index) => {
    //         if (React.isValidElement(child)) {
    //             // DndGridSplit 컴포넌트인 경우
    //             if (child.type === DndGridSplit) {
    //                 const props = child.props as DndGridSplitProps;
    //                 const nodeId = `${parentId}-${index}`;

    //                 console.log(`Injecting props to ${nodeId}:`, {
    //                     direction: props.direction,
    //                     ratio: props.ratio,
    //                 });

    //                 // 새로운 props를 주입하여 복제
    //                 return React.cloneElement(child, {
    //                     ...props,
    //                     // 여기에 새로운 props 추가 가능
    //                     id: nodeId,
    //                     onResize: (newRatio: number) => {
    //                         console.log(`${nodeId} resized to ${newRatio}`);
    //                     },
    //                     // children도 재귀적으로 처리
    //                     children: injectPropsToChildren(props.children, nodeId),
    //                 } as any);
    //             } else {
    //                 // 다른 컴포넌트도 재귀 처리
    //                 const childProps = child.props as {
    //                     children?: React.ReactNode;
    //                 };
    //                 if (childProps.children) {
    //                     // return React.cloneElement(child, {
    //                     //     ...child.props,
    //                     //     children: injectPropsToChildren(childProps.children, parentId),
    //                     // } as any);
    //                 }
    //             }
    //         }
    //         return child;
    //     });
    // };

    // const enhancedChildren = injectPropsToChildren(children);

    useLayoutEffect(() => {
        const firstChild = Children.toArray(children)[0];
        if (React.isValidElement(firstChild)) {
            const a = firstChild.type as JSXElementConstructor<any>;
            console.log(a.name);
        }
    }, []);
    return <div>{children}</div>;
}

function DndGridItem() {
    return <div>item</div>;
}

interface DndGridSplitProps {
    children: [React.ReactNode, React.ReactNode];
    direction: 'horizontal' | 'vertical';
    /**
     * Split ratio between 0 and 1
     * @example 0.5 for 50/50 split, 0.3 for 30/70 split
     */
    ratio: number;
}

function DndGridSplit({ children, direction, ratio }: DndGridSplitProps) {
    if (ratio < 0 || ratio > 1) {
        throw new Error(`ratio must be between 0 and 1, got ${ratio}`);
    }

    const [primary, secondary] = React.Children.toArray(children);

    return (
        <div>
            <div>{primary}</div>
            <div>{secondary}</div>
        </div>
    );
}

export { DndGridContainer, DndGridItem, DndGridSplit };
