const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[35m%s\x1b[0m', '🚀 Launching PrivateNotes MERN Application...');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const shutdown = () => {
  console.log('\nShutting down servers...');
  server.kill();
  client.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
