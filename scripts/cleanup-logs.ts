/**
 * Script để tự động xóa debug console.logs khỏi production code
 * Giữ lại console.error và console.warn
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIRS_TO_CLEAN = [
  path.join(ROOT_DIR, 'admin/src'),
  path.join(ROOT_DIR, 'landing/src'),
];

// Patterns to remove (debug logs only)
const DEBUG_PATTERNS = [
  /^\s*console\.log\([^)]*\);\s*$/gm,
  /^\s*console\.log\(/gm,
];

// Patterns to keep (error handling)
const KEEP_PATTERNS = [
  /console\.error/,
  /console\.warn/,
  /console\.info/,
  /console\.table/,
];

let totalRemoved = 0;
let filesModified = 0;

function shouldKeepLine(line: string): boolean {
  return KEEP_PATTERNS.some(pattern => pattern.test(line));
}

function cleanFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const cleanedLines: string[] = [];
  let removed = 0;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Keep error/warn logs
    if (shouldKeepLine(line)) {
      cleanedLines.push(line);
      i++;
      continue;
    }
    
    // Check for debug console.log
    if (/^\s*console\.log\(/.test(line)) {
      // Single line console.log
      if (line.includes(');')) {
        removed++;
        totalRemoved++;
        i++;
        continue;
      }
      
      // Multi-line console.log
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(');')) {
        j++;
      }
      removed += (j - i + 1);
      totalRemoved += (j - i + 1);
      i = j + 1;
      continue;
    }
    
    cleanedLines.push(line);
    i++;
  }
  
  if (removed > 0) {
    const newContent = cleanedLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ ${path.relative(ROOT_DIR, filePath)}: Removed ${removed} debug log(s)`);
    return true;
  }
  
  return false;
}

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filePath);
    }
  }
}

console.log('🧹 Starting debug log cleanup...\n');

for (const dir of DIRS_TO_CLEAN) {
  console.log(`📁 Cleaning directory: ${path.relative(ROOT_DIR, dir)}`);
  
  walkDir(dir, (filePath) => {
    if (cleanFile(filePath)) {
      filesModified++;
    }
  });
  
  console.log('');
}

console.log('═══════════════════════════════════════');
console.log(`✨ Cleanup complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Debug logs removed: ${totalRemoved}`);
console.log('═══════════════════════════════════════');

if (filesModified === 0) {
  console.log('✅ No debug logs found - code is clean!');
} else {
  console.log('⚠️  Please review changes and run tests before committing.');
}



