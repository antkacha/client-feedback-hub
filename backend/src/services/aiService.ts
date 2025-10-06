/**
 * Mock AI Service для аналізу фідбеку клієнтів
 * Перетворює розпливчасті коментарі клієнтів у чіткі завдання для дизайнерів
 */

interface FeedbackAnalysisRequest {
  title: string;
  description: string;
  category?: string;
  severity?: string;
  context?: {
    projectName?: string;
    projectDescription?: string;
    url?: string;
  };
}

interface AIAnalysisResult {
  designerTasks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours: number;
  suggestions: string[];
  analysisScore: number; // 0-100, точність аналізу
  generatedAt: string;
  categories: string[]; // автоматично визначені категорії
  technicalRequirements?: string[];
  usabilityInsights?: string[];
}

export class MockAIService {
  // Шаблони для різних типів фідбеку
  private static readonly FEEDBACK_PATTERNS = {
    // UI/Дизайн проблеми
    ui_visibility: {
      keywords: ['не видно', 'не помітно', 'сховано', 'дрібний', 'блідний', 'незручно знайти'],
      tasks: [
        'Збільшити контрастність елемента відносно фону',
        'Додати візуальні акценти (тінь, обводка, градієнт)',
        'Оптимізувати розміри та позиціонування',
        'Провести A/B тест видимості елемента',
      ],
      suggestions: [
        'Перевірити дотримання принципів контрастності WCAG',
        'Розглянути додавання мікроанімацій для привернення уваги',
        'Тестувати на різних екранах та при різному освітленні',
      ]
    },

    // Мобільні проблеми
    mobile_issues: {
      keywords: ['мобільний', 'телефон', 'планшет', 'дрібний текст', 'важко натиснути', 'сенсорний'],
      tasks: [
        'Збільшити мінімальний розмір шрифту до 16px для мобільних',
        'Оптимізувати touch targets (мінімум 44px)',
        'Покращити адаптивність інтерфейсу',
        'Перевірити читабельність на малих екранах',
      ],
      suggestions: [
        'Використати CSS clamp() для адаптивних розмірів',
        'Провести тестування на реальних пристроях',
        'Розглянути Progressive Web App підходи',
      ]
    },

    // Проблеми з формами
    form_issues: {
      keywords: ['форма', 'не працює', 'не відправляється', 'кнопка не реагує', 'помилка'],
      tasks: [
        'Додати візуальний індикатор завантаження',
        'Створити чіткі повідомлення про помилки',
        'Покращити валідацію полів з миттєвим фідбеком',
        'Додати fallback для випадків без JavaScript',
      ],
      suggestions: [
        'Реалізувати автозбереження чернетки',
        'Додати прогрес-індикатори для довгих операцій',
        'Покращити accessibility для screen readers',
      ]
    },

    // Проблеми швидкості та продуктивності
    performance_issues: {
      keywords: ['повільно', 'тормозить', 'довго завантажується', 'лагає', 'зависає'],
      tasks: [
        'Оптимізувати зображення та мультимедіа',
        'Впровадити lazy loading для контенту',
        'Мінімізувати JavaScript та CSS',
        'Додати skeleton loading states',
      ],
      suggestions: [
        'Використати CDN для статичних ресурсів',
        'Впровадити кешування на клієнті',
        'Розглянути Server-Side Rendering',
      ]
    },

    // Загальні UX проблеми
    ux_issues: {
      keywords: ['незрозуміло', 'складно', 'не інтуїтивно', 'заплутано', 'не знаю що робити'],
      tasks: [
        'Покращити копірайтинг та мікротексти',
        'Додати підказки та onboarding елементи',
        'Оптимізувати user flow та навігацію',
        'Створити більш чітку ІА (інформаційну архітектуру)',
      ],
      suggestions: [
        'Провести usability тестування',
        'Додати інтерактивні туториали',
        'Використати принципи progressive disclosure',
      ]
    }
  };

  /**
   * Аналізує фідбек клієнта та генерує завдання для дизайнера
   */
  static async analyzeFeedback(request: FeedbackAnalysisRequest): Promise<AIAnalysisResult> {
    // Симуляція обробки ШІ (в реальності тут був би виклик OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const { title, description, category, severity } = request;
    const fullText = `${title} ${description}`.toLowerCase();

    // Визначаємо тип проблеми на основі ключових слів
    const detectedPatterns = this.detectPatterns(fullText);
    const primaryPattern = detectedPatterns[0] || 'ux_issues';
    const patternConfig = this.FEEDBACK_PATTERNS[primaryPattern as keyof typeof this.FEEDBACK_PATTERNS];

    // Генеруємо завдання для дизайнера
    const designerTasks = this.generateDesignerTasks(fullText, patternConfig, detectedPatterns);
    
    // Генеруємо пропозиції
    const suggestions = this.generateSuggestions(fullText, patternConfig, detectedPatterns);

    // Визначаємо пріоритет на основі тексту та заданого severity
    const priority = this.determinePriority(fullText, severity);

    // Оцінюємо час виконання
    const estimatedHours = this.estimateHours(designerTasks, priority);

    // Розраховуємо score точності аналізу
    const analysisScore = this.calculateAnalysisScore(detectedPatterns, fullText);

    return {
      designerTasks,
      priority,
      estimatedHours,
      suggestions,
      analysisScore,
      generatedAt: new Date().toISOString(),
      categories: this.generateCategories(detectedPatterns, category),
      technicalRequirements: this.generateTechnicalRequirements(detectedPatterns),
      usabilityInsights: this.generateUsabilityInsights(fullText, detectedPatterns)
    };
  }

  /**
   * Визначає паттерни проблем у тексті фідбеку
   */
  private static detectPatterns(text: string): string[] {
    const detected: string[] = [];

    for (const [patternName, pattern] of Object.entries(this.FEEDBACK_PATTERNS)) {
      const matchCount = pattern.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        detected.push(patternName);
      }
    }

    // Сортуємо за кількістю співпадінь
    return detected.sort((a, b) => {
      const aMatches = this.FEEDBACK_PATTERNS[a as keyof typeof this.FEEDBACK_PATTERNS].keywords
        .filter(k => text.includes(k.toLowerCase())).length;
      const bMatches = this.FEEDBACK_PATTERNS[b as keyof typeof this.FEEDBACK_PATTERNS].keywords
        .filter(k => text.includes(k.toLowerCase())).length;
      return bMatches - aMatches;
    });
  }

  /**
   * Генерує конкретні завдання для дизайнера
   */
  private static generateDesignerTasks(
    text: string, 
    primaryPattern: any, 
    allPatterns: string[]
  ): string[] {
    let tasks = [...primaryPattern.tasks];

    // Додаємо завдання з інших виявлених паттернів
    allPatterns.slice(1, 3).forEach(patternName => {
      const pattern = this.FEEDBACK_PATTERNS[patternName as keyof typeof this.FEEDBACK_PATTERNS];
      tasks.push(...pattern.tasks.slice(0, 2));
    });

    // Додаємо кастомні завдання на основі специфічних ключових слів
    if (text.includes('кольор') || text.includes('колір')) {
      tasks.push('Переглянути колірну схему та її контрастність');
    }
    
    if (text.includes('шрифт') || text.includes('текст')) {
      tasks.push('Оптимізувати типографіку та читабельність');
    }

    if (text.includes('кнопка')) {
      tasks.push('Покращити дизайн та стан кнопок (hover, active, disabled)');
    }

    // Обмежуємо кількість завдань
    return [...new Set(tasks)].slice(0, 6);
  }

  /**
   * Генерує додаткові пропозиції
   */
  private static generateSuggestions(
    text: string, 
    primaryPattern: any, 
    allPatterns: string[]
  ): string[] {
    let suggestions = [...primaryPattern.suggestions];

    // Додаємо загальні пропозиції
    suggestions.push(
      'Документувати зміни для майбутніх оновлень',
      'Створити style guide для подібних елементів'
    );

    if (allPatterns.includes('mobile_issues')) {
      suggestions.push('Розглянути mobile-first підхід у дизайні');
    }

    if (allPatterns.includes('performance_issues')) {
      suggestions.push('Співпрацювати з розробниками для оптимізації');
    }

    return [...new Set(suggestions)].slice(0, 4);
  }

  /**
   * Визначає пріоритет завдання
   */
  private static determinePriority(text: string, severity?: string): 'low' | 'medium' | 'high' | 'critical' {
    // Спочатку використовуємо severity, якщо він заданий
    if (severity) {
      const severityMap: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'CRITICAL': 'critical'
      };
      if (severityMap[severity]) {
        return severityMap[severity];
      }
    }

    // Високий пріоритет для критичних проблем
    const criticalKeywords = ['не працює', 'зламано', 'помилка', 'краш', 'недоступно'];
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return 'critical';
    }

    // Високий пріоритет для проблем з конверсією
    const highPriorityKeywords = ['кнопка', 'форма', 'замовлення', 'оплата', 'реєстрація'];
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }

    // Середній пріоритет для UX проблем
    const mediumPriorityKeywords = ['незручно', 'складно', 'не інтуїтивно'];
    if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }

    return 'medium'; // За замовчуванням
  }

  /**
   * Оцінює кількість годин для виконання
   */
  private static estimateHours(tasks: string[], priority: string): number {
    const baseHours = tasks.length * 1.5; // 1.5 години на завдання
    
    const priorityMultiplier: { [key: string]: number } = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.3,
      'critical': 0.7 // Критичні завдання часто простіші, але терміновіші
    };

    return Math.round(baseHours * priorityMultiplier[priority]);
  }

  /**
   * Розраховує точність аналізу
   */
  private static calculateAnalysisScore(detectedPatterns: string[], text: string): number {
    let score = 75; // Базовий score

    // Збільшуємо score за кількість виявлених паттернів
    score += Math.min(detectedPatterns.length * 5, 15);

    // Збільшуємо за довжину тексту (більше контексту = краща аналіз)
    if (text.length > 100) score += 5;
    if (text.length > 200) score += 5;

    // Зменшуємо за короткий текст
    if (text.length < 50) score -= 10;

    return Math.min(Math.max(score, 60), 98); // Обмежуємо між 60-98%
  }

  /**
   * Генерує категорії на основі аналізу
   */
  private static generateCategories(detectedPatterns: string[], originalCategory?: string): string[] {
    const categories = new Set<string>();

    if (originalCategory) {
      categories.add(originalCategory);
    }

    // Мапимо паттерни на категорії
    const patternToCategory: { [key: string]: string[] } = {
      'ui_visibility': ['дизайн', 'UX'],
      'mobile_issues': ['мобільний', 'адаптивність'],
      'form_issues': ['функціональність', 'UX'],
      'performance_issues': ['продуктивність', 'технічні'],
      'ux_issues': ['UX', 'usability']
    };

    detectedPatterns.forEach(pattern => {
      const cats = patternToCategory[pattern] || [];
      cats.forEach(cat => categories.add(cat));
    });

    return Array.from(categories).slice(0, 3);
  }

  /**
   * Генерує технічні вимоги
   */
  private static generateTechnicalRequirements(detectedPatterns: string[]): string[] {
    const requirements: string[] = [];

    if (detectedPatterns.includes('mobile_issues')) {
      requirements.push(
        'Responsive design для екранів 320px+',
        'Touch-friendly інтерфейси (44px мінімум)',
        'Тестування на iOS та Android'
      );
    }

    if (detectedPatterns.includes('performance_issues')) {
      requirements.push(
        'Core Web Vitals оптимізація',
        'Lazy loading зображень',
        'Bundle size оптимізація'
      );
    }

    if (detectedPatterns.includes('ui_visibility')) {
      requirements.push(
        'WCAG 2.1 AA сумісність',
        'Контрастність мінімум 4.5:1',
        'Keyboard navigation'
      );
    }

    return requirements.slice(0, 4);
  }

  /**
   * Генерує UX інсайти
   */
  private static generateUsabilityInsights(text: string, detectedPatterns: string[]): string[] {
    const insights: string[] = [];

    if (text.includes('не знаю') || text.includes('незрозуміло')) {
      insights.push('Користувач потребує кращих підказок та навігації');
    }

    if (text.includes('довго') || text.includes('повільно')) {
      insights.push('Швидкість відгуку критично впливає на UX');
    }

    if (detectedPatterns.includes('mobile_issues')) {
      insights.push('Mobile experience потребує окремої уваги та тестування');
    }

    if (text.includes('кнопка') && (text.includes('не працює') || text.includes('не реагує'))) {
      insights.push('Критична проблема з основним user flow');
    }

    insights.push(
      'Рекомендується провести usability тестування після впровадження змін',
      'Розглянути можливість A/B тестування різних варіантів рішення'
    );

    return insights.slice(0, 3);
  }

  /**
   * Регенерує аналіз з урахуванням нового контексту
   */
  static async regenerateAnalysis(
    originalRequest: FeedbackAnalysisRequest,
    additionalContext?: {
      previousAnalysis?: AIAnalysisResult;
      userFeedback?: string;
      implementationResults?: string;
    }
  ): Promise<AIAnalysisResult> {
    // Симуляція більш складного аналізу з урахуванням контексту
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));

    const analysis = await this.analyzeFeedback(originalRequest);
    
    // Покращуємо аналіз на основі додаткового контексту
    if (additionalContext?.previousAnalysis) {
      analysis.analysisScore = Math.min(analysis.analysisScore + 5, 98);
      analysis.suggestions.unshift('Врахувати результати попереднього аналізу');
    }

    if (additionalContext?.userFeedback) {
      analysis.suggestions.push('Інкорпорувати додатковий фідбек користувача');
    }

    return analysis;
  }
}

export type { FeedbackAnalysisRequest, AIAnalysisResult };