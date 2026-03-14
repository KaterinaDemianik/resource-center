import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FiHeart, FiGithub, FiMail } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5>Ресурсний центр</h5>
            <p className="text-muted">
              Платформа для обміну освітніми та корисними ресурсами. 
              Знаходьте, діліться та відкривайте нові можливості для навчання.
            </p>
          </Col>
          <Col md={3}>
            <h6>Посилання</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted text-decoration-none">Головна</a></li>
              <li><a href="/resources" className="text-muted text-decoration-none">Ресурси</a></li>
              <li><a href="/about" className="text-muted text-decoration-none">Про нас</a></li>
              <li><a href="/contact" className="text-muted text-decoration-none">Контакти</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Контакти</h6>
            <div className="d-flex flex-column">
              <a href="mailto:info@resourcecenter.com" className="text-muted text-decoration-none mb-2">
                <FiMail className="me-2" />
                info@resourcecenter.com
              </a>
              <a href="https://github.com" className="text-muted text-decoration-none">
                <FiGithub className="me-2" />
                GitHub
              </a>
            </div>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center">
            <p className="mb-0 text-muted">
              © 2026 Ресурсний центр. Зроблено з <FiHeart className="text-danger" /> для освіти.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
