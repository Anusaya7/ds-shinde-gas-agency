const { existsSync } = require('node:fs');
const { spawn, spawnSync } = require('node:child_process');
const { readFile, rm, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const backendRoot = resolve(__dirname, '..');
const schemaPath = resolve(backendRoot, 'prisma', 'schema.prisma');
const localSchemaPath = resolve(backendRoot, 'prisma', 'schema.local.generated.prisma');
const sqliteDbPath = resolve(backendRoot, 'prisma', 'dev.db');
const prismaCliPath = resolve(backendRoot, 'node_modules', 'prisma', 'build', 'index.js');
const tsxCliPath = resolve(backendRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const sqliteUrl = `file:${sqliteDbPath.replace(/\\/g, '/')}`;

const localEnv = {
  ...process.env,
  DATABASE_URL: sqliteUrl,
  NODE_ENV: 'development',
};

function runPrisma(args) {
  return spawnSync(process.execPath, [prismaCliPath, ...args], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: localEnv,
  });
}

async function startLocalBackend() {
  const schema = await readFile(schemaPath, 'utf8');
  const sqliteSchema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*)"postgresql"/,
    '$1"sqlite"',
  );

  if (sqliteSchema === schema) {
    throw new Error('Could not create the local SQLite schema from prisma/schema.prisma.');
  }

  await writeFile(localSchemaPath, sqliteSchema);
  const isNewDb = !existsSync(sqliteDbPath);

  try {
    let generate;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      generate = runPrisma(['generate', '--schema', localSchemaPath]);

      if (!generate.error && generate.status === 0) break;

      if (attempt === 3) {
        if (generate.error) throw generate.error;
        throw new Error(
          `Generating the local SQLite Prisma client failed with status ${generate.status}. Close any old node process using port 5000 and try again.`,
        );
      }

      console.warn(`Prisma generate failed (attempt ${attempt}/3). Retrying...`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }

    const push = runPrisma(['db', 'push', '--schema', localSchemaPath, '--skip-generate']);
    if (push.error) throw push.error;
    if (push.status !== 0) {
      throw new Error(`Creating the local SQLite database failed with status ${push.status}.`);
    }

    if (isNewDb) {
      console.log('Seeding the local SQLite database...');
      const seed = spawnSync(process.execPath, [tsxCliPath, 'prisma/seed.ts'], {
        cwd: backendRoot,
        stdio: 'inherit',
        env: localEnv,
      });
      if (seed.error || seed.status !== 0) {
        console.warn('Local database seed failed. The API will still start with an empty catalog.');
      }
    }
  } finally {
    await rm(localSchemaPath, { force: true });
  }

  console.log(`Local backend using SQLite at prisma/dev.db`);

  const server = spawn(process.execPath, [tsxCliPath, 'watch', 'src/index.ts'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: localEnv,
  });

  server.on('error', (error) => {
    console.error('Could not start the local backend server:', error);
    process.exitCode = 1;
  });

  server.on('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      if (!server.killed) server.kill(signal);
    });
  }
}

startLocalBackend().catch((error) => {
  console.error('Could not start the local backend:', error);
  process.exitCode = 1;
});
