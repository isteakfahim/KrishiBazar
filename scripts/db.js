const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', '.db-data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const net = require('net');

function isPostgresResponding(port = 5433, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

const pidFile = path.join(dbDir, 'postmaster.pid');

const pg = new EmbeddedPostgres({
  port: 5433,
  user: 'postgres',
  password: 'password',
  database: 'krishibazar',
  databaseDir: dbDir,
  persistent: true,
  initdbFlags: ['-E', 'UTF8', '--locale=C'],
});

async function main() {
  const isRunning = await isPostgresResponding(5433, '127.0.0.1');
  if (isRunning) {
    console.log('[Postgres] PostgreSQL is already running and active on port 5433.');
    console.log('[Postgres] Ready! Connection string: postgresql://postgres:password@localhost:5433/krishibazar?schema=public');
    // Keep alive if run directly, or exit gracefully
    setInterval(() => {}, 10000);
    return;
  }

  // If port is not responding but lock file exists, it's stale
  if (fs.existsSync(pidFile)) {
    console.log('[Postgres] Removing stale postmaster.pid lock file...');
    try {
      fs.unlinkSync(pidFile);
    } catch (e) {
      console.log('[Postgres] Notice removing lock:', e.message);
    }
  }

  console.log('[Postgres] Initializing embedded PostgreSQL with UTF-8 encoding...');
  try {
    await pg.initialise();
    console.log('[Postgres] Initialization finished.');
  } catch (err) {
    console.log('[Postgres] Cluster already initialized or notice:', err.message);
  }

  console.log('[Postgres] Starting PostgreSQL on port 5433...');
  await pg.start();
  console.log('[Postgres] PostgreSQL is running!');

  // Create database krishibazar with UTF8 if not created
  try {
    await pg.createDatabase('krishibazar');
    console.log('[Postgres] Created database "krishibazar" (UTF8).');
  } catch (err) {
    // Might already exist
  }

  console.log('[Postgres] Ready! Connection string: postgresql://postgres:password@localhost:5433/krishibazar?schema=public');

  const cleanup = async () => {
    console.log('\n[Postgres] Stopping PostgreSQL...');
    try {
      await pg.stop();
      console.log('[Postgres] Stopped.');
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error('[Postgres] Error starting PostgreSQL:', err);
  process.exit(1);
});
