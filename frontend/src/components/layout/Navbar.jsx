import React from 'react'
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiSettings, FiLogOut, FiHome, FiBook, FiUserPlus, FiLogIn } from 'react-icons/fi'

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand className="fw-bold text-primary">
            <FiBook className="me-2" />
            Ресурсний центр
          </BootstrapNavbar.Brand>
        </LinkContainer>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>
                <FiHome className="me-1" />
                Головна
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/resources">
              <Nav.Link>
                <FiBook className="me-1" />
                Ресурси
              </Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <LinkContainer to="/admin">
                    <Nav.Link className="text-warning">
                      <FiSettings className="me-1" />
                      Адмін панель
                    </Nav.Link>
                  </LinkContainer>
                )}
                <NavDropdown 
                  title={
                    <span>
                      <FiUser className="me-1" />
                      {user?.firstName} {user?.lastName}
                    </span>
                  } 
                  id="user-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>
                      <FiUser className="me-2" />
                      Профіль
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FiLogOut className="me-2" />
                    Вийти
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>
                    <Button variant="outline-primary" size="sm">
                      <FiLogIn className="me-1" />
                      Вхід
                    </Button>
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>
                    <Button variant="primary" size="sm">
                      <FiUserPlus className="me-1" />
                      Реєстрація
                    </Button>
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
