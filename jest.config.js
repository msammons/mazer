module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*@babylonjs.*)/)',
  ],
  moduleNameMapper: {
    '^@babylonjs/(.*)$': '<rootDir>/node_modules/@babylonjs/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      useESM: true,
    },
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
