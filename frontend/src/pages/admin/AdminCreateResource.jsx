import React, { useState } from 'react'
import { Container, Card, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import ResourceForm from '../../components/resources/ResourceForm'
import broadcastSync, { SYNC_EVENTS } from '../../utils/broadcastSync'

const AdminCreateResource = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: async (payload) => axios.post('/api/resources', payload),
    onSuccess: () => {
      toast.success('Ресурс успішно створено')
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_CREATED, {})
      navigate('/admin/resources')
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Помилка створення ресурсу')
    }
  })

  const handleSubmit = (formData) => {
    setError('')
    const { title, description, category, url, tags } = formData
    createMutation.mutate({
      title,
      description,
      category,
      url: url || undefined,
      tags: Array.isArray(tags) ? tags : []
    })
  }

  return (
    <Container style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card style={{ backgroundColor: '#16213e', border: '1px solid #2d3748' }}>
            <Card.Header style={{ backgroundColor: '#1a1a2e', borderBottom: '1px solid #2d3748' }}>
              <h3 style={{ color: '#e2e8f0', margin: 0 }}>Створити ресурс (адмін)</h3>
            </Card.Header>
            <Card.Body className="text-light">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              <ResourceForm
                mode="create"
                hideModerationNotice
                submitLabel="Створити ресурс"
                isLoading={createMutation.isPending}
                onSubmit={handleSubmit}
              />
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default AdminCreateResource
