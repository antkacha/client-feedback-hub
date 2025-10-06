import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProjectFeedbackPage } from './pages/ProjectFeedbackPageNew'
import { NewFeedbackPage } from './pages/NewFeedbackPageNew'

// Простая dashboard страница
function SimpleDashboard() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Навигационная панель */}
      <header style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}>
          <h1 style={{
            color: '#2563eb',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            🎨 Client Feedback Hub
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {user?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🚪 Вихід
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '30px 20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#111827',
            fontSize: '32px',
            fontWeight: 'bold',
            margin: '0 0 16px 0'
          }}>
            🎉 Вітаємо, {user?.firstName}!
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '18px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Ви успішно увійшли в систему Client Feedback Hub.<br />
            Тут будуть відображатися ваші проекти та інструменти для роботи з відгуками.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '40px'
          }}>
            <div style={{
              padding: '30px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>Проекти</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Управління проектами та дизайн-макетами
              </p>
            </div>

            <div style={{
              padding: '30px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ color: '#16a34a', marginBottom: '8px' }}>Відгуки</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Збір та аналіз зворотного зв'язку
              </p>
            </div>

            <div style={{
              padding: '30px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ color: '#7c3aed', marginBottom: '8px' }}>ШІ Аналіз</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                Розумні рекомендації щодо дизайну
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Компонент для защищенных маршрутов
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div style={{ color: '#6b7280', fontSize: '16px' }}>
            ⏳ Завантаження...
          </div>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

// Главный компонент приложения
function App() {
  const { user, isLoading } = useAuth()
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Routes>
        <Route 
          path="/auth" 
          element={
            user && !isLoading ? <Navigate to="/" replace /> : <AuthPage />
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId/feedback" 
          element={
            <ProtectedRoute>
              <ProjectFeedbackPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId/feedback/new" 
          element={
            <ProtectedRoute>
              <NewFeedbackPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App