/**
 * Сторінка перегляду фідбеку проекту з красивим дизайном
 * Показує оригінальні коментарі клієнтів та згенеровані ШІ завдання для дизайнера
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Типи даних
interface Feedback {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in-progress' | 'completed' | 'rejected';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: 'client' | 'designer' | 'admin';
  };
  // ШІ-аналіз
  aiAnalysis?: {
    designerTasks: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
    suggestions: string[];
    analysisScore: number; // 0-100
    generatedAt: string;
  };
  attachments?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

// Фільтри
interface FeedbackFilters {
  status: string;
  priority: string;
  author: string;
  search: string;
  showAiAnalysis: boolean;
}

const priorityConfig = {
  low: { label: 'Низький', color: '#6b7280', bg: '#f3f4f6', emoji: '🟢' },
  medium: { label: 'Середній', color: '#2563eb', bg: '#dbeafe', emoji: '🟡' },
  high: { label: 'Високий', color: '#d97706', bg: '#fef3c7', emoji: '🟠' },
  critical: { label: 'Критичний', color: '#dc2626', bg: '#fee2e2', emoji: '🔴' }
};

const statusConfig = {
  new: { label: 'Новий', color: '#2563eb', bg: '#dbeafe', icon: MessageSquare, emoji: '🆕' },
  'in-progress': { label: 'В роботі', color: '#d97706', bg: '#fef3c7', icon: Clock, emoji: '⏳' },
  completed: { label: 'Виконано', color: '#059669', bg: '#d1fae5', icon: CheckCircle, emoji: '✅' },
  rejected: { label: 'Відхилено', color: '#dc2626', bg: '#fee2e2', icon: AlertTriangle, emoji: '❌' }
};

export const ProjectFeedbackPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedbackFilters>({
    status: 'all',
    priority: 'all',
    author: 'all',
    search: '',
    showAiAnalysis: true
  });

  // Mock дані для демонстрації
  const mockProject: Project = {
    id: projectId || '1',
    name: '🌟 Landing Page для Стартапу',
    description: 'Сучасний лендінг для AI стартапу з градієнтами та анімаціями',
    status: 'active'
  };

  const mockFeedbacks: Feedback[] = [
    {
      id: '1',
      title: 'Кнопка "Замовити демо" не дуже помітна',
      description: 'Мені здається, що головна кнопка Call-to-Action не дуже виділяється на фоні. Клієнти можуть її не помітити. Хотілося б щось яскравіше.',
      priority: 'high',
      status: 'new',
      tags: ['CTA', 'дизайн', 'конверсія'],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      author: {
        id: 'client1',
        name: 'Анна Коваленко',
        email: 'anna@startup.com',
        role: 'client'
      },
      aiAnalysis: {
        designerTasks: [
          'Збільшити контрастність кнопки "Замовити демо" відносно фону',
          'Додати тінь або обводку для кращої видимості',
          'Розглянути використання яскравіших кольорів (помаранчевий, зелений)',
          'Провести A/B тест різних варіантів кнопки',
          'Додати мікроанімацію при наведенні для привернення уваги'
        ],
        priority: 'high',
        estimatedHours: 3,
        suggestions: [
          'Використати принцип контрастності для покращення UX',
          'Додати індикатори завантаження після кліку',
          'Розглянути розміщення дублікату кнопки в іншій частині сторінки'
        ],
        analysisScore: 87,
        generatedAt: '2024-01-15T10:35:00Z'
      }
    },
    {
      id: '2',
      title: 'Текст важко читати на мобільному',
      description: 'Коли дивлюся сайт на телефоні, текст дуже дрібний і важко читається. Особливо в секції з описом продукту. Може зробити більше?',
      priority: 'medium',
      status: 'in-progress',
      tags: ['мобільний', 'типографіка', 'accessibility'],
      createdAt: '2024-01-14T15:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      author: {
        id: 'client2',
        name: 'Петро Мельник',
        email: 'petro@company.com',
        role: 'client'
      },
      aiAnalysis: {
        designerTasks: [
          'Збільшити базовий розмір шрифту для мобільних пристроїв до мінімум 16px',
          'Покращити інтерлін\'яж (line-height) для кращої читабельності',
          'Оптимізувати контрастність тексту відносно фону',
          'Створити адаптивну типографічну шкалу'
        ],
        priority: 'high',
        estimatedHours: 4,
        suggestions: [
          'Використати CSS clamp() для адаптивних розмірів шрифтів',
          'Додати можливість користувачу збільшувати текст',
          'Перевірити сайт на відповідність WCAG 2.1 AA'
        ],
        analysisScore: 92,
        generatedAt: '2024-01-14T15:25:00Z'
      }
    }
  ];

  // Завантаження даних
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // TODO: Замінити на реальні API виклики
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setProject(mockProject);
        setFeedbacks(mockFeedbacks);
        setFilteredFeedbacks(mockFeedbacks);
      } catch (error) {
        toast.error('Помилка завантаження даних');
        console.error('Error loading feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Фільтрація фідбеків
  useEffect(() => {
    let filtered = [...feedbacks];

    // Фільтр за статусом
    if (filters.status !== 'all') {
      filtered = filtered.filter(f => f.status === filters.status);
    }

    // Фільтр за пріоритетом
    if (filters.priority !== 'all') {
      filtered = filtered.filter(f => f.priority === filters.priority);
    }

    // Пошук
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchLower) ||
        f.description.toLowerCase().includes(searchLower) ||
        f.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, filters]);

  // Оновлення фільтру
  const updateFilter = <K extends keyof FeedbackFilters>(
    key: K,
    value: FeedbackFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Регенерація ШІ аналізу
  const regenerateAiAnalysis = async (feedbackId: string) => {
    try {
      toast.loading('Генерую новий ШІ-аналіз...', { id: 'ai-analysis' });
      
      // TODO: Реальний виклик ШІ API з feedbackId
      console.log('Regenerating AI analysis for feedback:', feedbackId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('ШІ-аналіз оновлено', { id: 'ai-analysis' });
    } catch (error) {
      toast.error('Помилка генерації аналізу', { id: 'ai-analysis' });
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
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
          <p style={{ color: '#64748b', fontSize: '16px' }}>            ⏳ Завантажую відгуки...</p>
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
    );
  }

  if (!project) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '20px' }}>
            Проект не знайдено
          </p>
          <button 
            onClick={() => navigate('/projects')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Повернутися до проектів
          </button>
        </div>
      </div>
    );
  }

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
              to="/" 
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
            <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link 
                to="/"
                style={{
                  color: '#64748b',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                📁 Проекти
              </Link>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>/</span>
              <span style={{
                color: '#2563eb',
                fontWeight: 'bold',
                padding: '6px 12px',
                backgroundColor: '#e0e7ff',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                💬 {project.name}
              </span>
            </nav>
          </div>

          <button
            onClick={() => navigate(`/projects/${projectId}/feedback/new`)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            ➕ Додати відгук
          </button>
        </div>
      </header>

      {/* Основний контент */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Заголовок */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a202c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            💬 Відгуки проекту
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '14px'
          }}>
            {filteredFeedbacks.length} з {feedbacks.length} записів
          </p>
        </div>

        {/* Фільтри */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Пошук */}
            <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="            🔍 Пошук по відгукам..."
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {/* Фільтр статусу */}
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">📋 Всі статуси</option>
              <option value="new">🆕 Нові</option>
              <option value="in-progress">⏳ В роботі</option>
              <option value="completed">✅ Виконані</option>
              <option value="rejected">❌ Відхилені</option>
            </select>

            {/* Фільтр пріоритету */}
            <select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value)}
              style={{
                padding: '10px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              <option value="all">📊 Всі пріоритети</option>
              <option value="critical">🔴 Критичний</option>
              <option value="high">🟠 Високий</option>
              <option value="medium">🟡 Середній</option>
              <option value="low">🟢 Низький</option>
            </select>

            {/* Перемикач ШІ-аналізу */}
            <button
              onClick={() => updateFilter('showAiAnalysis', !filters.showAiAnalysis)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: '2px solid',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderColor: filters.showAiAnalysis ? '#2563eb' : '#e5e7eb',
                backgroundColor: filters.showAiAnalysis ? '#eff6ff' : 'white',
                color: filters.showAiAnalysis ? '#2563eb' : '#64748b'
              }}
            >
              {filters.showAiAnalysis ? (
                <Eye style={{ width: '16px', height: '16px' }} />
              ) : (
                <EyeOff style={{ width: '16px', height: '16px' }} />
              )}
              🤖 ШІ-аналіз
            </button>
          </div>
        </div>

        {/* Список фідбеку */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredFeedbacks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>💬</div>
              <h3 style={{ 
                color: '#1a202c', 
                marginBottom: '12px',
                fontSize: '20px',
                fontWeight: 'bold'
              }}>
                Відгуки не знайдено
              </h3>
              <p style={{ 
                color: '#64748b', 
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                {feedbacks.length === 0 
                  ? 'Поки що немає жодного відгуку для цього проекту.'
                  : 'Спробуйте змінити фільтри пошуку.'
                }
              </p>
              <button 
                onClick={() => navigate(`/projects/${projectId}/feedback/new`)}
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
                ✨ Додати перший відгук
              </button>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <FeedbackCard 
                key={feedback.id} 
                feedback={feedback} 
                showAiAnalysis={filters.showAiAnalysis}
                onRegenerateAi={() => regenerateAiAnalysis(feedback.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент картки фідбеку
interface FeedbackCardProps {
  feedback: Feedback;
  showAiAnalysis: boolean;
  onRegenerateAi: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ 
  feedback, 
  showAiAnalysis, 
  onRegenerateAi 
}) => {
  const [expandedAi, setExpandedAi] = useState(false);

  const priorityInfo = priorityConfig[feedback.priority];
  const statusInfo = statusConfig[feedback.status];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      border: '1px solid #e5e7eb'
    }}>
      {/* Основна інформація */}
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1a202c',
              lineHeight: '1.4'
            }}>
              {feedback.title}
            </h3>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
              fontSize: '15px'
            }}>
              {feedback.description}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginLeft: '20px',
            alignItems: 'flex-end'
          }}>
            {/* Статус */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: statusInfo.bg,
              color: statusInfo.color
            }}>
              {statusInfo.emoji} {statusInfo.label}
            </span>
            
            {/* Пріоритет */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              backgroundColor: priorityInfo.bg,
              color: priorityInfo.color
            }}>
              {priorityInfo.emoji} {priorityInfo.label}
            </span>
          </div>
        </div>

        {/* Мета-інформація */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          gap: '20px',
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User style={{ width: '14px', height: '14px' }} />
            <span>{feedback.author.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar style={{ width: '14px', height: '14px' }} />
            <span>{new Date(feedback.createdAt).toLocaleDateString('uk-UA')}</span>
          </div>
        </div>

        {/* Теги */}
        {feedback.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {feedback.tags.map((tag) => (
              <span 
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                <Tag style={{ width: '12px', height: '12px' }} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ШІ-аналіз */}
      {showAiAnalysis && feedback.aiAnalysis && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%)'
        }}>
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#7c3aed'
                }}>
                  🤖 ШІ-аналіз та рекомендації
                </h4>
                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}>
                  Точність: {feedback.aiAnalysis.analysisScore}%
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={onRegenerateAi}
                  style={{
                    padding: '6px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  title="Регенерувати аналіз"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <RefreshCw style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                </button>
                
                <button
                  onClick={() => setExpandedAi(!expandedAi)}
                  style={{
                    fontSize: '12px',
                    color: '#7c3aed',
                    fontWeight: 'bold',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {expandedAi ? 'Згорнути ↑' : 'Розгорнути ↓'}
                </button>
              </div>
            </div>

            {/* Краткий огляд */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Пріоритет ШІ
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: priorityConfig[feedback.aiAnalysis.priority].color,
                  fontSize: '14px'
                }}>
                  {priorityConfig[feedback.aiAnalysis.priority].emoji} {priorityConfig[feedback.aiAnalysis.priority].label}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Оцінка часу
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontSize: '14px'
                }}>
                  ⏱️ {feedback.aiAnalysis.estimatedHours} год
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e0e7ff'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Завдань
                </div>
                <div style={{
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontSize: '14px'
                }}>
                  📋 {feedback.aiAnalysis.designerTasks.length}
                </div>
              </div>
            </div>

            {/* Детальний аналіз */}
            {expandedAi && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Завдання для дизайнера */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #e0e7ff'
                }}>
                  <h5 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#059669' }} />
                    ✅ Конкретні завдання для дизайнера
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feedback.aiAnalysis.designerTasks.map((task, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '14px'
                      }}>
                        <span style={{
                          backgroundColor: '#2563eb',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ color: '#374151', lineHeight: '1.5' }}>
                          {task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Пропозиції */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  border: '1px solid #e0e7ff'
                }}>
                  <h5 style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Brain style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                    💡 Додаткові пропозиції
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {feedback.aiAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '14px'
                      }}>
                        <span style={{
                          color: '#7c3aed',
                          fontSize: '16px',
                          lineHeight: '1',
                          marginTop: '2px'
                        }}>
                          •
                        </span>
                        <span style={{ color: '#374151', lineHeight: '1.5' }}>
                          {suggestion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Мета-інформація */}
                <div style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  borderTop: '1px solid #e0e7ff',
                  paddingTop: '12px',
                  fontStyle: 'italic'
                }}>
                  🕒 Аналіз згенеровано: {new Date(feedback.aiAnalysis.generatedAt).toLocaleString('uk-UA')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};