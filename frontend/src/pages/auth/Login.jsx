import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        setError(result.message || 'Помилка входу')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FiLogIn size={48} className="text-primary mb-3" />
                <h3 className="fw-bold">Вхід до системи</h3>
                <p className="text-muted">Введіть свої дані для входу</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)}>
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

                <Form.Group className="mb-4">
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

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Вхід...' : 'Увійти'}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Немає акаунту?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Зареєструватися
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

export default Login
