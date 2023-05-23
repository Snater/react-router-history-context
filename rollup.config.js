import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert {type: 'json'};

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/index.cjs',
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: 'dist/index.js',
				format: 'esm',
				sourcemap: true,
			},
		],
		external: [...Object.keys(pkg.peerDependencies || {})],
		plugins: [
			cleaner({
				targets: [
					'./dist',
				],
			}),
			resolve(),
			commonjs({
				exclude: 'src/**',
			}),
			typescript({tsconfig: './tsconfig.build.json'}),
		],
	},
];