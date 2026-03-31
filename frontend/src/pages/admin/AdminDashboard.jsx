import React from 'react'
import { Card } from 'react-bootstrap'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { FiUsers, FiBook } from 'react-icons/fi'

const AdminDashboard = () => {
  // Fetch admin statistics
  const fetchStats = async () => {
    const response = await axios.get('/api/admin/stats')
    return response.data
  }

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchStats,
    refetchInterval: 30 * 1000, // Автоматично оновлювати кожні 30 секунд
    refetchOnWindowFocus: true, // Оновлювати при переключенні на вкладку
    refetchOnMount: true,
    staleTime: 20 * 1000
  })

  return (
    <div>
      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Завантаження...</span>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginTop: '2rem',
          marginBottom: '1.5rem'
        }}>
          {/* Users Stats */}
          <Card className="text-center h-100">
            <Card.Body>
              <FiUsers size={48} className="text-primary mb-3" />
              <h3 className="text-primary">{statsData?.data?.users?.total || 0}</h3>
              <p className="text-muted mb-2">Всього користувачів</p>
              <small className="text-success">
                +{statsData?.data?.users?.recentlyRegistered || 0} за тиждень
              </small>
            </Card.Body>
          </Card>

          {/* Active Users */}
          <Card className="text-center h-100">
            <Card.Body>
              <FiUsers size={48} className="text-success mb-3" />
              <h3 className="text-success">{statsData?.data?.users?.active || 0}</h3>
              <p className="text-muted mb-2">Активні користувачі</p>
              <small className="text-warning">
                {statsData?.data?.users?.unverified || 0} неверифіковані
              </small>
            </Card.Body>
          </Card>

          {/* Total Resources */}
          <Card className="text-center h-100">
            <Card.Body>
              <FiBook size={48} className="text-info mb-3" />
              <h3 className="text-info">{statsData?.data?.resources?.total || 0}</h3>
              <p className="text-muted mb-2">Всього ресурсів</p>
              <small className="text-success">
                +{statsData?.data?.resources?.recentlyCreated || 0} за тиждень
              </small>
            </Card.Body>
          </Card>

          {/* Pending Resources */}
          <Card className="text-center h-100">
            <Card.Body>
              <FiBook size={48} className="text-warning mb-3" />
              <h3 className="text-warning">{statsData?.data?.resources?.pending || 0}</h3>
              <p className="text-muted mb-2">Очікують модерації</p>
              <small className="text-info">
                {statsData?.data?.resources?.approved || 0} схвалені
              </small>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
