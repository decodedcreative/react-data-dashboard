import { readFile } from 'node:fs/promises';

const REQUIRED_FILES = ['vercel.json', '.env.example', 'docs/vercel-deployment.md'];

async function mustRead(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Missing required file: ${path}`);
  }
}

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) {
    throw new Error(message);
  }
}

async function main() {
  await Promise.all(REQUIRED_FILES.map((file) => mustRead(file)));

  const vercelConfigRaw = await mustRead('vercel.json');
  const vercelConfig = JSON.parse(vercelConfigRaw);

  if (vercelConfig.framework !== 'nextjs') {
    throw new Error('vercel.json must set "framework" to "nextjs".');
  }

  assertIncludes(
    vercelConfigRaw,
    '"buildCommand"',
    'vercel.json must define an explicit "buildCommand".',
  );

  const envExample = await mustRead('.env.example');
  assertIncludes(
    envExample,
    'DATABASE_URL=',
    '.env.example must define DATABASE_URL for deployment environments.',
  );

  const deployRunbook = await mustRead('docs/vercel-deployment.md');
  assertIncludes(
    deployRunbook,
    '`main` -> **Production**',
    'docs/vercel-deployment.md must document production branch mapping.',
  );
  assertIncludes(
    deployRunbook,
    '`staging` -> **Preview**',
    'docs/vercel-deployment.md must document staging branch mapping.',
  );
  assertIncludes(
    deployRunbook,
    'PR branches -> **Preview**',
    'docs/vercel-deployment.md must document PR preview mapping.',
  );

  console.log('Vercel deployment configuration guard passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
