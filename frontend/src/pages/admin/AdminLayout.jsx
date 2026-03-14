import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Nav, Card } from 'react-bootstrap'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FiUsers, FiBook, FiBarChart2, FiHome } from 'react-icons/fi'

const AdminLayout = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    
    // Check if user is admin
    if (userData.role !== 'admin') {
      navigate('/')
      return
    }

    setUser(userData)
  }, [navigate])

  if (!user) {
    return null
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="mb-4">
          <Card className="sidebar">
            <Card.Body>
              <h5 className="mb-4">Адмін панель</h5>
              <Nav className="flex-column">
                <Nav.Link 
                  as={Link} 
                  to="/admin" 
                  className={isActive('/admin')}
                >
                  <FiBarChart2 className="me-2" />
                  Статистика
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/admin/resources" 
                  className={isActive('/admin/resources')}
                >
                  <FiBook className="me-2" />
                  Ресурси
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/admin/users" 
                  className={isActive('/admin/users')}
                >
                  <FiUsers className="me-2" />
                  Користувачі
                </Nav.Link>
                <hr />
                <Nav.Link as={Link} to="/">
                  <FiHome className="me-2" />
                  На головну
                </Nav.Link>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  )
}

export default AdminLayout
