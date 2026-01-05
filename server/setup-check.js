#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = platform() === 'win32';
const lightragPath = path.join(__dirname, 'lightrag', 'Lightrag_main');

console.log('🔍 Checking Convo Companion Setup...\n');

let hasErrors = false;

// Check Node.js dependencies
console.log('📦 Node.js Dependencies:');
if (existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ Node modules installed');
} else {
  console.log('   ❌ Node modules missing - run: npm install');
  hasErrors = true;
}

// Check .env file
console.log('\n📝 Environment Files:');
if (existsSync(path.join(__dirname, '.env'))) {
  console.log('   ✅ server/.env exists');
} else {
  console.log('   ⚠️  server/.env missing - create it with:');
  console.log('      MONGODB_URI=your_mongodb_uri');
  console.log('      PORT=3000');
  console.log('      LIGHTRAG_API_URL=http://localhost:9621');
  hasErrors = true;
}

if (existsSync(path.join(lightragPath, '.env'))) {
  console.log('   ✅ lightrag/.env exists');
} else {
  console.log('   ⚠️  lightrag/.env missing - copy env.example');
  hasErrors = true;
}

// Check Python environment
console.log('\n🐍 Python Environment:');
const venvPath = path.join(lightragPath, '.venv', isWindows ? 'Scripts' : 'bin', isWindows ? 'python.exe' : 'python');
if (existsSync(venvPath)) {
  console.log('   ✅ Virtual environment exists at .venv');
  
  // Try to check if dependencies are installed
  const checkDeps = spawn(venvPath, ['-c', 'import httpx, fastapi, lightrag'], {
    cwd: lightragPath,
    stdio: 'pipe'
  });
  
  checkDeps.on('close', (code) => {
    if (code === 0) {
      console.log('   ✅ Python dependencies installed');
    } else {
      console.log('   ⚠️  Python dependencies missing or incomplete');
      console.log('      Run: .venv\\Scripts\\activate && pip install -r requirements-offline.txt');
    }
  });
} else {
  console.log('   ❌ Virtual environment missing');
  console.log('      Run setup script: npm run setup:windows (or setup:unix)');
  hasErrors = true;
}

// Check ports
console.log('\n🔌 Port Configuration:');
console.log('   📍 Express Server: PORT 3000');
console.log('   📍 LightRAG API: PORT 9621');
console.log('   📍 Frontend Dev: PORT 8080 (or 5173)');

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('⚠️  Setup incomplete - please fix the issues above');
    console.log('\n💡 Quick fix:');
    console.log(isWindows 
      ? '   npm run setup:windows'
      : '   npm run setup:unix');
  } else {
    console.log('✅ Setup looks good!');
    console.log('\n🚀 Start the server with: npm start');
  }
  console.log('='.repeat(50));
}, 1000);
