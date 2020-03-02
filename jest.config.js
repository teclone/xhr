module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
  testRegex: '\\.spec\\.ts',
  testURL: 'http://localhost:8001',
};
