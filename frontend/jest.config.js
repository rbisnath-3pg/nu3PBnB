module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^./getApiBase\\.vite\\.js$': '<rootDir>/src/services/getApiBase.node.js',
    '^./getApiBase\\.node\\.js$': '<rootDir>/src/services/getApiBase.node.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-router|react-router-dom|vite)/)'
  ],
  setupFiles: ['<rootDir>/jest.setup.js']
}; 