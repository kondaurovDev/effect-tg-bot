import { JestConfigWithTsJest } from "ts-jest";

// @ts-ignore
const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};

export default config;