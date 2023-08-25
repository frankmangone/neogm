import type { Config } from "jest";

const config: Config = {
	moduleFileExtensions: ["js", "json", "ts"],
	preset: "ts-jest",
	testRegex: "/tests/.*\\.spec\\.ts$",
	rootDir: "./",
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	collectCoverageFrom: ["**/*.(t|j)s"],
	coverageDirectory: "../coverage",
	testEnvironment: "node",
	moduleNameMapper: {
		"#node-web-compat": "./node-web-compat-node.js",
		"^~/(.*)$": ["<rootDir>/src/$1"],
	},
	verbose: true,
};

export default config;
