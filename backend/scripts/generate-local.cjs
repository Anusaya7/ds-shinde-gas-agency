const { spawnSync } = require('node:child_process');
const { readFile, rm, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const backendRoot = resolve(__dirname, '..');
const schemaPath = resolve(backendRoot, 'prisma', 'schema.prisma');
const localSchemaPath = resolve(backendRoot, 'prisma', 'schema.local.generated.prisma');
const prismaCliPath = resolve(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');

async function generateLocal() {
  const schema = await readFile(schemaPath, 'utf8');
  const sqliteSchema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*)"postgresql"/,
    '$1"sqlite"',
  );

  if (sqliteSchema === schema) {
    throw new Error('Could not create the local SQLite schema from prisma/schema.prisma.');
  }

  await writeFile(localSchemaPath, sqliteSchema);

  try {
    const generate = spawnSync(
      process.execPath,
      [prismaCliPath, 'generate', '--schema', localSchemaPath],
      { cwd: backendRoot, stdio: 'inherit' },
    );

    if (generate.error) throw generate.error;
    if (generate.status !== 0) {
      throw new Error(`Generating the local SQLite Prisma client failed with status ${generate.status}.`);
    }
  } finally {
    await rm(localSchemaPath, { force: true });
  }
}

generateLocal().catch((error) => {
  console.error('Could not generate local Prisma client:', error);
  process.exit(1);
});
