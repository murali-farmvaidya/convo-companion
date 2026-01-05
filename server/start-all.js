import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Convo Companion - Unified Server');

// Detect Python environment
const lightragPath = path.join(__dirname, 'lightrag', 'Lightrag_main');
const isWindows = platform() === 'win32';

// Check for virtual environment
let pythonExecutable = process.env.PYTHON_EXECUTABLE;

if (!pythonExecutable) {
  const venvPaths = [
    path.join(lightragPath, '.venv', isWindows ? 'Scripts' : 'bin', isWindows ? 'python.exe' : 'python'),
    path.join(lightragPath, 'venv', isWindows ? 'Scripts' : 'bin', isWindows ? 'python.exe' : 'python'),
  ];

  for (const venvPath of venvPaths) {
    if (existsSync(venvPath)) {
      pythonExecutable = venvPath;
      console.log(`✅ Found virtual environment: ${venvPath}`);
      break;
    }
  }

  if (!pythonExecutable) {
    pythonExecutable = isWindows ? 'python' : 'python3';
    console.log(`⚠️  No virtual environment found, using system Python: ${pythonExecutable}`);
    console.log('💡 To set up the environment, run:');
    console.log(`   cd ${lightragPath}`);
    console.log('   python -m venv .venv');
    console.log(isWindows ? '   .venv\\Scripts\\activate' : '   source .venv/bin/activate');
    console.log('   pip install -r requirements-offline.txt');
  }
}

console.log(`📦 Starting LightRAG Server with: ${pythonExecutable}`);

// Check and create .env if missing
const lightragEnvPath = path.join(lightragPath, '.env');
if (!existsSync(lightragEnvPath)) {
  console.log('⚠️  No .env file found in LightRAG directory');
  console.log('📝 Creating default .env file...');
  
  const defaultEnv = `### LightRAG Server Configuration
HOST=0.0.0.0
PORT=9621
WEBUI_TITLE='Convo Companion RAG'
WEBUI_DESCRIPTION="Farm Vaidya Knowledge Base"
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:5173

# Add your OpenAI API key here
OPENAI_API_KEY=

# Optional: Timeout configuration
# TIMEOUT=150
`;
  
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(lightragEnvPath, defaultEnv, 'utf8');
    console.log('✅ Created .env file');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    console.log('💡 Please create it manually by copying env.example to .env');
  }
}

const lightragServer = spawn(
  pythonExecutable,
  ['-m', 'lightrag.api.lightrag_server'],
  {
    cwd: lightragPath,
    env: { 
      ...process.env,
      PYTHONUNBUFFERED: '1',  // Ensure Python output is not buffered
    },
    stdio: 'inherit'
  }
);

lightragServer.on('error', (error) => {
  console.error('❌ Failed to start LightRAG server:', error);
  console.error('\n💡 Make sure Python dependencies are installed:');
  console.error(`   cd ${lightragPath}`);
  console.error('   pip install -r requirements-offline.txt');
  process.exit(1);
});

lightragServer.on('close', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️ LightRAG server exited with code ${code}`);
    console.error('\n💡 Common issues:');
    console.error('   1. Missing Python dependencies - run: pip install -r requirements-offline.txt');
    console.error('   2. Wrong Python version - LightRAG needs Python 3.9+');
    console.error('   3. Virtual environment not activated');
  }
  process.exit(code);
});

// Wait a bit for LightRAG to start, then start Express server
setTimeout(() => {
  console.log('🌐 Starting Express Server...');
  const expressServer = spawn(
    'node',
    ['server.js'],
    {
      cwd: __dirname,
      env: { ...process.env },
      stdio: 'inherit'
    }
  );

  expressServer.on('error', (error) => {
    console.error('❌ Failed to start Express server:', error);
    lightragServer.kill();
    process.exit(1);
  });

  expressServer.on('close', (code) => {
    console.log(`⚠️ Express server exited with code ${code}`);
    lightragServer.kill();
    process.exit(code);
  });

  // Handle shutdown gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    lightragServer.kill('SIGINT');
    expressServer.kill('SIGINT');
    setTimeout(() => process.exit(0), 1000);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    lightragServer.kill('SIGTERM');
    expressServer.kill('SIGTERM');
    setTimeout(() => process.exit(0), 1000);
  });
}, 3000);

console.log('✅ All servers starting...');
