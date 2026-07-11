import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      insertTypesEntry: true,
      include: ["src"],
      // 테스트 파일/헬퍼의 .d.ts가 배포물에 실리지 않게 제외
      // (vitest 등 devDependency 타입을 참조하는 선언이 소비자에게 노출되는 것 방지)
      exclude: [
        "**/*.stories.tsx",
        "**/*.stories.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/dev",
        "src/test",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "hooks/index": resolve(__dirname, "src/hooks/index.ts"),
        "components/Sheet/useSheetNavigation": resolve(
          __dirname,
          "src/components/Sheet/useSheetNavigation.ts"
        ),
      },
      name: "MotileUI",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          // CSS 파일을 컴포넌트 폴더에 배치
          if (assetInfo.name?.endsWith(".css")) {
            return "[name][extname]";
          }
          return "assets/[name][extname]";
        },
      },
    },
    cssCodeSplit: true,
  },
});
