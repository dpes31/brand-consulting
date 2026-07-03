import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const rawEnvironment = process.env.VERCEL_ENV || 'development'
const environment = rawEnvironment === 'production'
  ? 'Production'
  : rawEnvironment === 'preview'
    ? 'Preview'
    : 'Local'
const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || 'local'
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local'
const stage = process.env.REPORT_BUILD_STAGE || (
  environment === 'Production'
    ? '운영 배포'
    : branch === 'fix/production-report-template-integration-v1'
      ? 'PR #13 · 종단 검증'
      : environment === 'Preview'
        ? 'Preview 검증'
        : '로컬 개발'
)

const buildMeta = {
  builtAt: new Date().toISOString(),
  commitSha,
  environment,
  branch,
  stage,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_META__: JSON.stringify(buildMeta),
  },
})
