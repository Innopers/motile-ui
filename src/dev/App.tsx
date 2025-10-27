import React from 'react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Motile UI - Development</h1>
        <p>컴포넌트 라이브러리 개발 환경</p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Welcome to Motile UI</h2>
          <p>여기에 개발 중인 컴포넌트를 추가하세요.</p>
          <p>컴포넌트를 추가하면 이 페이지에서 테스트할 수 있습니다.</p>
        </div>

        <div className="info">
          <h3>개발 도구</h3>
          <ul>
            <li><code>npm run dev</code> - Vite 개발 서버 (현재)</li>
            <li><code>npm run storybook</code> - Storybook 문서</li>
            <li><code>npm run build</code> - 라이브러리 빌드</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
