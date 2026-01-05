/**
 * Example: Complex Editor Layout
 *
 * Generated using: generate-layout
 * Description: Complex IDE with multiple nested panels
 * Components: Navigation, FileTree, Editor, Preview, Console, Terminal, Properties
 *
 * This demonstrates a complex editor layout with:
 * - Top navigation bar (8%)
 * - Left sidebar (15%): File tree
 * - Center (50%): Editor with preview (60/40 split)
 * - Right sidebar (15%): Properties panel
 * - Bottom panel (12%): Console and terminal (50/50 split)
 */

"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';
import { Navigation } from './components/Navigation';
import { FileTree } from './components/FileTree';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Console } from './components/Console';
import { Terminal } from './components/Terminal';
import { Properties } from './components/Properties';

export default function ComplexEditorLayout() {
  return (
    <DndGridContainer width={1920} height={1080}>
      {/* Top: Navigation */}
      <DndGridSplit direction="horizontal" ratio={0.08}>
        <DndGridItem>
          <Navigation />
        </DndGridItem>

        {/* Main content area */}
        <DndGridSplit direction="vertical" ratio={0.15}>
          {/* Left: File tree */}
          <DndGridItem>
            <FileTree />
          </DndGridItem>

          {/* Center + Right + Bottom */}
          <DndGridSplit direction="vertical" ratio={0.77}>
            {/* Center + Right */}
            <DndGridSplit direction="horizontal" ratio={0.88}>
              {/* Center: Editor + Preview */}
              <DndGridSplit direction="vertical" ratio={0.6}>
                <DndGridItem>
                  <Editor />
                </DndGridItem>
                <DndGridItem>
                  <Preview />
                </DndGridItem>
              </DndGridSplit>

              {/* Bottom: Console + Terminal */}
              <DndGridSplit direction="vertical" ratio={0.5}>
                <DndGridItem>
                  <Console />
                </DndGridItem>
                <DndGridItem>
                  <Terminal />
                </DndGridItem>
              </DndGridSplit>
            </DndGridSplit>

            {/* Right: Properties */}
            <DndGridItem>
              <Properties />
            </DndGridItem>
          </DndGridSplit>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}

/**
 * Performance Metrics:
 * - Items: 7
 * - Splits: 6
 * - Max Depth: 4
 * - Estimated Performance: Good
 *
 * Complexity Analysis:
 * ⚠️ Approaching recommended depth limit (4 levels)
 * ✅ Item count well within limits (< 20)
 * ⚠️ Complex nesting - consider simplifying if adding more panels
 *
 * Refactoring Opportunities:
 * - Consider extracting bottom panel into separate component
 * - Could use composition for editor+preview section
 * - May benefit from lazy loading for heavy components
 *
 * Best Practices Followed:
 * ✅ "use client" directive
 * ✅ Descriptive component names
 * ✅ Logical grouping of related panels
 * ✅ Ratios within usable ranges
 *
 * Usage Notes:
 * - This is near the upper complexity limit
 * - Adding more panels may impact performance
 * - Consider user feedback on panel sizes
 * - Test drag-and-drop performance with actual data
 */
