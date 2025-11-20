// Types de base pour la plateforme d'échange de fichiers

export type UserRole = 'USER' | 'PREMIUM' | 'MODERATOR' | 'ADMIN';

export type FileStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'QUARANTINED' | 'DELETED';

export type ScanStatus = 'PENDING' | 'SCANNING' | 'COMPLETED' | 'FAILED';

export type ThreatLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SharePermission = 'VIEW' | 'DOWNLOAD' | 'COMMENT' | 'EDIT';

export type NotificationType = 
  | 'FILE_UPLOADED' 
  | 'FILE_SHARED' 
  | 'SCAN_COMPLETED' 
  | 'THREAT_DETECTED'
  | 'COMMENT_ADDED'
  | 'TEAM_INVITATION'
  | 'STORAGE_WARNING'
  | 'SYSTEM_ALERT';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  subscription?: Subscription;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail: boolean;
  showActivity: boolean;
}

export interface UserStatistics {
  totalFiles: number;
  totalStorage: number;
  filesShared: number;
  scansPerformed: number;
  threatsDetected: number;
}

export interface File {
  id: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  url: string;
  thumbnailUrl?: string;
  hash: string;
  status: FileStatus;
  userId: string;
  folderId?: string;
  tags: string[];
  metadata: FileMetadata;
  scanResult?: ScanResult;
  versions: FileVersion[];
  shares: Share[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  encoding?: string;
  pages?: number;
  [key: string]: unknown;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  url: string;
  size: number;
  hash: string;
  createdAt: Date;
  createdBy: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
  color?: string;
  icon?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScanResult {
  id: string;
  fileId: string;
  status: ScanStatus;
  isMalware: boolean;
  confidence: number;
  riskScore: number;
  threatLevel: ThreatLevel;
  threatType?: string;
  threatFamily?: string;
  modelVersion: string;
  features: Record<string, unknown>;
  explanation?: ScanExplanation;
  scanDate: Date;
  processingTime: number;
}

export interface ScanExplanation {
  summary: string;
  details: string[];
  recommendations: string[];
  visualizations?: {
    heatmap?: string;
    featureImportance?: Array<{ feature: string; importance: number }>;
  };
}

export interface Share {
  id: string;
  fileId: string;
  folderId?: string;
  createdBy: string;
  sharedWith?: string[];
  linkToken: string;
  password?: string;
  expiresAt?: Date;
  maxDownloads?: number;
  downloadCount: number;
  permissions: SharePermission[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Download {
  id: string;
  shareId: string;
  fileId: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  downloadedAt: Date;
}

export interface Comment {
  id: string;
  fileId: string;
  userId: string;
  user?: User;
  content: string;
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  ownerId: string;
  members: TeamMember[];
  storage: TeamStorage;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: User;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  permissions: string[];
  joinedAt: Date;
}

export interface TeamStorage {
  used: number;
  limit: number;
  filesCount: number;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'MONTH' | 'YEAR';
  features: PlanFeatures;
}

export interface PlanFeatures {
  storageLimit: number; // in bytes
  fileSizeLimit: number; // in bytes
  scansPerMonth: number;
  teamMembers: number;
  apiAccess: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  customBranding: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
}

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: Date;
  failureCount: number;
  createdAt: Date;
}

// Types pour les réponses API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types pour les filtres et recherche
export interface FileFilter {
  search?: string;
  type?: string[];
  tags?: string[];
  status?: FileStatus[];
  scanStatus?: ScanStatus[];
  threatLevel?: ThreatLevel[];
  dateFrom?: Date;
  dateTo?: Date;
  sizeMin?: number;
  sizeMax?: number;
  folderId?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

