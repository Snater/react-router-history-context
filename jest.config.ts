import type {Config} from 'jest';

const config: Config = {
	testEnvironment: 'jsdom',
	transform: {
		'\\.[jt]sx?$': 'babel-jest',
	},
};

export default config;