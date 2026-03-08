import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Валідація email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валідація форми на клієнті
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email є обов\'язковим полем';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Введіть коректний email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль є обов\'язковим полем';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має містити мінімум 6 символів';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обробка зміни полів форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаємо помилку поля при введенні
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setServerError('');
  };

  // Обробка відправки форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Зберігаємо токен
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setSuccessMessage('Вхід успішний! Перенаправлення...');
        
        // Перенаправляємо на головну сторінку
        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 1000);
      } else {
        setServerError(data.message || 'Помилка входу. Перевірте дані.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Вхід</h2>
                <p className="text-muted">Увійдіть до свого облікового запису</p>
              </div>

              {serverError && (
                <Alert variant="danger" dismissible onClose={() => setServerError('')}>
                  {serverError}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success">
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Email адреса</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Введіть пароль"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Вхід...
                      </>
                    ) : (
                      'Увійти'
                    )}
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Немає облікового запису?{' '}
                  <Link to="/register" className="text-primary fw-semibold">
                    Зареєструватися
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
