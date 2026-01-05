import { LayoutBuilder, L } from '../src/utils/layout-builder.js';
import { CodeGenerator } from '../src/utils/code-generator.js';
import { LayoutAnalyzer } from '../src/utils/layout-analyzer.js';

/**
 * Test the code generator with a simple IDE layout
 */

// Build an IDE layout
const ideLayout = new LayoutBuilder(1200, 800)
  .setRoot(
    L.v(
      0.2,
      L.item('Sidebar'),
      L.h(0.7, L.item('CodeEditor'), L.item('Terminal'))
    )
  )
  .build();

console.log('=== IDE Layout Tree ===');
console.log(JSON.stringify(ideLayout, null, 2));

// Analyze the layout
const metadata = LayoutAnalyzer.calculateMetadata(ideLayout);
console.log('\n=== Layout Metadata ===');
console.log(metadata);

// Generate code
const generator = new CodeGenerator({
  framework: 'nextjs-app',
  width: ideLayout.width,
  height: ideLayout.height,
});

const code = generator.generate(ideLayout);
console.log('\n=== Generated Code ===');
console.log(code);
