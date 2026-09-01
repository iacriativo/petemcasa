import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'README.md',
  '.gitignore',
  '.env.example',
  'package.json',
  'frontend/README.md',
  'backend/README.md',
  'collector/README.md',
  'supabase/README.md',
  'docs/gates/GATE-01-BOOTSTRAP.md',
  'scripts/check-bootstrap.mjs'
];

for (const relativePath of requiredFiles) {
  await access(resolve(root, relativePath), constants.F_OK);
}

const gitignore = await readFile(resolve(root, '.gitignore'), 'utf8');
if (!gitignore.includes('node_modules/') || !gitignore.includes('.env')) {
  throw new Error('O .gitignore não contém as regras mínimas de dependências e ambiente.');
}

const envExample = await readFile(resolve(root, '.env.example'), 'utf8');
for (const key of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'WHATSAPP_NUMBER']) {
  const line = envExample.split(/\r?\n/).find((entry) => entry.startsWith(`${key}=`));
  if (!line || line.slice(key.length + 1).trim() !== '') {
    throw new Error(`O placeholder ${key} deve permanecer vazio no .env.example.`);
  }
}

console.log('Bootstrap do Pet em Casa validado.');
