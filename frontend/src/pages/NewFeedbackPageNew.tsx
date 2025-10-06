/**
 * Красива сторінка створення нового фідбеку з гармонійним дизайном
 * Показує детальну форму з валідацією, пріоритетами та прикріпленнями
 */

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Tag, 
  AlertTriangle, 
  MessageSquare, 
  Camera, 
  Paperclip, 
  X, 
  Plus,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

// Типи даних
interface FeedbackForm {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  attachments: File[];
  reproductionSteps: string;
  expectedBehavior: string;
  actualBehavior: string;
  browserInfo: string;
  url: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  general?: string;
}

// Конфігурація пріоритетів
const priorityConfig = {
  low: { 
    label: 'Низький', 
    color: '#6b7280', 
    bg: '#f3f4f6', 
    emoji: '🟢',
    description: 'Незначні проблеми або покращення'
  },
  medium: { 
    label: 'Середній', 
    color: '#2563eb', 
    bg: '#dbeafe', 
    emoji: '🟡',
    description: 'Помірно важливі проблеми'
  },
  high: { 
    label: 'Високий', 
    color: '#d97706', 
    bg: '#fef3c7', 
    emoji: '🟠',
    description: 'Важливі проблеми, що впливають на UX'
  },
  critical: { 
    label: 'Критичний', 
    color: '#dc2626', 
    bg: '#fee2e2', 
    emoji: '🔴',
    description: 'Блокуючі проблеми, потребують негайного виправлення'
  }
};

// Рекомендовані теги
const predefinedTags = [
  '🐛 баг', '✨ функціональність', '🎨 дизайн', '👤 UX', '📱 мобільний', 
  '🌐 браузер', '⚡ продуктивність', '♿ доступність', '🔒 безпека',
  '📄 контент', '🔗 навігація', '📊 аналітика'
];

export const NewFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  const [form, setForm] = useState<FeedbackForm>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    attachments: [],
    reproductionSteps: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: navigator.userAgent,
    url: window.location.href,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Валідація форми
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.title.trim()) {
      newErrors.title = 'Заголовок є обов\'язковим';
    } else if (form.title.trim().length < 5) {
      newErrors.title = 'Заголовок повинен містити мінімум 5 символів';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Опис є обов\'язковим';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Опис повинен містити мінімум 10 символів';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обробка відправки форми
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Будь ласка, виправте помилки у формі');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      toast.loading('Створюю відгук...', { id: 'create-feedback' });
      
      // TODO: Відправити відгук через API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Feedback submitted:', form);
      
      toast.success('Відгук успішно створено! 🎉', { id: 'create-feedback' });
      
      // Перенаправлення на сторінку проекту
      setTimeout(() => {
        navigate(`/projects/${projectId}/feedback`);
      }, 1000);
    } catch (error) {
      toast.error('Помилка створення відгуку', { id: 'create-feedback' });
      setErrors({
        general: 'Помилка створення відгуку. Спробуйте ще раз.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Оновлення полів форми
  const updateField = <K extends keyof FeedbackForm>(
    field: K, 
    value: FeedbackForm[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Очищення помилки для поля
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Додавання тегу
  const addTag = (tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag || form.tags.includes(cleanTag)) return;
    
    updateField('tags', [...form.tags, cleanTag]);
    setNewTag('');
  };

  // Видалення тегу
  const removeTag = (tagToRemove: string) => {
    updateField('tags', form.tags.filter(tag => tag !== tagToRemove));
  };

  // Обробка файлів
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== files.length) {
      toast.error('Деякі файли занадто великі (макс. 10MB)');
    }
    
    updateField('attachments', [...form.attachments, ...validFiles]);
  };

  // Видалення файлу
  const removeFile = (indexToRemove: number) => {
    updateField('attachments', form.attachments.filter((_, index) => index !== indexToRemove));
  };

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
              <Link 
                to={`/projects/${projectId}/feedback`}
                style={{
                  color: '#64748b',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                💬 Відгуки
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
                ✨ Новий відгук
              </span>
            </nav>
          </div>

          <Link
            to={`/projects/${projectId}/feedback`}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Назад
          </Link>
        </div>
      </header>

      {/* Основний контент */}
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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
            ✨ Створити новий відгук
          </h1>
          <p style={{
            color: '#64748b',
            margin: 0,
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Детально опишіть проблему або пропозицію для покращення проекту
          </p>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit}>
          {/* Загальна помилка */}
          {errors.general && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
              <p style={{ color: '#dc2626', margin: 0, fontSize: '14px' }}>
                {errors.general}
              </p>
            </div>
          )}

          {/* Основна інформація */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FileText style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              Основна інформація
            </h3>

            {/* Заголовок фідбеку */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Заголовок відгуку *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.title ? '2px solid #dc2626' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: errors.title ? '#fef2f2' : 'white',
                  boxSizing: 'border-box'
                }}
                placeholder="Коротко опишіть проблему або пропозицію..."
                onFocus={(e) => {
                  if (!errors.title) e.currentTarget.style.borderColor = '#2563eb';
                }}
                onBlur={(e) => {
                  if (!errors.title) e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                autoFocus
              />
              {errors.title && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Пріоритет */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '12px'
              }}>
                Пріоритет
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {Object.entries(priorityConfig).map(([value, config]) => (
                  <label
                    key={value}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '16px',
                      border: form.priority === value ? '2px solid #2563eb' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: form.priority === value ? '#eff6ff' : 'white',
                      boxShadow: form.priority === value ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (form.priority !== value) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (form.priority !== value) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={value}
                      checked={form.priority === value}
                      onChange={(e) => updateField('priority', e.target.value as any)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px'
                    }}>
                      <span style={{ fontSize: '20px' }}>{config.emoji}</span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: config.color
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.4'
                    }}>
                      {config.description}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Детальний опис */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Детальний опис *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.description ? '2px solid #dc2626' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  backgroundColor: errors.description ? '#fef2f2' : 'white',
                  resize: 'vertical',
                  minHeight: '120px',
                  boxSizing: 'border-box'
                }}
                placeholder="Детально опишіть проблему, включаючи контекст та очікування...&#10;&#10;Наприклад:&#10;• Що саме відбувається?&#10;• Коли це трапляється?&#10;• Які наслідки це має?&#10;• Як би ви хотіли, щоб це працювало?"
                onFocus={(e) => {
                  if (!errors.description) e.currentTarget.style.borderColor = '#2563eb';
                }}
                onBlur={(e) => {
                  if (!errors.description) e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              />
              {errors.description && (
                <p style={{ 
                  color: '#dc2626', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* URL сторінки */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#374151',
                marginBottom: '8px'
              }}>
                URL сторінки
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => updateField('url', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="https://example.com/page"
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                💡 Вкажіть URL сторінки, де виникла проблема
              </p>
            </div>
          </div>

          {/* Додаткові деталі */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MessageSquare style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              Додаткові деталі
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Кроки відтворення */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🔄 Кроки відтворення
                </label>
                <textarea
                  value={form.reproductionSteps}
                  onChange={(e) => updateField('reproductionSteps', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="1. Перейти на сторінку...&#10;2. Натиснути на кнопку...&#10;3. Заповнити форму...&#10;4. Побачити помилку..."
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Очікувана поведінка */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  ✅ Очікувана поведінка
                </label>
                <textarea
                  value={form.expectedBehavior}
                  onChange={(e) => updateField('expectedBehavior', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Що має відбутися в ідеальному випадку..."
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Фактична поведінка */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  ❌ Фактична поведінка
                </label>
                <textarea
                  value={form.actualBehavior}
                  onChange={(e) => updateField('actualBehavior', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Що відбувається насправді, що не так..."
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Інформація про браузер */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  🌐 Інформація про браузер
                </label>
                <textarea
                  value={form.browserInfo}
                  onChange={(e) => updateField('browserInfo', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Браузер, версія, операційна система..."
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  marginTop: '4px',
                  margin: '4px 0 0 0'
                }}>
                  💡 Інформація про браузер автоматично заповнена
                </p>
              </div>
            </div>
          </div>

          {/* Теги */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Tag style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              Теги
            </h3>

            {/* Обрані теги */}
            {form.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}>
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#e0e7ff',
                      color: '#3730a3',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        padding: '2px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 48, 163, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <X style={{ width: '14px', height: '14px' }} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Додавання нового тегу */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Додати новий тег..."
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: newTag.trim() ? '#2563eb' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: newTag.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (newTag.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (newTag.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Рекомендовані теги */}
            <div>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                💡 Рекомендовані теги:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {predefinedTags
                  .filter(tag => !form.tags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '16px',
                        fontSize: '13px',
                        color: '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                        e.currentTarget.style.borderColor = '#9ca3af';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    >
                      {tag}
                    </button>
                  ))
                }
              </div>
            </div>
          </div>

          {/* Прикріплення */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Paperclip style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              Прикріплення
            </h3>

            {/* Список файлів */}
            {form.attachments.length > 0 && (
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {form.attachments.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Paperclip style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      <span style={{
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        {file.name}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        backgroundColor: '#e5e7eb',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <X style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Завантаження файлів */}
            <div>
              <label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: '#fafafa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }}
                >
                  <Camera style={{
                    width: '48px',
                    height: '48px',
                    color: '#94a3b8',
                    margin: '0 auto 12px'
                  }} />
                  <p style={{
                    fontSize: '16px',
                    color: '#374151',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    📎 Натисніть для вибору файлів або перетягніть їх сюди
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    Підтримуються: зображення, PDF, документи (макс. 10 МБ кожен)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Кнопки дій */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <Link
              to={`/projects/${projectId}/feedback`}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Скасувати
            </Link>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 32px',
                backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Створюю відгук...
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  ✨ Створити відгук
                </>
              )}
            </button>
          </div>
        </form>
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
};