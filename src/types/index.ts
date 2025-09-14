export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  select?: string;
}

export interface AuthTokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export interface FileUploadResult {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface AchievementData {
  type: string;
  title: string;
  description: string;
  condition: (stats: any) => boolean;
  badge: string;
}

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  userId: string;
  data?: any;
}
