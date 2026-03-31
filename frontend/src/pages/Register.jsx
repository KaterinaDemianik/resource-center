import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Register = () => {
  const { register: registerUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');

  // Функція для перевірки типових помилок та підказки
  const checkEmailTypo = (email) => {
    if (!email.includes('@')) return null;
    
    const domain = email.split('@')[1];
    const commonTypos = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'outlok.com': 'outlook.com',
      'hotmial.com': 'hotmail.com'
    };
    
    return commonTypos[domain?.toLowerCase()] || null;
  };

  // Валідація email
  const validateEmail = (email) => {
    // Перевірка базового формату
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    const [localPart, domain] = email.split('@');
    
    // Перевірка локальної частини
    if (localPart.length > 64) {
      return false; // Максимальна довжина локальної частини
    }
    
    // Перевірка на подвійні крапки
    if (localPart.includes('..') || domain.includes('..')) {
      return false;
    }
    
    // Перевірка на крапку на початку або в кінці
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }
    
    // Список одноразових/фейкових email доменів (блокуємо)
    const disposableDomains = [
      'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
      'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com'
    ];
    
    if (disposableDomains.includes(domain.toLowerCase())) {
      return false;
    }
    
    // Список популярних реальних доменів
    const validDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
      'ukr.net', 'i.ua', 'meta.ua', 'icloud.com', 'protonmail.com',
      'mail.ru', 'yandex.ru', 'yandex.ua'
    ];
    
    // Перевірка на типові помилки в популярних доменах
    const commonTypos = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'outlok.com': 'outlook.com',
      'hotmial.com': 'hotmail.com'
    };
    
    if (commonTypos[domain.toLowerCase()]) {
      return false; // Блокуємо типові помилки
    }
    
    // Якщо домен не в списку популярних, перевіряємо структуру
    if (!validDomains.includes(domain.toLowerCase())) {
      const domainParts = domain.split('.');
      
      // Домен має мати мінімум 2 частини
      if (domainParts.length < 2) {
        return false;
      }
      
      // Перевірка що всі частини не порожні та мають мінімум 2 символи
      if (domainParts.some(part => part.length < 2)) {
        return false;
      }
      
      // TLD має бути від 2 до 6 символів
      const tld = domainParts[domainParts.length - 1];
      if (tld.length < 2 || tld.length > 6) {
        return false;
      }
    }
    
    return true;
  };

  // Валідація форми на клієнті
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ім\'я є обов\'язковим полем';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'Ім\'я не може перевищувати 50 символів';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Прізвище є обов\'язковим полем';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Прізвище не може перевищувати 50 символів';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Підтвердіть пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
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
      const result = await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        setSuccessMessage('Реєстрація успішна! Перевірте вашу електронну пошту для підтвердження.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setServerError(result.message || 'Помилка реєстрації. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError('Помилка з\'єднання з сервером. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Реєстрація</h2>
                <p className="text-muted">Створіть новий обліковий запис</p>
              </div>

              {serverError && (
                <Alert variant="danger" dismissible onClose={() => setServerError('')}>
                  {serverError}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success">
                  {successMessage}
                  <hr />
                  <Link to="/login" className="alert-link">
                    Перейти до входу
                  </Link>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ім'я <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Введіть ім'я"
                        value={formData.firstName}
                        onChange={handleChange}
                        isInvalid={!!errors.firstName}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Прізвище <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Введіть прізвище"
                        value={formData.lastName}
                        onChange={handleChange}
                        isInvalid={!!errors.lastName}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email адреса <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const email = e.target.value;
                      if (email) {
                        const suggestion = checkEmailTypo(email);
                        if (suggestion) {
                          const localPart = email.split('@')[0];
                          setEmailSuggestion(`${localPart}@${suggestion}`);
                          setErrors(prev => ({
                            ...prev,
                            email: `Можливо ви мали на увазі: ${localPart}@${suggestion}?`
                          }));
                        } else if (!validateEmail(email)) {
                          setEmailSuggestion('');
                          setErrors(prev => ({
                            ...prev,
                            email: 'Введіть коректну email адресу (наприклад: name@gmail.com)'
                          }));
                        } else {
                          setEmailSuggestion('');
                        }
                      }
                    }}
                    isInvalid={!!errors.email}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    На цю адресу буде надіслано лист для підтвердження
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Пароль <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Мінімум 6 символів"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Підтвердження паролю <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Повторіть пароль"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
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
                        Реєстрація...
                      </>
                    ) : (
                      'Зареєструватися'
                    )}
                  </Button>
                </div>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Вже маєте обліковий запис?{' '}
                  <Link to="/login" className="text-primary fw-semibold">
                    Увійти
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

export default Register;
