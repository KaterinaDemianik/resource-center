import React, { useEffect } from 'react'
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { Book, Search } from 'react-bootstrap-icons'
import { FiPlus, FiBell } from 'react-icons/fi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from './contexts/AuthContext.jsx'
import ApiToggle from './components/ApiToggle'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ResourcesWithApi from './pages/ResourcesWithApi'
import ResourceDetail from './pages/ResourceDetail'
import Profile from './pages/Profile'
import CreateResource from './pages/CreateResource'
import EditResource from './pages/EditResource'
import Notifications from './pages/Notifications'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminResources from './pages/admin/AdminResources'
import AdminUsers from './pages/admin/AdminUsers'
import AdminCreateResource from './pages/admin/AdminCreateResource'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Головна сторінка
const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

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

        <div className="row mt-5 g-4 justify-content-center">
          <div className="col-md-4">
            <div
              role="button"
              tabIndex={0}
              className="card h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/resources')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/resources')}
            >
              <div className="card-body text-center" style={{ padding: '2rem 1.5rem' }}>
                <Book size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <h5 style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '10px' }}>
                  Освітні ресурси
                </h5>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Знаходьте та діліться корисними матеріалами для навчання
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              role="button"
              tabIndex={0}
              className="card h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/resources')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/resources')}
            >
              <div className="card-body text-center" style={{ padding: '2rem 1.5rem' }}>
                <Search size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <h5 style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '10px' }}>
                  Пошук та фільтрація
                </h5>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Швидко знаходьте потрібні ресурси за категоріями
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div
              role="button"
              tabIndex={0}
              className="card h-100"
              style={{
                backgroundColor: '#16213e',
                border: '1px solid #2d3748',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (user) navigate('/create-resource')
                else navigate('/login')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (user) navigate('/create-resource')
                  else navigate('/login')
                }
              }}
            >
              <div className="card-body text-center" style={{ padding: '2rem 1.5rem' }}>
                <FiPlus size={32} color="#a78bfa" style={{ marginBottom: '12px' }} />
                <h5 style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '10px' }}>
                  Додати ресурс
                </h5>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                  Поділіться корисними матеріалами зі спільнотою
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

function App() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) return null
      try {
        const response = await axios.get('/api/auth/me')
        if (response.data.success) {
          return response.data.user
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
      return null
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })

  const displayUser = userData || user

  const {
    data: unreadData,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['unreadCount', token],
    queryFn: async () => {
      if (!token) return { count: 0 }
      try {
        const response = await axios.get('/api/notifications/unread-count', {
          params: { t: Date.now() },
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0'
          }
        })
        return response.data
      } catch {
        return { count: 0 }
      }
    },
    enabled: !!token,
    refetchInterval: 10000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  })

  const unreadCount = Number(unreadData?.count || 0)

  useEffect(() => {
    if (!token || !(userData || user)) return

    queryClient.setQueryData(['unreadCount', token], (current) => current || { count: 0 })
    refetchUnreadCount()
  }, [token, userData, user, queryClient, refetchUnreadCount])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Ресурсний центр
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.35)',
              boxShadow: 'none'
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2.5' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`
              }}
            />
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto" style={{ gap: '1.5rem', alignItems: 'center' }}>
              <ApiToggle />
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
              {displayUser && (
                <Nav.Link
                  as={NavLink}
                  to="/create-resource"
                  style={({ isActive }) => ({
                    color: isActive ? '#a78bfa' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                    paddingBottom: '4px'
                  })}
                >
                  Додати ресурс
                </Nav.Link>
              )}
              {displayUser && (
                <Nav.Link
                  as={NavLink}
                  to="/notifications"
                  style={({ isActive }) => ({
                    color: isActive ? '#a78bfa' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive ? '2px solid #7c3aed' : 'none',
                    paddingBottom: '4px',
                    position: 'relative'
                  })}
                >
                  <span
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingRight: unreadCount > 0 ? '10px' : 0
                    }}
                  >
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '-16px',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          borderRadius: '999px',
                          padding: '3px 7px',
                          fontSize: '11px',
                          fontWeight: 700,
                          minWidth: '24px',
                          minHeight: '24px',
                          lineHeight: 1.5,
                          textAlign: 'center',
                          boxShadow: '0 0 0 2px #0f172a, 0 4px 12px rgba(220, 38, 38, 0.45)',
                          border: '2px solid #ffffff',
                          zIndex: 3,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                </Nav.Link>
              )}
              {displayUser ? (
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
                  {displayUser.role === 'admin' && (
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
                    {displayUser.firstName} {displayUser.lastName}
                  </span>
                  <Button variant="outline-light" size="sm" onClick={handleLogout}>
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
          <Route path="/resources" element={<ResourcesWithApi />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route
            path="/create-resource"
            element={
              <ProtectedRoute>
                <CreateResource />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-resource/:id"
            element={
              <ProtectedRoute>
                <EditResource />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="create-resource" element={<AdminCreateResource />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>

      <footer className="py-4 mt-auto">
        <Container>
          <div className="text-center">
            <p className="mb-0 text-muted">&copy; 2026 Ресурсний центр. Всі права захищені.</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default App
