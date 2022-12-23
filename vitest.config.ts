import { defineConfig, UserConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export const config: UserConfig = {
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcovonly'],
      reportsDirectory: 'coverage',
      include: ["src/**/*.ts"],
      exclude: [
        "src/main/**", 
      ]
    },
    dir: 'tests',
    exclude: ["node_modules/**"],
    setupFiles: ["./vitest-mongodb-config.ts"],
    passWithNoTests: true
  }
}

export default defineConfig(config)
