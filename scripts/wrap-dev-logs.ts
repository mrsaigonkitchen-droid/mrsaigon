/**
 * Script để wrap debug console.logs trong DEV check
 * Thay vì xóa, wrap chúng để chỉ chạy trong development
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIRS_TO_PROCESS = [
  path.join(ROOT_DIR, 'admin/src'),
  path.join(ROOT_DIR, 'landing/src'),
];

let totalWrapped = 0;
let filesModified = 0;

function wrapDebugLog(line: string, indent: string): string[] {
  return [
    `${indent}if (import.meta.env.DEV) {`,
    line,
    `${indent}}`,
  ];
}

function processFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const processedLines: string[] = [];
  let wrapped = 0;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip if already wrapped
    if (line.trim().startsWith('if (import.meta.env.DEV)')) {
      processedLines.push(line);
      i++;
      continue;
    }
    
    // Skip error/warn logs
    if (/console\.(error|warn|info|table)/.test(line)) {
      processedLines.push(line);
      i++;
      continue;
    }
    
    // Check for debug console.log
    const match = line.match(/^(\s*)console\.log\(/);
    if (match) {
      const indent = match[1];
      
      // Single line console.log
      if (line.includes(');')) {
        processedLines.push(...wrapDebugLog(line, indent));
        wrapped++;
        totalWrapped++;
        i++;
        continue;
      }
      
      // Multi-line console.log
      const logLines = [line];
      let j = i + 1;
      while (j < lines.length && !lines[j].includes(');')) {
        logLines.push(lines[j]);
        j++;
      }
      if (j < lines.length) {
        logLines.push(lines[j]);
      }
      
      processedLines.push(`${indent}if (import.meta.env.DEV) {`);
      processedLines.push(...logLines);
      processedLines.push(`${indent}}`);
      
      wrapped++;
      totalWrapped++;
      i = j + 1;
      continue;
    }
    
    processedLines.push(line);
    i++;
  }
  
  if (wrapped > 0) {
    const newContent = processedLines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ ${path.relative(ROOT_DIR, filePath)}: Wrapped ${wrapped} debug log(s)`);
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

console.log('🔧 Wrapping debug logs in DEV checks...\n');

for (const dir of DIRS_TO_PROCESS) {
  console.log(`📁 Processing directory: ${path.relative(ROOT_DIR, dir)}`);
  
  walkDir(dir, (filePath) => {
    if (processFile(filePath)) {
      filesModified++;
    }
  });
  
  console.log('');
}

console.log('═══════════════════════════════════════');
console.log(`✨ Processing complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Debug logs wrapped: ${totalWrapped}`);
console.log('═══════════════════════════════════════');

if (filesModified === 0) {
  console.log('✅ All debug logs already wrapped!');
} else {
  console.log('⚠️  Please review changes and run tests before committing.');
  console.log('💡 Debug logs will now only run in development mode.');
}



