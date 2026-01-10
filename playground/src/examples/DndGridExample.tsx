import { useState } from 'react';
import {
    DndGridContainer,
    DndGridItem,
    DndGridItemContent,
    DndGridSplit,
    ItemDrag,
} from 'zerojin';

export const UserStats = () => {
    const [a, aa] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-blue-100 p-4 border rounded">
            <h2 className="text-xl font-bold">리렌더링 체크</h2>
            <div className="flex gap-x-4">
                <button
                    onClick={() => {
                        aa((v) => v + 1);
                    }}
                    className="rounded-md bg-blue-400"
                >
                    증가 버튼
                </button>
                <div className="text-4xl ">{a}</div>
            </div>
        </div>
    );
};

export const SalesChart = () => (
    <div className="flex flex-col items-center justify-center h-full bg-green-100 p-4 border rounded">
        <h2 className="text-xl font-bold">Sales Chart</h2>
        <div className="w-full h-32 bg-green-200 mt-4 flex items-end justify-around pb-2">
            <div className="w-4 h-10 bg-green-500"></div>
            <div className="w-4 h-20 bg-green-500"></div>
            <div className="w-4 h-16 bg-green-500"></div>
            <div className="w-4 h-24 bg-green-500"></div>
        </div>
    </div>
);

export const ActivityFeed = () => (
    <div className="flex flex-col h-full bg-yellow-100 p-4 border rounded overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Activity Feed</h2>
        <ul className="space-y-2">
            <li className="text-sm bg-white p-2 rounded shadow-sm">
                User A logged in
            </li>
            <li className="text-sm bg-white p-2 rounded shadow-sm">
                New order #123
            </li>
            <li className="text-sm bg-white p-2 rounded shadow-sm">
                Server updated
            </li>
        </ul>
    </div>
);

export const RecentOrders = () => (
    <div className="flex flex-col h-full bg-purple-100 p-4 border rounded overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Recent Orders</h2>
        <table className="w-full text-sm text-left">
            <thead>
                <tr className="border-b">
                    <th className="py-1">ID</th>
                    <th>Product</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b">
                    <td className="py-1">#001</td>
                    <td>Widget A</td>
                    <td>$50</td>
                </tr>
                <tr>
                    <td className="py-1">#002</td>
                    <td>Widget B</td>
                    <td>$75</td>
                </tr>
            </tbody>
        </table>
    </div>
);

export default function App() {
    return (
        <DndGridContainer width={600} height={600}>
            <DndGridSplit direction="horizontal" ratio={0.5}>
                <DndGridSplit direction="vertical" ratio={0.5}>
                    <DndGridItem>
                        <ItemDrag className="h-full">
                            <DndGridItemContent className="h-full">
                                <UserStats />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                    <DndGridItem>
                        <ItemDrag className="h-full">
                            <DndGridItemContent className="h-full">
                                <SalesChart />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                </DndGridSplit>
                <DndGridSplit direction="vertical" ratio={0.5}>
                    <DndGridItem>
                        <ItemDrag className="h-full">
                            <DndGridItemContent className="h-full">
                                <ActivityFeed />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                    <DndGridItem>
                        <ItemDrag className="h-full">
                            <DndGridItemContent className="h-full">
                                <RecentOrders />
                            </DndGridItemContent>
                        </ItemDrag>
                    </DndGridItem>
                </DndGridSplit>
            </DndGridSplit>
        </DndGridContainer>
    );
}
