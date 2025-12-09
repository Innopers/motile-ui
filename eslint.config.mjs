import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // 전역 무시 패턴
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "storybook-static/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "vitest.config.ts",
    ],
  },

  // 기본 JS 규칙
  js.configs.recommended,

  // TypeScript 규칙
  ...tseslint.configs.recommended,

  // React 설정
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      // React 17+ JSX transform 사용으로 import React 불필요
      "react/react-in-jsx-scope": "off",
      // prop-types 사용 안 함 (TypeScript 사용)
      "react/prop-types": "off",
      // displayName 권장 (forwardRef 사용 시 유용)
      "react/display-name": "warn",
    },
  },

  // React Hooks 규칙
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Import 정렬
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. React 관련 (항상 최상단)
            ["^react$", "^react-dom(/.*)?$"],
            // 2. 외부 패키지
            ["^@?\\w"],
            // 3. 내부 alias (@/)
            ["^@/"],
            // 4. 상대 경로 (부모 → 현재)
            [
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            // 5. CSS/스타일 파일 (항상 마지막)
            ["^.+\\.css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },

  // 소스 코드 규칙
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // 미사용 변수 에러 (_로 시작하는 것은 허용)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // 명시적 any 타입 경고
      "@typescript-eslint/no-explicit-any": "warn",
      // 빈 함수 허용 (이벤트 핸들러 기본값 등)
      "@typescript-eslint/no-empty-function": "off",
      // 빈 interface 허용 (HTML 속성 확장 시 흔히 사용)
      "@typescript-eslint/no-empty-object-type": "off",
      // console 경고 (console.error, console.warn은 허용)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // 테스트 파일 규칙 (완화)
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "src/test/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // Storybook 파일 규칙 (완화)
  {
    files: ["**/*.stories.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      // Storybook에서 default export 필수
      "import/no-default-export": "off",
      // Storybook render 함수에서 hooks 사용 허용
      "react-hooks/rules-of-hooks": "off",
    },
  },

  // Prettier와 충돌 방지 (항상 마지막에 위치)
  prettierConfig
);
