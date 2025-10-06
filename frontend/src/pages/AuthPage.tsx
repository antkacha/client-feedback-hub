import { useState } from 'react'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Заголовок приложения */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎨 Client Feedback Hub
          </h1>
          <p style={{
            color: '#e0e7ff',
            fontSize: '18px',
            margin: 0,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}>
            Платформа для збору зворотного зв'язку з дизайну
          </p>
        </div>

        {/* Переключатель режимов */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? '#2563eb' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔐 Вхід
          </button>
          <button
            onClick={() => setMode('register')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: mode === 'register' ? 'white' : 'transparent',
              color: mode === 'register' ? '#16a34a' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✨ Реєстрація
          </button>
        </div>

        {/* Формы */}
        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}

        {/* Информация внизу */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '18px' }}>
            ✨ Можливості платформи
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            color: '#e0e7ff',
            fontSize: '14px'
          }}>
            <div>🎯 Управління проектами</div>
            <div>💬 Система відгуків</div>
            <div>🤖 ШІ аналіз дизайну</div>
            <div>📊 Аналітика та звіти</div>
          </div>
        </div>
      </div>
    </div>
  )
}