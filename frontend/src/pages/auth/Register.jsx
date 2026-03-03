import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi'

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const password = watch('password')

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.message || 'Помилка реєстрації')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow">
              <Card.Body className="p-4 text-center">
                <div className="text-success mb-3">
                  <FiUserPlus size={48} />
                </div>
                <h4 className="fw-bold text-success">Реєстрація успішна!</h4>
                <p className="text-muted">
                  Перевірте свою електронну пошту та підтвердіть акаунт, 
                  щоб завершити реєстрацію.
                </p>
                <p className="small text-muted">
                  Через 3 секунди ви будете перенаправлені на сторінку входу...
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FiUserPlus size={48} className="text-primary mb-3" />
                <h3 className="fw-bold">Реєстрація</h3>
                <p className="text-muted">Створіть новий акаунт</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiUser className="me-2" />
                        Ім'я
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Введіть ім'я"
                        {...register('firstName', {
                          required: 'Ім\'я обов\'язкове',
                          maxLength: {
                            value: 50,
                            message: 'Ім\'я не може перевищувати 50 символів'
                          }
                        })}
                        isInvalid={!!errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FiUser className="me-2" />
                        Прізвище
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Введіть прізвище"
                        {...register('lastName', {
                          required: 'Прізвище обов\'язкове',
                          maxLength: {
                            value: 50,
                            message: 'Прізвище не може перевищувати 50 символів'
                          }
                        })}
                        isInvalid={!!errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiMail className="me-2" />
                    Електронна пошта
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Введіть email"
                    {...register('email', {
                      required: 'Email обов\'язковий',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Невірний формат email'
                      }
                    })}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiLock className="me-2" />
                    Пароль
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Введіть пароль"
                    {...register('password', {
                      required: 'Пароль обов\'язковий',
                      minLength: {
                        value: 6,
                        message: 'Пароль повинен містити мінімум 6 символів'
                      }
                    })}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <FiLock className="me-2" />
                    Підтвердження паролю
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Підтвердіть пароль"
                    {...register('confirmPassword', {
                      required: 'Підтвердження паролю обов\'язкове',
                      validate: value => 
                        value === password || 'Паролі не співпадають'
                    })}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Вже маєте акаунт?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Увійти
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Register
