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

// Create LightRAG .env from main .env
const lightragEnvPath = path.join(lightragPath, '.env');
console.log('📝 Configuring LightRAG environment...');

const lightragEnvContent = `# Auto-generated from main .env - DO NOT EDIT MANUALLY
HOST=${process.env.LIGHTRAG_HOST || '0.0.0.0'}
PORT=${process.env.LIGHTRAG_PORT || '9621'}
WEBUI_TITLE=${process.env.WEBUI_TITLE || 'Convo Companion RAG'}
WEBUI_DESCRIPTION=${process.env.WEBUI_DESCRIPTION || 'Farm Vaidya Knowledge Base'}
CORS_ORIGINS=${process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8080,http://localhost:5173'}

# API Keys
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}
${process.env.ANTHROPIC_API_KEY ? `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}` : '# ANTHROPIC_API_KEY='}
${process.env.GEMINI_API_KEY ? `GEMINI_API_KEY=${process.env.GEMINI_API_KEY}` : '# GEMINI_API_KEY='}

# LLM Configuration
LLM_BINDING=${process.env.LLM_BINDING || 'openai'}
LLM_MODEL=${process.env.LLM_MODEL || 'gpt-4o-mini'}
${process.env.LLM_BINDING_HOST ? `LLM_BINDING_HOST=${process.env.LLM_BINDING_HOST}` : ''}
${process.env.LLM_BINDING_API_KEY ? `LLM_BINDING_API_KEY=${process.env.LLM_BINDING_API_KEY}` : ''}

# Embedding Configuration
EMBEDDING_BINDING=${process.env.EMBEDDING_BINDING || 'openai'}
EMBEDDING_MODEL=${process.env.EMBEDDING_MODEL || 'text-embedding-3-large'}
${process.env.EMBEDDING_BINDING_HOST ? `EMBEDDING_BINDING_HOST=${process.env.EMBEDDING_BINDING_HOST}` : ''}
${process.env.EMBEDDING_BINDING_API_KEY ? `EMBEDDING_BINDING_API_KEY=${process.env.EMBEDDING_BINDING_API_KEY}` : ''}
EMBEDDING_DIM=${process.env.EMBEDDING_DIM || '3072'}
EMBEDDING_BATCH_NUM=${process.env.EMBEDDING_BATCH_NUM || '32'}

# Ollama Configuration
${process.env.OLLAMA_BASE_URL ? `OLLAMA_BASE_URL=${process.env.OLLAMA_BASE_URL}` : '# OLLAMA_BASE_URL=http://localhost:11434'}
OLLAMA_EMULATING_MODEL_TAG=${process.env.OLLAMA_EMULATING_MODEL_TAG || 'latest'}

# Optional Configuration
${process.env.TIMEOUT ? `TIMEOUT=${process.env.TIMEOUT}` : '# TIMEOUT=150'}
${process.env.LLM_TIMEOUT ? `LLM_TIMEOUT=${process.env.LLM_TIMEOUT}` : '# LLM_TIMEOUT=120'}
${process.env.EMBEDDING_TIMEOUT ? `EMBEDDING_TIMEOUT=${process.env.EMBEDDING_TIMEOUT}` : '# EMBEDDING_TIMEOUT=120'}
${process.env.INPUT_DIR ? `INPUT_DIR=${process.env.INPUT_DIR}` : '# INPUT_DIR=./inputs'}
${process.env.WORKING_DIR ? `WORKING_DIR=${process.env.WORKING_DIR}` : '# WORKING_DIR=./rag_storage'}
`;

try {
  const fs = await import('fs/promises');
  await fs.writeFile(lightragEnvPath, lightragEnvContent, 'utf8');
  console.log('✅ LightRAG environment configured');
} catch (error) {
  console.error('❌ Failed to create LightRAG .env:', error.message);
  process.exit(1);
}

const lightragServer = spawn(
  pythonExecutable,
  ['-m', 'lightrag.api.lightrag_server'],
  {
    cwd: lightragPath,
    env: { 
      ...process.env,
      PYTHONUNBUFFERED: '1',
      HOST: process.env.LIGHTRAG_HOST || '0.0.0.0',
      PORT: process.env.LIGHTRAG_PORT || '9621',
      // Ensure OpenAI API key is available
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      // LLM Configuration
      LLM_BINDING: process.env.LLM_BINDING || 'openai',
      LLM_MODEL: process.env.LLM_MODEL || 'gpt-4o-mini',
      ...(process.env.LLM_BINDING_HOST && { LLM_BINDING_HOST: process.env.LLM_BINDING_HOST }),
      ...(process.env.LLM_BINDING_API_KEY && { LLM_BINDING_API_KEY: process.env.LLM_BINDING_API_KEY }),
      // Embedding Configuration
      EMBEDDING_BINDING: process.env.EMBEDDING_BINDING || 'openai',
      EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-large',
      ...(process.env.EMBEDDING_BINDING_HOST && { EMBEDDING_BINDING_HOST: process.env.EMBEDDING_BINDING_HOST }),
      ...(process.env.EMBEDDING_BINDING_API_KEY && { EMBEDDING_BINDING_API_KEY: process.env.EMBEDDING_BINDING_API_KEY }),
      EMBEDDING_DIM: process.env.EMBEDDING_DIM || '3072',
      EMBEDDING_BATCH_NUM: process.env.EMBEDDING_BATCH_NUM || '32',
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
