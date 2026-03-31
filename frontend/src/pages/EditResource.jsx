import React from 'react'
import { Container, Card, Alert } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ResourceForm from '../components/resources/ResourceForm'
import broadcastSync, { SYNC_EVENTS } from '../utils/broadcastSync'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useApi } from '../contexts/ApiContext.jsx'
import { fetchResource, updateResource } from '../services/apiService'

const EditResource = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const { apiMode } = useApi()
  const [error, setError] = React.useState('')

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['resource', id, apiMode],
    queryFn: () => fetchResource(id, apiMode, token),
    enabled: !!id
  })

  const resource = data?.data

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return updateResource(id, payload, apiMode, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_UPDATED, {})
      navigate('/resources')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Помилка оновлення ресурсу')
    }
  })

  const handleSubmit = (formPayload) => {
    setError('')
    const { title, description, category, url, tags } = formPayload
    updateMutation.mutate({
      title,
      description,
      category,
      url: url || undefined,
      tags: tags || []
    })
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center text-light">
        Завантаження...
      </Container>
    )
  }

  if (loadError || !resource) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Не вдалося завантажити ресурс для редагування.</Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card style={{ backgroundColor: '#16213e', border: '1px solid #2d3748' }}>
            <Card.Header style={{ backgroundColor: '#1a1a2e', borderBottom: '1px solid #2d3748' }}>
              <h3 style={{ color: '#e2e8f0', margin: 0 }}>Редагувати ресурс</h3>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              <ResourceForm
                mode="edit"
                initialData={{
                  title: resource.title,
                  description: resource.description,
                  category: resource.category,
                  url: resource.url || '',
                  tags: resource.tags || []
                }}
                submitLabel="Зберегти зміни"
                isLoading={updateMutation.isPending}
                onSubmit={handleSubmit}
              />
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default EditResource
