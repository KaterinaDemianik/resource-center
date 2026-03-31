import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          if (data.alreadyVerified) {
            setMessage('Email підтверджено. Ви можете увійти в систему.');
          } else {
            setMessage(data.message || 'Email успішно підтверджено!');
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Помилка підтвердження email');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Помилка з\'єднання з сервером');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Невірне посилання підтвердження');
    }
  }, [token]);

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow">
            <Card.Body className="p-5 text-center">
              {status === 'verifying' && (
                <>
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h3 className="mb-3">Підтвердження email...</h3>
                  <p className="text-muted">Будь ласка, зачекайте</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="mb-4">
                    <div 
                      style={{ 
                        fontSize: '4rem', 
                        color: '#28a745' 
                      }}
                    >
                    </div>
                  </div>
                  <h3 className="text-success mb-3">Email підтверджено!</h3>
                  <Alert variant="success">
                    {message}
                  </Alert>
                  <p className="text-muted mb-4">
                    Ваш обліковий запис активовано.
                  </p>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Перейти до входу
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="mb-4">
                    <div 
                      style={{ 
                        fontSize: '4rem', 
                        color: '#dc3545' 
                      }}
                    >
                    </div>
                  </div>
                  <h3 className="text-danger mb-3">Помилка підтвердження</h3>
                  <Alert variant="danger">
                    {message}
                  </Alert>
                  <p className="text-muted mb-4">
                    Можливо, посилання застаріло або вже використане.
                  </p>
                  <div className="d-grid gap-2">
                    <Link to="/register" className="btn btn-outline-primary">
                      Зареєструватися знову
                    </Link>
                    <Link to="/login" className="btn btn-outline-secondary">
                      Спробувати увійти
                    </Link>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default VerifyEmail;
