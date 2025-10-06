import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}



export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const { user, accessToken, logout } = useAuth()

  // Загрузка проектов
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/projects', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        throw new Error('Помилка завантаження проектів')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }



  // Создание проекта
  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast.error('Введіть назву проекту')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          ownerId: user?.id
        })
      })

      if (response.ok) {
        toast.success('Проект створено!')
        setNewProject({ name: '', description: '' })
        setShowCreateForm(false)
        fetchProjects()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Помилка створення проекту')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Помилка створення')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('До побачення!')
    } catch (error) {
      toast.error('Помилка при виході')
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])



  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Навігаційна панель */}
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
          height: '60px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link 
              to="/dashboard" 
              style={{
                color: '#2563eb',
                fontSize: '20px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🎨 Client Feedback Hub
            </Link>
            <nav style={{ display: 'flex', gap: '16px' }}>
              <Link 
                to="/dashboard"
                style={{
                  color: '#64748b',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                🏠 Головна
              </Link>
              <span style={{
                color: '#2563eb',
                fontWeight: 'bold',
                padding: '8px 12px',
                backgroundColor: '#e0e7ff',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                📁 Проекти
              </span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 10px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {user?.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={{ fontSize: '14px', color: '#374151' }}>
                {user?.firstName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🚪 Вихід
            </button>
          </div>
        </div>
      </header>

      {/* Основний контент */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1a202c'
            }}>
              📁 Мої проекти
            </h1>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ➕ Створити проект
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              ⏳ Завантаження проектів...
            </div>
          ) : projects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              border: '2px dashed #e2e8f0',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ color: '#1a202c', marginBottom: '8px' }}>Проекти відсутні</h3>
              <p style={{ color: '#64748b', marginBottom: '20px' }}>
                Створіть свій перший проект для збору відгуків
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✨ Створити перший проект
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1a202c'
                  }}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p style={{
                      margin: '0 0 12px 0',
                      fontSize: '14px',
                      color: '#64748b',
                      lineHeight: '1.4',
                      flexGrow: 1
                    }}>
                      {project.description}
                    </p>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '16px'
                  }}>
                    Створено: {new Date(project.createdAt).toLocaleDateString('uk-UA')}
                  </div>
                  
                  {/* Кнопки дій */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: 'auto'
                  }}>
                    <Link
                      to={`/projects/${project.id}/feedback`}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1d4ed8'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb'
                      }}
                    >
                      💬 Відгуки
                    </Link>
                    
                    <Link
                      to={`/projects/${project.id}/feedback/new`}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981'
                      }}
                    >
                      ➕ Додати
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модал створення проекту */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1a202c'
            }}>
              ➕ Створити новий проект
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                Назва проекту *
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Наприклад: Редизайн головної сторінки"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151'
              }}>
                Опис
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Короткий опис проекту та його цілей..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'Arial, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewProject({ name: '', description: '' })
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Скасувати
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: !newProject.name.trim() ? '#cbd5e1' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: !newProject.name.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                ✨ Створити
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}