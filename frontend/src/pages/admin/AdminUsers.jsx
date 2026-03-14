import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const fetchUsers = async ({ page }) => {
  const token = localStorage.getItem('token');
  const { data } = await axios.get('/api/admin/users', {
    params: { page, limit: 20 },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => fetchUsers({ page }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return axios.patch(`/api/admin/users/${id}/toggle-active`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      // Інвалідуємо всі пов'язані запити для автоматичного оновлення
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] }); // Оновити ресурси (автор може бути деактивований)
      queryClient.invalidateQueries({ queryKey: ['currentUser'] }); // Оновити дані користувача в навбарі
    },
  });

  const cardStyle = { 
    backgroundColor: '#ffffff', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  return (
    <Container style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <h2 style={{ color: '#1e293b', fontWeight: 600, margin: 0 }}>
          Управління користувачами
        </h2>
        <Badge bg="primary" style={{ 
          fontSize: '13px', 
          padding: '6px 12px' 
        }}>
          {data?.data?.pagination?.total || 0} всього
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '1rem' }}>
          Помилка завантаження: {error.message}
        </Alert>
      )}

      <div style={cardStyle}>
        {isLoading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            Завантаження...
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table hover responsive style={{ marginBottom: 0 }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Користувач</th>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Email</th>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Роль</th>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Статус</th>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Дата реєстрації</th>
                  <th style={{ color: '#475569', fontSize: '13px', fontWeight: 600, padding: '12px' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.users?.map(user => (
                  <tr key={user._id}>
                    <td style={{ color: '#1e293b', fontWeight: 500, fontSize: '14px', padding: '12px' }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px', padding: '12px' }}>
                      {user.email}
                      {!user.emailVerified && (
                        <Badge bg="warning" style={{ marginLeft: '8px', fontSize: '11px' }}>
                          Не підтверджено
                        </Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                        {user.role === 'admin' ? 'Адмін' : 'Користувач'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Активний' : 'Неактивний'}
                      </Badge>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px', padding: '12px' }}>
                      {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Button
                        size="sm"
                        variant={user.isActive ? 'warning' : 'success'}
                        onClick={() => toggleMutation.mutate(user._id)}
                        disabled={toggleMutation.isPending}
                      >
                        {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AdminUsers;
