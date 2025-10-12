import fs from 'fs';
import path from 'path';

type Mode = 'init' | 'sync';

const root = process.cwd();
const examplePath = path.join(root, 'env.example');
const envPath = path.join(root, '.env');

function copyExampleToEnv() {
	if (!fs.existsSync(examplePath)) {
		console.error('env.example not found');
		process.exit(1);
	}
	if (fs.existsSync(envPath)) {
		console.log('.env already exists. Skipping.');
		return;
	}
	fs.copyFileSync(examplePath, envPath);
	console.log('Created .env from env.example');
}

function syncEnv() {
	if (!fs.existsSync(examplePath)) {
		console.error('env.example not found');
		process.exit(1);
	}
	const ex = fs.readFileSync(examplePath, 'utf8').split('\n').filter(Boolean);
	const cur = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8').split('\n') : [];
	const curKeys = new Set(cur.map((l) => l.split('=')[0]));
	const toAppend = ex.filter((l) => !curKeys.has(l.split('=')[0]));
	if (toAppend.length) {
		fs.appendFileSync(envPath, (cur.length ? '\n' : '') + toAppend.join('\n') + '\n');
		console.log('Synced missing keys to .env');
	} else {
		console.log('.env already has all keys');
	}
}

const mode = (process.argv[2] as Mode) || 'init';
if (mode === 'init') copyExampleToEnv();
if (mode === 'sync') syncEnv();


