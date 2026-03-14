import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom'
import { Container, Navbar, Nav, Button, Card, Row, Col } from 'react-bootstrap'
import { Book, Search, People } from 'react-bootstrap-icons'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Resources from './pages/Resources'
import ResourceDetail from './pages/ResourceDetail'
import Profile from './pages/Profile'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminResources from './pages/admin/AdminResources'
import AdminUsers from './pages/admin/AdminUsers'
import AdminRoute from './components/AdminRoute'

// Головна сторінка
const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

        <Row className="mt-5 g-4">
          <Col md={4}>
            <Card
              className="h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/resources')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d3748';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Card.Body style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <Book size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <Card.Title style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>
                  Освітні ресурси
                </Card.Title>
                <Card.Text style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Знаходьте та діліться корисними матеріалами для навчання
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/resources')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d3748';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Card.Body style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <Search size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <Card.Title style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>
                  Пошук та фільтрація
                </Card.Title>
                <Card.Text style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Швидко знаходьте потрібні ресурси за категоріями
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card
              className="h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/resources')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d3748';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Card.Body style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <People size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <Card.Title style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 600, marginBottom: '10px' }}>
                  Спільнота
                </Card.Title>
                <Card.Text style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Приєднуйтесь до спільноти та обмінюйтесь знаннями
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
      <Navbar expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Ресурсний центр
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto" style={{ gap: '1.5rem', alignItems: 'center' }}>
              <Nav.Link 
                as={NavLink} 
                to="/"
                style={({ isActive }) => ({
                  color: isActive ? '#a78bfa' : '#94a3b8',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                  paddingBottom: '4px'
                })}
              >
                Головна
              </Nav.Link>
              <Nav.Link 
                as={NavLink} 
                to="/resources"
                style={({ isActive }) => ({
                  color: isActive ? '#a78bfa' : '#94a3b8',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                  paddingBottom: '4px'
                })}
              >
                Ресурси
              </Nav.Link>
              {user ? (
                <>
                  <Nav.Link 
                    as={NavLink} 
                    to="/profile"
                    style={({ isActive }) => ({
                      color: isActive ? '#a78bfa' : '#94a3b8',
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                      paddingBottom: '4px'
                    })}
                  >
                    Профіль
                  </Nav.Link>
                  {user.role === 'admin' && (
                    <Nav.Link 
                      as={NavLink} 
                      to="/admin"
                      style={({ isActive }) => ({
                        color: isActive ? '#a78bfa' : '#94a3b8',
                        fontWeight: isActive ? 600 : 400,
                        borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                        paddingBottom: '4px'
                      })}
                    >
                      Адмін панель
                    </Nav.Link>
                  )}
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
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
      
      <footer className="py-4 mt-auto">
        <Container>
          <div className="text-center">
            <p className="mb-0 text-muted">&copy; 2024 Ресурсний центр. Всі права захищені.</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
