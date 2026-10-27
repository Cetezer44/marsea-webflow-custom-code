import { build } from 'esbuild';
import { readdirSync } from 'node:fs';

const files = readdirSync('src').filter((f) => /\.(js|css)$/.test(f));

for (const file of files) {
  const out = file.replace(/\.(js|css)$/, '.min.$1');
  await build({
    entryPoints: [`src/${file}`],
    outfile: `dist/${out}`,
    minify: true,
    bundle: false,
    target: ['es2017', 'chrome80', 'safari13', 'firefox78'],
    legalComments: 'none',
    logLevel: 'info',
  });
}
