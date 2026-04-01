import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiFilter } from 'react-icons/fi'
import broadcastSync, { SYNC_EVENTS } from '../utils/broadcastSync'
import ResourceList from '../components/resources/ResourceList'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useApi } from '../contexts/ApiContext.jsx'
import { fetchResources, fetchMyResources, deleteResource } from '../services/apiService'
import './Resources.css'

const categories = [
  { value: '', label: 'Всі категорії' },
  { value: 'education', label: 'Освіта' },
  { value: 'technology', label: 'Технології' },
  { value: 'health', label: 'Здоров\'я' },
  { value: 'business', label: 'Бізнес' },
  { value: 'entertainment', label: 'Розваги' },
  { value: 'other', label: 'Інше' }
]

const ResourcesWithApi = () => {
  const { token } = useAuth()
  const { apiMode } = useApi()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resources', currentPage, selectedCategory, searchTerm, activeTab, apiMode],
    queryFn: async () => {
      const params = {
        page: currentPage,
        limit: 12,
        category: selectedCategory || undefined,
        search: searchTerm || undefined
      }

      if (activeTab === 'my') {
        return await fetchMyResources(params, apiMode, token)
      } else {
        return await fetchResources(params, apiMode, token)
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: activeTab === 'all' || (activeTab === 'my' && !!token)
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    refetch()
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  useEffect(() => {
    const unsubscribeCreated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeUpdated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeDeleted = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    const unsubscribeApproved = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_APPROVED, () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    })

    return () => {
      unsubscribeCreated()
      unsubscribeUpdated()
      unsubscribeDeleted()
      unsubscribeApproved()
    }
  }, [queryClient])

  const deleteMutation = useMutation({
    mutationFn: async (resourceId) => {
      return await deleteResource(resourceId, apiMode, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_DELETED, {})
      alert('Ресурс успішно видалено!')
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Помилка видалення ресурсу')
    }
  })

  const handleDelete = (resourceId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей ресурс?')) {
      deleteMutation.mutate(resourceId)
    }
  }

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 style={{ color: '#e2e8f0' }}>Ресурси</h2>
        <p style={{ color: '#94a3b8' }}>
          Режим API: <strong style={{ color: apiMode === 'graphql' ? '#28a745' : '#007bff' }}>
            {apiMode === 'graphql' ? 'GraphQL' : 'REST'}
          </strong>
        </p>
      </div>

      <Row className="mb-4">
        <Col md={8}>
          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Пошук ресурсів..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ backgroundColor: '#16213e', color: '#e2e8f0', border: '1px solid #2d3748' }}
                />
                <Button variant="primary" type="submit">
                  <FiSearch /> Пошук
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{ backgroundColor: '#16213e', color: '#e2e8f0', border: '1px solid #2d3748' }}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="all" title="Всі ресурси">
          <ResourceList
            resources={data?.data?.resources || []}
            isLoading={isLoading}
            error={error}
            onDeleteResource={handleDelete}
            pagination={data?.data?.pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            layout="grid"
            categories={categories}
          />
        </Tab>
        {token && (
          <Tab eventKey="my" title="Мої ресурси">
            <ResourceList
              resources={data?.data?.resources || []}
              isLoading={isLoading}
              error={error}
              onDeleteResource={handleDelete}
              pagination={data?.data?.pagination}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showEdit={true}
              activeTab="my"
              layout="grid"
              categories={categories}
            />
          </Tab>
        )}
      </Tabs>
    </Container>
  )
}

export default ResourcesWithApi
