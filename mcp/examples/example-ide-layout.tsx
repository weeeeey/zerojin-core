/**
 * Example: IDE Layout
 *
 * Generated using: apply-template
 * Template: ide-layout
 * Components: FileExplorer, CodeEditor, Terminal
 *
 * This demonstrates a typical 3-panel IDE layout:
 * - Left sidebar (20%): File explorer
 * - Right top (56%): Code editor
 * - Right bottom (24%): Terminal
 */

"use client";

import { DndGridContainer, DndGridSplit, DndGridItem, DndGridItemContent, ItemDrag } from 'zerojin/components';
import { FileExplorer } from './components/FileExplorer';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';

export default function IDELayout() {
  return (
    <DndGridContainer width={1600} height={900}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        <DndGridItem>
          <ItemDrag>
            <DndGridItemContent>
              <FileExplorer />
            </DndGridItemContent>
          </ItemDrag>
        </DndGridItem>
        <DndGridSplit direction="horizontal" ratio={0.7}>
          <DndGridItem>
            <ItemDrag>
              <DndGridItemContent>
                <CodeEditor />
              </DndGridItemContent>
            </ItemDrag>
          </DndGridItem>
          <DndGridItem>
            <ItemDrag>
              <DndGridItemContent>
                <Terminal />
              </DndGridItemContent>
            </ItemDrag>
          </DndGridItem>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}

/**
 * Performance Metrics:
 * - Items: 3
 * - Splits: 2
 * - Max Depth: 2
 * - Estimated Performance: Excellent
 *
 * Best Practices:
 * ✅ "use client" directive for Next.js App Router
 * ✅ ItemDrag 래퍼 사용 (DndGrid v2.0+ 필수)
 * ✅ Ratios within recommended range (0.2-0.8)
 * ✅ Low item count (< 20)
 * ✅ Shallow nesting (< 4 levels)
 */
