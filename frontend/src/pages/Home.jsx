import React from 'react'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { FiBook, FiUsers, FiTrendingUp, FiSearch } from 'react-icons/fi'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Ласкаво просимо до Ресурсного центру
              </h1>
              <p className="lead mb-4">
                Відкрийте для себе найкращі освітні ресурси, поділіться знаннями 
                та розширте свої можливості навчання разом з нашою спільнотою.
              </p>
              <div className="d-flex gap-3">
                <LinkContainer to="/resources">
                  <Button variant="light" size="lg">
                    <FiSearch className="me-2" />
                    Переглянути ресурси
                  </Button>
                </LinkContainer>
                {!isAuthenticated && (
                  <LinkContainer to="/register">
                    <Button variant="outline-light" size="lg">
                      Приєднатися
                    </Button>
                  </LinkContainer>
                )}
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="hero-image">
                <FiBook size={200} className="text-white opacity-75" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <Container className="my-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Чому обирають наш ресурсний центр?</h2>
            <p className="text-muted">
              Ми створили платформу, яка допомагає користувачам знаходити та ділитися якісними ресурсами
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <FiBook size={48} className="text-primary" />
                </div>
                <Card.Title>Якісні ресурси</Card.Title>
                <Card.Text className="text-muted">
                  Всі ресурси проходять модерацію для забезпечення високої якості 
                  та актуальності інформації.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <FiUsers size={48} className="text-success" />
                </div>
                <Card.Title>Активна спільнота</Card.Title>
                <Card.Text className="text-muted">
                  Приєднуйтесь до спільноти освітян та професіоналів, які діляться 
                  своїми знаннями та досвідом.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 text-center border-0 shadow-sm">
              <Card.Body className="p-4">
                <div className="mb-3">
                  <FiTrendingUp size={48} className="text-warning" />
                </div>
                <Card.Title>Постійний розвиток</Card.Title>
                <Card.Text className="text-muted">
                  Платформа постійно оновлюється новими функціями та можливостями 
                  для кращого користувацького досвіду.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Statistics Section */}
      <section className="bg-light py-5">
        <Container>
          <Row className="text-center">
            <Col md={3}>
              <div className="stats-card">
                <h3 className="fw-bold text-primary">1000+</h3>
                <p className="text-muted mb-0">Ресурсів</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stats-card">
                <h3 className="fw-bold text-success">500+</h3>
                <p className="text-muted mb-0">Користувачів</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stats-card">
                <h3 className="fw-bold text-warning">50+</h3>
                <p className="text-muted mb-0">Категорій</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="stats-card">
                <h3 className="fw-bold text-info">24/7</h3>
                <p className="text-muted mb-0">Доступність</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Container className="my-5">
          <Row>
            <Col className="text-center">
              <Card className="bg-primary text-white">
                <Card.Body className="p-5">
                  <h3 className="fw-bold mb-3">Готові розпочати?</h3>
                  <p className="lead mb-4">
                    Приєднуйтесь до нашої спільноти та отримайте доступ до тисяч корисних ресурсів
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <LinkContainer to="/register">
                      <Button variant="light" size="lg">
                        Зареєструватися безкоштовно
                      </Button>
                    </LinkContainer>
                    <LinkContainer to="/login">
                      <Button variant="outline-light" size="lg">
                        Увійти
                      </Button>
                    </LinkContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}
    </>
  )
}

export default Home
