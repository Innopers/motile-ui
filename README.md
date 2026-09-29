<div align="center">
  <img src="https://github.com/Innopers.png" alt="Motile UI Logo" width="200"/>

# Motile UI

**웹뷰 애플리케이션을 위한 모던 React 컴포넌트 라이브러리**

[![npm version](https://img.shields.io/npm/v/motile-ui.svg?style=flat-square)](https://www.npmjs.com/package/motile-ui)
[![npm downloads](https://img.shields.io/npm/dm/motile-ui.svg?style=flat-square)](https://www.npmjs.com/package/motile-ui)
[![license](https://img.shields.io/npm/l/motile-ui.svg?style=flat-square)](https://github.com/Innopers/motile-ui/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Website](https://img.shields.io/badge/Website-motile--ui.site-green?style=flat-square)](https://www.motile-ui.site/)

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

- 🎨 **20개의 고품질 컴포넌트** - 웹뷰 애플리케이션을 위해 세심하게 제작
- 💪 **TypeScript 우선** - 포괄적인 타입 정의 완벽 지원
- 🎭 **커스터마이징 가능** - CSS 변수로 쉬운 테마 설정
- 🌓 **다크 모드** - OS 설정 또는 `data-theme` 속성으로 라이트·다크 전환
- 📱 **모바일 최적화** - 터치 친화적 인터랙션과 반응형 디자인
- ♿ **접근성** - WCAG 2.1 AA 준수 컴포넌트
- 🎯 **트리쉐이킹 지원** - 필요한 것만 import
- 🧅 **중첩 오버레이 안전** - Sheet 위 Sheet처럼 오버레이가 겹쳐도 뒤로가기·ESC·스크롤 잠금이 한 겹씩 정확히 동작
- ⌨️ **스크롤 시 키보드 닫기** - 모바일에서 입력에 포커스한 채 스크롤하면 소프트 키보드를 자동으로 닫음 (useAutoBlur 훅 · autoBlur prop)
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
  --motile-ui-select: #3b82f6; /* Select 포커스 색상 */

  /* 선택 컨트롤 */
  --motile-ui-checkbox: #f59e0b; /* Checkbox 체크 색상 */
  --motile-ui-switch: #14b8a6; /* Switch 활성화 색상 */

  /* 네비게이션 */
  --motile-ui-tab: #3b82f6; /* Tab 활성화 색상 */
  --motile-ui-dock: #3b82f6; /* Dock 하이라이트 색상 */

  /* 오버레이 */
  --motile-ui-tooltip: #1f2937; /* Tooltip 배경 색상 */
  --motile-ui-popover: #3b82f6; /* Popover 강조 색상 */

  /* 기타 컴포넌트 */
  --motile-ui-badge: #ef4444; /* Badge 배경 색상 */
  --motile-ui-speeddial: #3b82f6; /* SpeedDial 버튼 색상 */
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
color props > 컴포넌트 타입 전역 색상 > 전역 테마 색상 > 기본 색상
```

예시:

```
color props > --motile-ui-btn > --motile-theme > #3b82f6 (기본값)
```

### 다크 모드

OS 설정을 자동으로 따릅니다. `<html>`의 `data-theme` 속성으로 직접 지정할 수도 있습니다:

```html
<html data-theme="dark">  <!-- 항상 다크 -->
<html data-theme="light"> <!-- 항상 라이트 (OS가 다크여도) -->
<html>                    <!-- OS 설정을 따름 -->
```

다크 모드를 지원하지 않는 앱은 `<html data-theme="light">`로 고정하세요. 고정하지 않으면 OS가 다크일 때 컴포넌트가 다크로 표시됩니다.

바탕·글자·테두리 같은 중성색은 팔레트 변수로 정해져 있어 덮어쓸 수 있습니다. 회색 번호는 바탕과의 대비 순서라 다크에서는 값이 뒤집힙니다 (`--motile-gray-900`은 라이트에서 거의 검정, 다크에서 거의 흰색).

```css
:root {
  --motile-bg: #ffffff; /* 바탕 */
  --motile-gray-200: #e5e7eb; /* 테두리 (--motile-gray-50 ~ 900) */
  --motile-gray-900: #111827; /* 본문 글자 */
  --motile-error-bg: #fef5f5; /* 에러 상태 입력 필드 바탕 */
}

/* :root 값은 다크에도 그대로 쓰이므로 다크 값을 따로 지정 */
:root[data-theme="dark"] {
  --motile-bg: #151618;
}

/* OS 설정을 따를 때만 필요 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --motile-bg: #151618;
  }
}
```

`--motile-theme`과 컴포넌트별 색상은 라이트·다크 공통입니다. 다크에서 다른 색을 쓰려면 위처럼 다크 선택자 안에서 지정하세요.

---

## 🎨 컴포넌트

- **Button** - 다양한 variant와 size를 지원하는 버튼
- **Input** - 라벨과 검증 기능이 있는 텍스트 입력 필드
- **Textarea** - 여러 줄 텍스트 입력 필드
- **Checkbox** - 체크박스 입력
- **Switch** - 토글 스위치
- **Select** - 드롭다운 선택 메뉴
- **Badge** - 상태 표시 배지
- **Toast** - 알림 메시지
- **Skeleton** - 로딩 상태 플레이스홀더
- **SpeedDial** - 플로팅 액션 버튼
- **Modal** - 모달 다이얼로그
- **Drawer** - 하단에서 올라오는 드로어
- **Sheet** - 좌우에서 슬라이드되는 사이드 패널
- **Popover** - 팝오버 메뉴
- **Tooltip** - 툴팁
- **Tab** - 콘텐츠 전환 탭
- **Accordion** - 접을 수 있는 패널
- **Dock** - 독 스타일 네비게이션 바
- **NumberFlow** - 숫자 애니메이션 컴포넌트
- **TimePicker** - 휠 스크롤 방식 타임피커

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

- 🎨 **20 High-Quality Components** - Carefully crafted for webview applications
- 💪 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🎭 **Customizable** - Easy theming with CSS variables
- 🌓 **Dark Mode** - Switches between light and dark via the OS setting or the `data-theme` attribute
- 📱 **Mobile Optimized** - Touch-friendly interactions and responsive design
- ♿ **Accessible** - WCAG 2.1 AA compliant components
- 🎯 **Tree-shakeable** - Import only what you need
- 🧅 **Nesting-Safe Overlays** - Back navigation, ESC, and scroll lock peel one layer at a time when overlays stack (e.g. Sheet over Sheet)
- ⌨️ **Dismiss Keyboard on Scroll** - On mobile, scrolling with an input focused auto-dismisses the soft keyboard (useAutoBlur hook · autoBlur prop)
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
  --motile-ui-select: #3b82f6; /* Select focus color */

  /* Selection Controls */
  --motile-ui-checkbox: #f59e0b; /* Checkbox checked color */
  --motile-ui-switch: #14b8a6; /* Switch active color */

  /* Navigation */
  --motile-ui-tab: #3b82f6; /* Tab active color */
  --motile-ui-dock: #3b82f6; /* Dock highlight color */

  /* Overlays */
  --motile-ui-tooltip: #1f2937; /* Tooltip background color */
  --motile-ui-popover: #3b82f6; /* Popover highlight color */

  /* Other Components */
  --motile-ui-badge: #ef4444; /* Badge background color */
  --motile-ui-speeddial: #3b82f6; /* SpeedDial button color */
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
color props > Component Type Global Color > Global Theme Color > Default Color
```

Example:

```
color props > --motile-ui-btn > --motile-theme > #3b82f6 (default)
```

### Dark Mode

Motile UI follows the OS setting automatically. You can also set it explicitly with the `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">  <!-- Always dark -->
<html data-theme="light"> <!-- Always light (even when the OS is dark) -->
<html>                    <!-- Follows the OS setting -->
```

If your app does not support dark mode, lock it with `<html data-theme="light">`. Otherwise, components render dark when the OS is dark.

Neutral colors such as backgrounds, text, and borders come from palette variables you can override. Gray steps are ordered by contrast against the background, so their values flip in dark mode (`--motile-gray-900` is near-black in light and near-white in dark).

```css
:root {
  --motile-bg: #ffffff; /* Background */
  --motile-gray-200: #e5e7eb; /* Border (--motile-gray-50 ~ 900) */
  --motile-gray-900: #111827; /* Body text */
  --motile-error-bg: #fef5f5; /* Input background in the error state */
}

/* :root values also apply in dark mode, so set dark values separately */
:root[data-theme="dark"] {
  --motile-bg: #151618;
}

/* Only needed when following the OS setting */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --motile-bg: #151618;
  }
}
```

`--motile-theme` and the component colors are shared by light and dark. To use a different color in dark mode, set it inside the dark selectors as shown above.

---

## 🎨 Components

- **Button** - Button with various variants and sizes
- **Input** - Text input field with label and validation
- **Textarea** - Multi-line text input field
- **Checkbox** - Checkbox input
- **Switch** - Toggle switch
- **Select** - Dropdown selection menu
- **Badge** - Status badge indicator
- **Toast** - Notification message
- **Skeleton** - Loading state placeholder
- **SpeedDial** - Floating action button
- **Modal** - Modal dialog
- **Drawer** - Bottom-up drawer panel
- **Sheet** - Side panel that slides from left or right
- **Popover** - Popover menu
- **Tooltip** - Tooltip
- **Tab** - Content switching tabs
- **Accordion** - Collapsible panel
- **Dock** - Dock-style navigation bar
- **NumberFlow** - Animated number transition component
- **TimePicker** - Wheel scroll style time picker

---

## 📄 License

MIT © [Innopers](https://github.com/Innopers)
