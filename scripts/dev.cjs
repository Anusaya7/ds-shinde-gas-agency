const { spawn, spawnSync, execSync } = require('node:child_process');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');
const DEV_PORTS = [3000, 5000];
const children = [];

function listeningPids(port) {
  if (process.platform === 'win32') {
    let output = '';
    try {
      output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    } catch {
      return [];
    }

    const pids = new Set();
    const matcher = new RegExp(`[:\\]]${port}\\s+\\S+\\s+LISTENING\\s+(\\d+)`, 'i');
    for (const line of output.split(/\r?\n/)) {
      const match = line.match(matcher);
      if (match && match[1] !== '0') pids.add(match[1]);
    }
    return [...pids];
  }

  try {
    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    return output.split(/\s+/).filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (!pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(Number(pid), 'SIGTERM');
  } catch {
    // Process already exited.
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function freeDevPorts() {
  let freed = false;
  for (const port of DEV_PORTS) {
    const pids = listeningPids(port);
    if (pids.length === 0) continue;
    console.log(`Freeing port ${port} (PID ${pids.join(', ')})...`);
    for (const pid of pids) killPid(pid);
    freed = true;
  }
  if (freed) sleep(800);
}

function start(label, cwd) {
  console.log(`Starting ${label}...`);

  const child = spawn('npm', ['run', 'dev'], {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });

  child.on('error', (error) => {
    console.error(`Could not start ${label}:`, error);
    process.exitCode = 1;
  });

  child.on('exit', (code, signal) => {
    if (signal) return;
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}.`);
      process.exitCode = code;
    }
  });

  children.push(child);
}

function shutdown() {
  for (const child of children) {
    killPid(child.pid);
  }
}

console.log('DS Shinde Gas — backend http://localhost:5000, frontend http://localhost:3000');
freeDevPorts();
start('backend', resolve(root, 'backend'));
start('frontend', resolve(root, 'frontend'));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown();
    process.exit(0);
  });
}
