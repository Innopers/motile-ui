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
- [컴포넌트](#-컴포넌트)
- [라이선스](#-라이선스)

---

## ✨ 주요 기능

- 🎨 **17개의 고품질 컴포넌트** - 웹뷰 애플리케이션을 위해 세심하게 제작
- 💪 **TypeScript 우선** - 포괄적인 타입 정의 완벽 지원
- 🎭 **커스터마이징 가능** - CSS 변수로 쉬운 테마 설정
- 📱 **모바일 최적화** - 터치 친화적 인터랙션과 반응형 디자인
- ♿ **접근성** - WCAG 2.1 AA 준수 컴포넌트
- 🎯 **트리쉐이킹 지원** - 필요한 것만 import
- 📖 **풍부한 문서** - Storybook을 통한 라이브 예제 제공

---

## 📦 설치

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
import { Button, Input, Modal } from 'motile-ui'

function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        클릭하세요
      </Button>

      <Input
        label="이메일"
        placeholder="이메일을 입력하세요"
        type="email"
      />

      <Modal open={true} onClose={() => {}}>
        <h2>안녕하세요 Motile UI!</h2>
      </Modal>
    </div>
  )
}
```

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
- **Drawer** - 사이드 패널
- **Sheet** - 하단 시트
- **Popover** - 팝오버 메뉴
- **Tooltip** - 툴팁
- **Accordion** - 접을 수 있는 패널
- **Dock** - 하단 네비게이션 바

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
- [Components](#-components)
- [License](#-license)

---

## ✨ Features

- 🎨 **17 High-Quality Components** - Carefully crafted for webview applications
- 💪 **TypeScript First** - Full TypeScript support with comprehensive type definitions
- 🎭 **Customizable** - Easy theming with CSS variables
- 📱 **Mobile Optimized** - Touch-friendly interactions and responsive design
- ♿ **Accessible** - WCAG 2.1 AA compliant components
- 🎯 **Tree-shakeable** - Import only what you need
- 📖 **Well Documented** - Comprehensive docs with live examples via Storybook

---

## 📦 Installation

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
import { Button, Input, Modal } from 'motile-ui'

function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        Click me
      </Button>

      <Input
        label="Email"
        placeholder="Enter your email"
        type="email"
      />

      <Modal open={true} onClose={() => {}}>
        <h2>Hello Motile UI!</h2>
      </Modal>
    </div>
  )
}
```

---

## 🎨 Components

- **Button** - Button with various variants and sizes
- **Input** - Text input field with label and validation
- **Textarea** - Multi-line text input field
- **Checkbox** - Checkbox input
- **Switch** - Toggle switch
- **Select** - Dropdown select menu
- **Badge** - Status badge indicator
- **Toast** - Notification message
- **Skeleton** - Loading state placeholder
- **SpeedDial** - Floating action button
- **Modal** - Modal dialog
- **Drawer** - Side panel
- **Sheet** - Bottom sheet
- **Popover** - Popover menu
- **Tooltip** - Tooltip
- **Accordion** - Collapsible panel
- **Dock** - Bottom navigation bar

---

## 📄 License

MIT © [Innopers](https://github.com/Innopers)
