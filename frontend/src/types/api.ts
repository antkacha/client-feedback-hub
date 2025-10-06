/**
 * Типи даних для API відповідей та запитів
 * Покриває всі сутності: користувачі, проекти, відгуки, коментарі
 */

// Базові типи
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Користувач
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member' | 'viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
  refreshToken: string;
}

// Авторизація
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

// Проект
export interface Project {
  id: string;
  name: string;
  description?: string;
  url?: string;
  status: 'active' | 'archived' | 'draft';
  ownerId: string;
  owner: User;
  members: ProjectMember[];
  membersCount: number;
  feedbackCount: number;
  completedFeedbackCount: number;
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: User;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

export interface ProjectSettings {
  isPublic: boolean;
  allowAnonymousFeedback: boolean;
  requireApproval: boolean;
  emailNotifications: boolean;
  slackWebhook?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  url?: string;
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: Project['status'];
}

// Відгук
export interface Feedback {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  project: Project;
  authorId?: string;
  author?: User;
  assigneeId?: string;
  assignee?: User;
  tags: string[];
  url?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  browserInfo?: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  attachments: FeedbackAttachment[];
  comments: FeedbackComment[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  feedbackId: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  title: string;
  description?: string;
  priority: Feedback['priority'];
  tags?: string[];
  url?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  browserInfo?: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  attachments?: File[];
}

export interface UpdateFeedbackRequest extends Partial<CreateFeedbackRequest> {
  status?: Feedback['status'];
  assigneeId?: string;
}

// Коментарі
export interface FeedbackComment {
  id: string;
  content: string;
  feedbackId: string;
  authorId?: string;
  author?: User;
  isInternal: boolean;
  attachments: CommentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  commentId: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
  isInternal?: boolean;
  attachments?: File[];
}

// Статистика
export interface ProjectStats {
  totalFeedback: number;
  openFeedback: number;
  inProgressFeedback: number;
  resolvedFeedback: number;
  closedFeedback: number;
  feedbackByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  feedbackTrend: {
    date: string;
    count: number;
  }[];
  popularTags: {
    tag: string;
    count: number;
  }[];
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalFeedback: number;
  pendingFeedback: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'feedback_created' | 'feedback_updated' | 'comment_added' | 'project_created';
  title: string;
  description?: string;
  userId?: string;
  user?: User;
  projectId?: string;
  project?: Project;
  feedbackId?: string;
  feedback?: Feedback;
  createdAt: string;
}

// Фільтри та пошук
export interface FeedbackFilters {
  status?: Feedback['status'][];
  priority?: Feedback['priority'][];
  assigneeId?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ProjectFilters {
  status?: Project['status'][];
  search?: string;
}

// Налаштування користувача
export interface UserSettings {
  emailNotifications: {
    newFeedback: boolean;
    feedbackUpdates: boolean;
    comments: boolean;
    assignments: boolean;
  };
  uiPreferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'uk' | 'en';
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  };
}

export interface UpdateUserSettingsRequest extends Partial<UserSettings> {}