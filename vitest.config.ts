import { defineConfig, UserConfig } from 'vitest/config'

export const config: UserConfig = {

  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
      include: ["src/**/*.ts"],
      exclude: ["src/main/**"]
    },
    dir: 'src',
    setupFiles: ["./vitest-mongodb-config.ts"],
    passWithNoTests: true
  }
}

export default defineConfig(config)
