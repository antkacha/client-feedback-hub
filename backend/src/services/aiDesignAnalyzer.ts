import OpenAI from 'openai';

// Для демонстрації використовуємо заглушку
// В реальному проєкті потрібен API ключ від OpenAI
class AIDesignAnalyzer {
  private openai: OpenAI | null = null;

  constructor() {
    // В реальному проєкті: 
    // this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('🤖 ШІ Аналізатор дизайну ініціалізовано (демо режим)');
  }

  /**
   * Аналізує фідбек дизайнера та структурує його
   */
  async analyzeFeedback(content: string): Promise<{
    category: 'COLORS' | 'TYPOGRAPHY' | 'LAYOUT' | 'UX' | 'ACCESSIBILITY' | 'BRANDING';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    designScore: number;
    analysis: string;
    recommendations: string[];
    sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  }> {
    // Демонстраційна логіка (замість реального ШІ)
    const result = this.mockAnalysis(content);
    
    // В реальному проєкті тут був би виклик до OpenAI:
    /*
    const completion = await this.openai?.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Ти експерт з UX/UI дизайну. Проаналізуй фідбек та надай структуровану відповідь у JSON форматі:
          {
            "category": "COLORS|TYPOGRAPHY|LAYOUT|UX|ACCESSIBILITY|BRANDING",
            "priority": "LOW|MEDIUM|HIGH", 
            "designScore": число від 1 до 10,
            "analysis": "детальний аналіз проблеми",
            "recommendations": ["рекомендація1", "рекомендація2"],
            "sentiment": "POSITIVE|NEUTRAL|NEGATIVE"
          }`
        },
        {
          role: "user", 
          content: content
        }
      ],
      temperature: 0.3
    });
    */

    return result;
  }

  /**
   * Генерує рекомендації для покращення дизайну
   */
  async generateDesignRecommendations(
    category: string, 
    projectType: string
  ): Promise<string[]> {
    const recommendations = this.mockRecommendations(category, projectType);
    
    // В реальному проєкті - виклик до ШІ
    return recommendations;
  }

  /**
   * Оцінює accessibility дизайну
   */
  async evaluateAccessibility(description: string): Promise<{
    score: number;
    issues: string[];
    improvements: string[];
  }> {
    return this.mockAccessibilityAnalysis(description);
  }

  // Демонстраційні методи (замінити на реальний ШІ)
  private mockAnalysis(content: string) {
    const lowerContent = content.toLowerCase();
    
    // Визначаємо категорію на основі ключових слів
    let category: 'COLORS' | 'TYPOGRAPHY' | 'LAYOUT' | 'UX' | 'ACCESSIBILITY' | 'BRANDING' = 'UX';
    
    if (lowerContent.includes('колір') || lowerContent.includes('кольор') || lowerContent.includes('схема')) {
      category = 'COLORS';
    } else if (lowerContent.includes('шрифт') || lowerContent.includes('текст') || lowerContent.includes('читабельн')) {
      category = 'TYPOGRAPHY';
    } else if (lowerContent.includes('розташ') || lowerContent.includes('макет') || lowerContent.includes('компоновк')) {
      category = 'LAYOUT';
    } else if (lowerContent.includes('доступн') || lowerContent.includes('accessibility') || lowerContent.includes('контраст')) {
      category = 'ACCESSIBILITY';
    } else if (lowerContent.includes('логотип') || lowerContent.includes('бренд') || lowerContent.includes('фірмов')) {
      category = 'BRANDING';
    }

    // Визначаємо пріоритет
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (lowerContent.includes('критичн') || lowerContent.includes('терміново') || lowerContent.includes('не працює')) {
      priority = 'HIGH';
    } else if (lowerContent.includes('непогано') || lowerContent.includes('можна') || lowerContent.includes('бажано')) {
      priority = 'LOW';
    }

    // Визначаємо тональність
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    if (lowerContent.includes('чудово') || lowerContent.includes('відмінно') || lowerContent.includes('подобається')) {
      sentiment = 'POSITIVE';
    } else if (lowerContent.includes('погано') || lowerContent.includes('не подобається') || lowerContent.includes('проблема')) {
      sentiment = 'NEGATIVE';
    }

    const designScore = sentiment === 'POSITIVE' ? 8.5 : sentiment === 'NEGATIVE' ? 5.2 : 7.0;

    return {
      category,
      priority,
      designScore,
      analysis: this.generateAnalysisText(category, sentiment),
      recommendations: this.mockRecommendations(category, 'web'),
      sentiment
    };
  }

  private generateAnalysisText(category: string, sentiment: string): string {
    const templates = {
      COLORS: sentiment === 'NEGATIVE' ? 
        '🎨 Виявлено проблеми з кольоровою схемою. Рекомендується перевірити контрастність та відповідність бренду.' :
        '🎨 Кольорова палітра підібрана гармонійно. Варто розглянути додаткові акцентні кольори.',
      
      TYPOGRAPHY: sentiment === 'NEGATIVE' ?
        '📝 Типографіка потребує оптимізації. Перевірте розміри шрифтів та інтерлін\'яж.' :
        '📝 Шрифтова ієрархія побудована логічно. Можна розглянути альтернативні гарнітури.',
      
      LAYOUT: sentiment === 'NEGATIVE' ?
        '📐 Компоновка елементів потребує перегляду. Рекомендується поліпшити візуальну ієрархію.' :
        '📐 Макет структурований добре. Варто оптимізувати відступи між блоками.',
      
      UX: sentiment === 'NEGATIVE' ?
        '👤 Виявлено проблеми з користувацьким досвідом. Потрібно спростити user journey.' :
        '👤 Користувацький досвід інтуїтивний. Можна додати мікроанімації для покращення.',
      
      ACCESSIBILITY: sentiment === 'NEGATIVE' ?
        '♿ Знайдено порушення доступності. Терміново потрібно виправити контрастність та навігацію.' :
        '♿ Рівень доступності задовільний. Рекомендується додати ARIA-атрибути.',
      
      BRANDING: sentiment === 'NEGATIVE' ?
        '🏢 Брендинг не узгоджується з фірмовим стилем. Потрібно переглянути використання логотипу.' :
        '🏢 Фірмовий стиль витриманий послідовно. Варто розширити палітру брендових елементів.'
    };

    return templates[category as keyof typeof templates] || templates.UX;
  }

  private mockRecommendations(category: string, projectType: string): string[] {
    const recommendations = {
      COLORS: [
        'Перевірити контрастність за стандартами WCAG AA',
        'Створити палітру з 3-5 основних кольорів',
        'Додати темну тему для користувачів'
      ],
      TYPOGRAPHY: [
        'Використовувати мінімум 16px для основного тексту',
        'Встановити чіткий інтерлін\'яж (1.4-1.6)',
        'Обмежити кількість шрифтових гарнітур до 2-3'
      ],
      LAYOUT: [
        'Дотримуватися правила золотого перерізу',
        'Використовувати послідовні відступи (8px grid)',
        'Забезпечити адаптивність під мобільні пристрої'
      ],
      UX: [
        'Скоротити кількість кроків до цільової дії',
        'Додати мікроанімації для зворотного зв\'язку',
        'Провести A/B тестування ключових елементів'
      ],
      ACCESSIBILITY: [
        'Забезпечити контрастність мінімум 4.5:1',
        'Додати alt-тексти для всіх зображень',
        'Реалізувати повну навігацію з клавіатури'
      ],
      BRANDING: [
        'Створити style guide для команди',
        'Забезпечити консистентність у всіх точках контакту',
        'Розробити адаптивні версії логотипу'
      ]
    };

    return recommendations[category as keyof typeof recommendations] || recommendations.UX;
  }

  private mockAccessibilityAnalysis(description: string) {
    return {
      score: 7.2,
      issues: [
        'Недостатній контраст для тексту на кнопках',
        'Відсутні aria-labels для іконок',
        'Фокус не завжди видимий при навігації з клавіатури'
      ],
      improvements: [
        'Збільшити контрастність до рівня AA',
        'Додати описи для декоративних елементів',
        'Реалізувати skip-to-content посилання'
      ]
    };
  }

  /**
   * Отримує статистику ШІ аналізів
   */
  getAnalyticsStats() {
    return {
      totalAnalyzed: 156,
      avgDesignScore: 7.4,
      topIssues: [
        { category: 'ACCESSIBILITY', count: 23 },
        { category: 'COLORS', count: 18 },
        { category: 'TYPOGRAPHY', count: 15 }
      ],
      improvementTrend: '+12% за місяць'
    };
  }
}

export default new AIDesignAnalyzer();