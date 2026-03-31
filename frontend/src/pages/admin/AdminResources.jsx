import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Table, Badge, Button, Form, InputGroup, Pagination, Alert, Nav } from 'react-bootstrap';
import { FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiBook, FiClock, FiCheckCircle, FiPlus } from 'react-icons/fi';
import broadcastSync, { SYNC_EVENTS } from '../../utils/broadcastSync';

const fetchResources = async ({ page, search, status }) => {
  const { data } = await axios.get('/api/admin/resources', {
    params: { page, limit: 15, search, status }
  });
  return data;
};

const AdminResources = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-resources', page, search, activeTab],
    queryFn: () => fetchResources({ page, search, status: activeTab }),
    refetchInterval: 30 * 1000, // Автоматично оновлювати кожні 30 секунд
    refetchOnWindowFocus: true, // Оновлювати при переключенні на вкладку
    refetchOnMount: true, // Оновлювати при монтуванні
    staleTime: 20 * 1000, // Дані застарівають через 20 секунд
  });

  // Підписка на події з інших вкладок
  useEffect(() => {
    const unsubscribeCreated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_CREATED, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    });

    const unsubscribeUpdated = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_UPDATED, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    });

    const unsubscribeDeleted = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_DELETED, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    });

    const unsubscribeApproved = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_APPROVED, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    });

    const unsubscribeRejected = broadcastSync.subscribe(SYNC_EVENTS.RESOURCE_REJECTED, () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeApproved();
      unsubscribeRejected();
    };
  }, [queryClient]);

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      return axios.patch(`/api/admin/resources/${id}/toggle-active`, {});
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['userResources'] });
      // Повідомляємо інші вкладки
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_UPDATED, {});
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      return axios.patch(`/api/admin/resources/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['userResources'] });
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_APPROVED, {});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`/api/admin/resources/${id}`);
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['userResources'] });
      // Повідомляємо інші вкладки
      broadcastSync.broadcast(SYNC_EVENTS.RESOURCE_DELETED, {});
    },
  });

  const cardStyle = { 
    backgroundColor: '#16213e', 
    border: '1px solid #2d3748', 
    borderRadius: '12px', 
    padding: '1.5rem'
  };

  const categoryMap = {
    education: 'Освіта',
    health: "Здоров'я",
    business: 'Бізнес',
    entertainment: 'Розваги',
    technology: 'Технології',
    other: 'Інше'
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      education: 'primary',
      technology: 'info',
      health: 'success',
      business: 'warning',
      entertainment: 'danger',
      other: 'secondary'
    };
    return variants[category] || 'secondary';
  };

  return (
    <Container style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem' 
      }}>
        <h2 style={{ color: '#e2e8f0', fontWeight: 600, margin: 0 }}>
          Управління ресурсами
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            onClick={() => navigate('/admin/create-resource')}
            style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
          >
            <FiPlus className="me-2" />
            Створити ресурс
          </Button>
          <Badge style={{ 
            backgroundColor: '#7c3aed',
            fontSize: '13px', 
            padding: '6px 12px' 
          }}>
            {data?.data?.pagination?.total || 0} всього
          </Badge>
        </div>
      </div>

      {/* Вкладки фільтрації */}
      <Nav variant="tabs" className="mb-4" style={{ borderBottom: '2px solid #2d3748' }}>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'all'}
            onClick={() => { setActiveTab('all'); setPage(1); }}
            style={{
              color: activeTab === 'all' ? '#a78bfa' : '#94a3b8',
              backgroundColor: activeTab === 'all' ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid #a78bfa' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            <FiBook className="me-2" />
            Усі ресурси
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            active={activeTab === 'pending'}
            onClick={() => { setActiveTab('pending'); setPage(1); }}
            style={{
              color: activeTab === 'pending' ? '#a78bfa' : '#94a3b8',
              backgroundColor: activeTab === 'pending' ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'pending' ? '2px solid #a78bfa' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            <FiClock className="me-2" />
            Ресурси на модерації
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '1rem' }}>
          Помилка завантаження: {error.message}
        </Alert>
      )}

      <div style={cardStyle}>
        <InputGroup style={{ marginBottom: '1.5rem' }}>
          <InputGroup.Text style={{ 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            border: '1px solid #2d3748', 
            borderRight: 'none',
            color: '#94a3b8' 
          }}>
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Пошук ресурсів..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              border: '1px solid #2d3748', 
              color: '#e2e8f0',
              borderRadius: '8px'
            }}
          />
        </InputGroup>

        {isLoading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
            Завантаження...
          </p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <Table responsive style={{ color: '#e2e8f0', marginBottom: 0 }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#0d0d1a', 
                    color: '#94a3b8', 
                    fontSize: '13px', 
                    borderColor: '#2d3748' 
                  }}>
                    <th style={{ padding: '12px' }}>Назва</th>
                    <th style={{ padding: '12px' }}>Категорія</th>
                    <th style={{ padding: '12px' }}>Автор</th>
                    <th style={{ padding: '12px' }}>Статус</th>
                    <th style={{ padding: '12px' }}>Дата</th>
                    <th style={{ padding: '12px' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.resources?.map(resource => (
                    <tr key={resource._id} style={{ borderColor: '#2d3748', backgroundColor: 'transparent' }}>
                      <td style={{ maxWidth: '250px', padding: '12px' }}>
                        <div style={{ 
                          color: '#e2e8f0', 
                          fontWeight: 500, 
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          <a 
                            href={`/resources/${resource._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#7c3aed', 
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          >
                            {resource.title}
                          </a>
                        </div>
                        <small style={{ color: '#64748b', fontSize: '12px' }}>
                          {resource.description?.substring(0, 60)}...
                        </small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Badge bg={getCategoryBadgeVariant(resource.category)} style={{ fontWeight: 400 }}>
                          {categoryMap[resource.category] || resource.category}
                        </Badge>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px', padding: '12px' }}>
                        {resource.author?.firstName} {resource.author?.lastName}
                      </td>
                      <td>
                        <Badge bg={resource.isApproved ? 'success' : 'warning'}>
                          {resource.isApproved ? 'Схвалено' : 'На модерації'}
                        </Badge>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '13px', padding: '12px' }}>
                        {new Date(resource.createdAt).toLocaleDateString('uk-UA')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!resource.isApproved && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => approveMutation.mutate(resource._id)}
                              disabled={approveMutation.isPending}
                              title="Схвалити ресурс"
                            >
                              <FiCheckCircle />
                            </Button>
                          )}
                          {resource.isApproved && (
                            <Button
                              size="sm"
                              variant={resource.isActive ? 'warning' : 'success'}
                              onClick={() => toggleMutation.mutate(resource._id)}
                              disabled={toggleMutation.isPending}
                              title={resource.isActive ? 'Деактивувати' : 'Активувати'}
                            >
                              {resource.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => {
                              if (window.confirm('Видалити ресурс назавжди?')) {
                                deleteMutation.mutate(resource._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            title="Видалити"
                          >
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {data?.data?.pagination && (data.data.pagination.totalPages ?? data.data.pagination.pages) > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '1.5rem' 
              }}>
                <Pagination>
                  <Pagination.Prev 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  />
                  {[...Array(data.data.pagination.totalPages ?? data.data.pagination.pages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx + 1}
                      active={page === idx + 1}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={page === (data.data.pagination.totalPages ?? data.data.pagination.pages)}
                    onClick={() => setPage(page + 1)}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default AdminResources;
