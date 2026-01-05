import { ASTParser } from '../src/utils/ast-parser.js';
import { Validator } from '../src/utils/validator.js';

/**
 * Test AST parser and validator
 */

const sampleCode = `
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Layout() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        <DndGridItem>
          <Sidebar />
        </DndGridItem>
        <DndGridSplit direction="horizontal" ratio={0.7}>
          <DndGridItem>
            <CodeEditor />
          </DndGridItem>
          <DndGridItem>
            <Terminal />
          </DndGridItem>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}
`;

console.log('=== Testing AST Parser ===\n');

// Parse the code
const parser = new ASTParser();
const layout = parser.parse(sampleCode);

if (layout) {
  console.log('✅ Successfully parsed layout tree:');
  console.log(JSON.stringify(layout, null, 2));
} else {
  console.log('❌ Failed to parse layout');
}

console.log('\n=== Testing Validator ===\n');

// Validate the code
const validator = new Validator();
const codeValidation = validator.validateCode(sampleCode, false);

console.log('Code Validation:');
console.log(`Valid: ${codeValidation.valid}`);
console.log(`Errors: ${codeValidation.errors.length}`);
console.log(`Warnings: ${codeValidation.warnings.length}`);

if (codeValidation.errors.length > 0) {
  console.log('\nErrors:');
  codeValidation.errors.forEach((err, i) => {
    console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
    if (err.fix) console.log(`     Fix: ${err.fix}`);
  });
}

if (codeValidation.warnings.length > 0) {
  console.log('\nWarnings:');
  codeValidation.warnings.forEach((warn, i) => {
    console.log(`  ${i + 1}. ${warn.message}`);
    if (warn.suggestion) console.log(`     Suggestion: ${warn.suggestion}`);
  });
}

// Validate the parsed layout tree
if (layout) {
  console.log('\n=== Validating Layout Tree ===\n');
  const treeValidation = validator.validate(layout, true);

  console.log(`Valid: ${treeValidation.valid}`);
  console.log(`Errors: ${treeValidation.errors.length}`);
  console.log(`Warnings: ${treeValidation.warnings.length}`);
  console.log(`Suggestions: ${treeValidation.suggestions.length}`);

  if (treeValidation.warnings.length > 0) {
    console.log('\nWarnings:');
    treeValidation.warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.message}`);
    });
  }

  if (treeValidation.suggestions.length > 0) {
    console.log('\nSuggestions:');
    treeValidation.suggestions.forEach((sugg, i) => {
      console.log(`  ${i + 1}. ${sugg}`);
    });
  }
}

// Test with invalid code
console.log('\n=== Testing Invalid Code ===\n');

const invalidCode = `
<DndGridContainer width={1200} height={800}>
  <DndGridSplit direction="vertical" ratio={1.5}>
    <DndGridItem>
      <ComponentA />
    </DndGridItem>
  </DndGridSplit>
</DndGridContainer>
`;

const invalidValidation = validator.validateCode(invalidCode, false);
console.log(`Valid: ${invalidValidation.valid}`);
console.log(`Errors: ${invalidValidation.errors.length}`);

if (invalidValidation.errors.length > 0) {
  console.log('\nErrors found:');
  invalidValidation.errors.forEach((err, i) => {
    console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
  });
}
