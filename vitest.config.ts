import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // 테스트 환경 설정 (happy-dom이 더 빠르고 ESM 호환성 좋음)
    environment: "happy-dom",

    // 전역 설정
    globals: true,

    // setup 파일 경로
    setupFiles: ["./src/test/setup.ts"],

    // CSS 처리
    css: true,

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.stories.tsx",
        "**/*.d.ts",
        "src/dev/",
        "dist/",
        ".storybook/",
      ],
    },

    // 테스트 파일 패턴
    include: ["**/*.{test,spec}.{ts,tsx}"],

    // 제외할 파일
    exclude: ["node_modules", "dist", ".storybook", "src/dev"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
