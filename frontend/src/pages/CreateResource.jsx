import React, { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

const CreateResource = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [resource, setResource] = useState({
    title: '',
    description: '',
    category: 'technology',
    urls: [''],
    tags: ''
  })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: async (resourceData) => {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Необхідна авторизація')
      }

      return axios.post('/api/resources', resourceData, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      // Автоматично оновлюємо всі пов'язані запити
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
      
      alert('Ресурс успішно створено!')
      navigate('/resources', { state: { activeTab: 'my' } })
    },
    onError: (error) => {
      if (error.message === 'Необхідна авторизація') {
        navigate('/login')
      } else {
        setError(error.response?.data?.message || 'Помилка створення ресурсу')
      }
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const tagsArray = resource.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    const urlsArray = resource.urls.filter(url => url.trim() !== '')
    
    createMutation.mutate({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      url: urlsArray[0] || '',
      urls: urlsArray,
      tags: tagsArray
    })
  }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <Card style={{ backgroundColor: '#16213e', border: '1px solid #2d3748' }}>
            <Card.Header style={{ backgroundColor: '#1a1a2e', borderBottom: '1px solid #2d3748' }}>
              <h3 style={{ color: '#e2e8f0', margin: 0 }}>Додати новий ресурс</h3>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#e2e8f0' }}>Назва ресурсу *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Введіть назву ресурсу"
                    value={resource.title}
                    onChange={(e) => setResource({...resource, title: e.target.value})}
                    required
                    style={{ backgroundColor: '#0d0d1a', color: '#e2e8f0', border: '1px solid #2d3748' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#e2e8f0' }}>Опис *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Опишіть ресурс"
                    value={resource.description}
                    onChange={(e) => setResource({...resource, description: e.target.value})}
                    required
                    style={{ backgroundColor: '#0d0d1a', color: '#e2e8f0', border: '1px solid #2d3748' }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#e2e8f0' }}>Категорія *</Form.Label>
                  <Form.Select
                    value={resource.category}
                    onChange={(e) => setResource({...resource, category: e.target.value})}
                    style={{ backgroundColor: '#0d0d1a', color: '#e2e8f0', border: '1px solid #2d3748' }}
                  >
                    <option value="technology">Технології</option>
                    <option value="education">Освіта</option>
                    <option value="health">Здоров'я</option>
                    <option value="business">Бізнес</option>
                    <option value="entertainment">Розваги</option>
                    <option value="other">Інше</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label style={{ color: '#e2e8f0' }}>Посилання</Form.Label>
                  {resource.urls.map((url, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <Form.Control
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...resource.urls]
                          newUrls[index] = e.target.value
                          setResource({...resource, urls: newUrls})
                        }}
                        style={{ backgroundColor: '#0d0d1a', color: '#e2e8f0', border: '1px solid #2d3748' }}
                      />
                      {resource.urls.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => {
                            const newUrls = resource.urls.filter((_, i) => i !== index)
                            setResource({...resource, urls: newUrls})
                          }}
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setResource({...resource, urls: [...resource.urls, '']})}
                  >
                    <FiPlus className="me-1" />
                    Додати посилання
                  </Button>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ color: '#e2e8f0' }}>Теги (через кому)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="javascript, react, frontend"
                    value={resource.tags}
                    onChange={(e) => setResource({...resource, tags: e.target.value})}
                    style={{ backgroundColor: '#0d0d1a', color: '#e2e8f0', border: '1px solid #2d3748' }}
                  />
                  <Form.Text style={{ color: '#94a3b8' }}>
                    Введіть теги через кому для кращого пошуку
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                    disabled={createMutation.isPending}
                  >
                    Скасувати
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={createMutation.isPending}
                    style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                  >
                    <FiPlus className="me-2" />
                    {createMutation.isPending ? 'Створення...' : 'Створити ресурс'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}

export default CreateResource
