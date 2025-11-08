<div align="center">
  <img src="https://github.com/Innopers.png" alt="Motile UI Logo" width="200"/>

# Motile UI

**웹뷰 애플리케이션을 위한 모던 React 컴포넌트 라이브러리**

[![npm version](https://img.shields.io/npm/v/motile-ui.svg?style=flat-square)](https://www.npmjs.com/package/motile-ui)
[![npm downloads](https://img.shields.io/npm/dm/motile-ui.svg?style=flat-square)](https://www.npmjs.com/package/motile-ui)
[![license](https://img.shields.io/npm/l/motile-ui.svg?style=flat-square)](https://github.com/Innopers/motile-ui/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)

  <br/>

**[🇰🇷 한국어](#-한국어) | [🇺🇸 English](#-english)**

</div>

---

<br/>
<br/>

# 🇰🇷 한국어

## 📚 목차

- [주요 기능](#-주요-기능)
- [설치](#-설치)
- [빠른 시작](#-빠른-시작)
- [테마 커스터마이징](#-테마-커스터마이징)
- [컴포넌트](#-컴포넌트)
- [라이선스](#-라이선스)

---

## ✨ 주요 기능

- 🎨 **16개의 고품질 컴포넌트** - 웹뷰 애플리케이션을 위해 세심하게 제작
- 💪 **TypeScript 우선** - 포괄적인 타입 정의 완벽 지원
- 🎭 **커스터마이징 가능** - CSS 변수로 쉬운 테마 설정
- 📱 **모바일 최적화** - 터치 친화적 인터랙션과 반응형 디자인
- ♿ **접근성** - WCAG 2.1 AA 준수 컴포넌트
- 🎯 **트리쉐이킹 지원** - 필요한 것만 import
- 📖 **풍부한 문서** - Storybook을 통한 라이브 예제 제공

---

## 📦 설치

### 요구사항

- **React**: 18.0.0 이상 (React 18 또는 React 19)
- **React DOM**: 18.0.0 이상

```bash
# npm
npm install motile-ui

# yarn
yarn add motile-ui

# pnpm
pnpm add motile-ui
```

---

## 🚀 빠른 시작

```tsx
import { Button, Input, Modal } from "motile-ui";

function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        클릭하세요
      </Button>

      <Input label="이메일" placeholder="이메일을 입력하세요" type="email" />

      <Modal open={true} onClose={() => {}}>
        <h2>안녕하세요 Motile UI!</h2>
      </Modal>
    </div>
  );
}
```

---

## 🎨 테마 커스터마이징

Motile UI는 CSS 변수를 통해 전역 테마를 쉽게 커스터마이징할 수 있습니다.

### 전역 테마 색상

모든 컴포넌트에 적용되는 기본 색상을 설정할 수 있습니다:

```css
:root {
  --motile-theme: #3b82f6; /* 모든 컴포넌트의 기본 색상 */
}
```

### 컴포넌트별 전역 색상

특정 컴포넌트 타입의 전역 색상을 개별적으로 설정할 수 있습니다:

```css
:root {
  /* 버튼 */
  --motile-ui-btn: #10b981; /* 모든 버튼 variant 색상 */

  /* 입력 필드 */
  --motile-ui-input: #8b5cf6; /* Input 포커스 색상 */
  --motile-ui-textarea: #ec4899; /* Textarea 포커스 색상 */

  /* 선택 컨트롤 */
  --motile-ui-checkbox: #f59e0b; /* Checkbox 체크 색상 */
  --motile-ui-switch: #14b8a6; /* Switch 활성화 색상 */

  /* 기타 컴포넌트 */
  --motile-ui-badge: #ef4444; /* Badge 배경 색상 */
  --motile-ui-tooltip: #1f2937; /* Tooltip 배경 색상 */
  --motile-ui-popover: #3b82f6; /* Popover 강조 색상 */
  --motile-ui-dock: #3b82f6; /* Dock 하이라이트 색상 */
}
```

### 개별 컴포넌트 색상

각 컴포넌트 인스턴스마다 다른 색상을 적용할 수 있습니다:

```tsx
<Button
  color="#ef4444"
  variant="primary"
>
  빨간 버튼
</Button>

<Input
  color="#8b5cf6"
  label="보라색 입력 필드"
/>

<Checkbox
  color="#f59e0b"
  label="주황색 체크박스"
/>
```

### 우선순위

색상 적용 우선순위는 다음과 같습니다:

```
개별 컴포넌트 색상 > 컴포넌트 타입 전역 색상 > 전역 테마 색상 > 기본 색상
```

예시:

```
--motile-btn-color > --motile-ui-btn > --motile-theme > #3b82f6 (기본값)
```

---

## 🎨 컴포넌트

- **Button** - 다양한 variant와 size를 지원하는 버튼
- **Input** - 라벨과 검증 기능이 있는 텍스트 입력 필드
- **Textarea** - 여러 줄 텍스트 입력 필드
- **Checkbox** - 체크박스 입력
- **Switch** - 토글 스위치
- **Badge** - 상태 표시 배지
- **Toast** - 알림 메시지
- **Skeleton** - 로딩 상태 플레이스홀더
- **SpeedDial** - 플로팅 액션 버튼
- **Modal** - 모달 다이얼로그
- **Drawer** - 하단에서 올라오는 드로어
- **Sheet** - 좌우에서 슬라이드되는 사이드 패널
- **Popover** - 팝오버 메뉴
- **Tooltip** - 툴팁
- **Accordion** - 접을 수 있는 패널
- **Dock** - 독 스타일 네비게이션 바

---

## 📄 라이선스

MIT © [Innopers](https://github.com/Innopers)

<br/>
<br/>

---

<br/>
<br/>

# 🇺🇸 English

## 📚 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Theme Customization](#-theme-customization)
- [Components](#-components)
- [License](#-license)

---

## ✨ Features

- 🎨 **16 High-Quality Components** - Carefully crafted for webview applications
- 💪 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🎭 **Customizable** - Easy theming with CSS variables
- 📱 **Mobile Optimized** - Touch-friendly interactions and responsive design
- ♿ **Accessible** - WCAG 2.1 AA compliant components
- 🎯 **Tree-shakeable** - Import only what you need
- 📖 **Well Documented** - Comprehensive docs with live examples via Storybook

---

## 📦 Installation

### Requirements

- **React**: 18.0.0 or higher (React 18 or React 19)
- **React DOM**: 18.0.0 or higher

```bash
# npm
npm install motile-ui

# yarn
yarn add motile-ui

# pnpm
pnpm add motile-ui
```

---

## 🚀 Quick Start

```tsx
import { Button, Input, Modal } from "motile-ui";

function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        Click me
      </Button>

      <Input label="Email" placeholder="Enter your email" type="email" />

      <Modal open={true} onClose={() => {}}>
        <h2>Hello Motile UI!</h2>
      </Modal>
    </div>
  );
}
```

---

## 🎨 Theme Customization

Motile UI allows easy theme customization through CSS variables.

### Global Theme Color

Set the default color applied to all components:

```css
:root {
  --motile-theme: #3b82f6; /* Default color for all components */
}
```

### Component-Specific Global Colors

Set global colors for specific component types:

```css
:root {
  /* Buttons */
  --motile-ui-btn: #10b981; /* All button variants color */

  /* Input Fields */
  --motile-ui-input: #8b5cf6; /* Input focus color */
  --motile-ui-textarea: #ec4899; /* Textarea focus color */

  /* Selection Controls */
  --motile-ui-checkbox: #f59e0b; /* Checkbox checked color */
  --motile-ui-switch: #14b8a6; /* Switch active color */

  /* Other Components */
  --motile-ui-badge: #ef4444; /* Badge background color */
  --motile-ui-tooltip: #1f2937; /* Tooltip background color */
  --motile-ui-popover: #3b82f6; /* Popover highlight color */
  --motile-ui-dock: #3b82f6; /* Dock highlight color */
}
```

### Individual Component Colors

Apply different colors to each component instance:

```tsx
<Button
  color="#ef4444"
  variant="primary"
>
  Red Button
</Button>

<Input
  color="#8b5cf6"
  label="Purple Input Field"
/>

<Checkbox
  color="#f59e0b"
  label="Orange Checkbox"
/>
```

### Priority Order

Color application priority:

```
Individual Component Color > Component Type Global Color > Global Theme Color > Default Color
```

Example:

```
--motile-btn-color > --motile-ui-btn > --motile-theme > #3b82f6 (default)
```

---

## 🎨 Components

- **Button** - Button with various variants and sizes
- **Input** - Text input field with label and validation
- **Textarea** - Multi-line text input field
- **Checkbox** - Checkbox input
- **Switch** - Toggle switch
- **Badge** - Status badge indicator
- **Toast** - Notification message
- **Skeleton** - Loading state placeholder
- **SpeedDial** - Floating action button
- **Modal** - Modal dialog
- **Drawer** - Bottom-up drawer panel
- **Sheet** - Side panel that slides from left or right
- **Popover** - Popover menu
- **Tooltip** - Tooltip
- **Accordion** - Collapsible panel
- **Dock** - Dock-style navigation bar

---

## 📄 License

MIT © [Innopers](https://github.com/Innopers)
