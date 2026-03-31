import React, { useState } from 'react'
import { Container, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiBell, FiCheck, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'

const Notifications = () => {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const response = await axios.get('/api/notifications', {
        params: { page, limit: 20 }
      })
      return response.data
    },
    enabled: !!token
  })

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      return axios.patch(`/api/notifications/${id}/read`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return axios.patch('/api/notifications/mark-all-read', {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`/api/notifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    }
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'resource_approved':
        return { icon: <FiCheckCircle />, color: 'success' }
      case 'resource_rejected':
        return { icon: <FiBell />, color: 'danger' }
      case 'resource_deactivated':
        return { icon: <FiBell />, color: 'warning' }
      case 'account_status':
        return { icon: <FiBell />, color: 'info' }
      default:
        return { icon: <FiBell />, color: 'primary' }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Щойно'
    if (diffMins < 60) return `${diffMins} хв тому`
    if (diffHours < 24) return `${diffHours} год тому`
    if (diffDays < 7) return `${diffDays} дн тому`
    return date.toLocaleDateString('uk-UA')
  }

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Помилка завантаження сповіщень: {error.message}
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#e2e8f0', fontWeight: 600 }}>
          <FiBell className="me-2" />
          Сповіщення
        </h2>
        {data?.pagination?.unreadCount > 0 && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <FiCheck className="me-1" />
            Позначити всі як прочитані
          </Button>
        )}
      </div>

      {data?.pagination?.total === 0 ? (
        <Card style={{ backgroundColor: '#16213e', border: '1px solid #2d3748' }}>
          <Card.Body className="text-center py-5">
            <FiBell size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
            <h5 style={{ color: '#94a3b8' }}>У вас поки немає сповіщень</h5>
            <p style={{ color: '#64748b' }}>
              Тут з'являтимуться повідомлення про важливі події
            </p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="mb-3">
            <small style={{ color: '#94a3b8' }}>
              Всього: {data?.pagination?.total} | Непрочитаних: {data?.pagination?.unreadCount}
            </small>
          </div>

          {data?.notifications?.map((notification) => {
            const { icon, color } = getNotificationIcon(notification.type)
            return (
              <Card
                key={notification._id}
                className="mb-3"
                style={{
                  backgroundColor: notification.isRead ? '#16213e' : '#1a1f3a',
                  border: notification.isRead ? '1px solid #2d3748' : '1px solid #4c1d95',
                  borderLeft: notification.isRead ? '4px solid #2d3748' : '4px solid #7c3aed'
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-3 flex-grow-1">
                      <div style={{ fontSize: '24px', color: `var(--bs-${color})` }}>
                        {icon}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 style={{ color: '#e2e8f0', margin: 0 }}>
                            {notification.title}
                          </h6>
                          {!notification.isRead && (
                            <Badge bg="primary" style={{ fontSize: '10px' }}>
                              Нове
                            </Badge>
                          )}
                        </div>
                        <p style={{ color: '#94a3b8', margin: '0.5rem 0' }}>
                          {notification.message}
                        </p>
                        <div className="d-flex gap-3 align-items-center">
                          <small style={{ color: '#64748b' }}>
                            {formatDate(notification.createdAt)}
                          </small>
                          {notification.relatedResource && (
                            <Link
                              to={`/resources/${notification.relatedResource._id}`}
                              style={{ fontSize: '13px' }}
                            >
                              Переглянути ресурс
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          title="Позначити як прочитане"
                        >
                          <FiCheck />
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteMutation.mutate(notification._id)}
                        disabled={deleteMutation.isPending}
                        title="Видалити"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )
          })}

          {data?.pagination?.pages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button
                variant="outline-primary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Попередня
              </Button>
              <span style={{ color: '#94a3b8', padding: '0.5rem 1rem' }}>
                Сторінка {page} з {data.pagination.pages}
              </span>
              <Button
                variant="outline-primary"
                disabled={page === data.pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Наступна
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  )
}

export default Notifications
