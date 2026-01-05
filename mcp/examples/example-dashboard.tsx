/**
 * Example: Dashboard 2x2 Grid
 *
 * Generated using: apply-template
 * Template: dashboard-2x2
 * Components: UserStats, RevenueChart, ActivityLog, QuickActions
 *
 * This demonstrates a 2x2 dashboard grid layout:
 * - Top-left: User statistics
 * - Top-right: Revenue chart
 * - Bottom-left: Activity log
 * - Bottom-right: Quick actions
 */

"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';
import { UserStats } from './components/UserStats';
import { RevenueChart } from './components/RevenueChart';
import { ActivityLog } from './components/ActivityLog';
import { QuickActions } from './components/QuickActions';

export default function Dashboard() {
  return (
    <DndGridContainer width={1400} height={900}>
      <DndGridSplit direction="horizontal" ratio={0.5}>
        <DndGridSplit direction="vertical" ratio={0.5}>
          <DndGridItem>
            <UserStats />
          </DndGridItem>
          <DndGridItem>
            <RevenueChart />
          </DndGridItem>
        </DndGridSplit>
        <DndGridSplit direction="vertical" ratio={0.5}>
          <DndGridItem>
            <ActivityLog />
          </DndGridItem>
          <DndGridItem>
            <QuickActions />
          </DndGridItem>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}

/**
 * Performance Metrics:
 * - Items: 4
 * - Splits: 3
 * - Max Depth: 2
 * - Estimated Performance: Excellent
 *
 * Best Practices:
 * ✅ Equal ratios (0.5) for balanced grid
 * ✅ Symmetrical structure
 * ✅ Low complexity
 * ✅ Easy to rearrange via drag-and-drop
 *
 * Usage Tips:
 * - Perfect for admin dashboards
 * - Can easily expand to 2x3 or 3x3 by adding more splits
 * - Each widget is independently draggable
 */
