import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

// Простий компонент для тестування
const SimpleHome = () => (
  <Container className="mt-5">
    <div className="text-center">
      <h1>🎯 Ресурсний центр</h1>
      <p className="lead">Веб-застосунок для обміну освітніми ресурсами</p>
      <div className="mt-4">
        <a href="/login" className="btn btn-primary me-3">Увійти</a>
        <a href="/register" className="btn btn-outline-primary">Реєстрація</a>
      </div>
    </div>
  </Container>
)

const SimpleLogin = () => (
  <Container className="mt-5">
    <h2>Вхід</h2>
    <p>Сторінка входу (в розробці)</p>
  </Container>
)

const SimpleRegister = () => (
  <Container className="mt-5">
    <h2>Реєстрація</h2>
    <p>Сторінка реєстрації (в розробці)</p>
  </Container>
)

function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">Ресурсний центр</a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="/">Головна</a>
            <a className="nav-link" href="/login">Вхід</a>
            <a className="nav-link" href="/register">Реєстрація</a>
          </div>
        </div>
      </nav>
      
      <main>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/register" element={<SimpleRegister />} />
        </Routes>
      </main>
      
      <footer className="bg-light mt-5 py-4">
        <Container>
          <div className="text-center text-muted">
            <p>&copy; 2024 Ресурсний центр. Всі права захищені.</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
