import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import Profile from './pages/Profile'

// Головна сторінка
const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Container className="py-5">
      <div className="text-center">
        <h3 className="display-4 fw-bold text-primary mb-4">Ресурсний центр</h3>
        <p className="lead text-muted mb-4">
          Веб-застосунок для обміну освітніми та корисними ресурсами
        </p>
        
        {user ? (
          <div className="mt-4">
            <p className="h5">Вітаємо, {user.firstName} {user.lastName}!</p>
            <p className="text-muted">Ви успішно увійшли в систему</p>
          </div>
        ) : (
          <div className="mt-4">
            <Link to="/login" className="btn btn-primary btn-lg me-3">
              Увійти
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg me-3">
              Реєстрація
            </Link>
            <Link to="/resources" className="btn btn-success btn-lg">
              Переглянути ресурси
            </Link>
          </div>
        )}

        <div className="row mt-5">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Освітні ресурси</h5>
                <p className="card-text text-muted">
                  Знаходьте та діліться корисними матеріалами для навчання
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Пошук та фільтрація</h5>
                <p className="card-text text-muted">
                  Швидко знаходьте потрібні ресурси за категоріями
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Спільнота</h5>
                <p className="card-text text-muted">
                  Приєднуйтесь до спільноти та обмінюйтесь знаннями
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            Ресурсний центр
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Головна</Nav.Link>
              <Nav.Link as={Link} to="/resources">Ресурси</Nav.Link>
              {user ? (
                <>
                  <Nav.Link as={Link} to="/profile">Профіль</Nav.Link>
                  <span className="navbar-text text-light me-2">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button 
                    variant="outline-light" 
                    size="sm" 
                    onClick={handleLogout}
                  >
                    Вийти
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Вхід</Nav.Link>
                  <Nav.Link as={Link} to="/register">Реєстрація</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      
      <footer className="bg-light py-4 mt-auto">
        <Container>
          <div className="text-center text-muted">
            <p className="mb-0">&copy; 2024 Ресурсний центр. Всі права захищені.</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
