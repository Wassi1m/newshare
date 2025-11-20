// Constantes de l'application

export const APP_NAME = "SecureShare";
export const APP_DESCRIPTION = "Plateforme d'échange de fichiers sécurisés avec détection IA de malwares";

// Limites de fichiers
export const FILE_SIZE_LIMITS = {
  FREE: 100 * 1024 * 1024, // 100 MB
  PREMIUM: 1024 * 1024 * 1024, // 1 GB
  BUSINESS: 5 * 1024 * 1024 * 1024, // 5 GB
  ENTERPRISE: 10 * 1024 * 1024 * 1024, // 10 GB
};

export const STORAGE_LIMITS = {
  FREE: 5 * 1024 * 1024 * 1024, // 5 GB
  PREMIUM: 100 * 1024 * 1024 * 1024, // 100 GB
  BUSINESS: 1024 * 1024 * 1024 * 1024, // 1 TB
  ENTERPRISE: 5 * 1024 * 1024 * 1024 * 1024, // 5 TB
};

// Types de fichiers autorisés
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
  AUDIO: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  SPREADSHEETS: ['xls', 'xlsx', 'csv', 'ods'],
  PRESENTATIONS: ['ppt', 'pptx', 'odp'],
  ARCHIVES: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'html', 'css'],
};

export const ALL_ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES).flat();

// Scans
export const SCAN_LIMITS = {
  FREE: 10,
  PREMIUM: 100,
  BUSINESS: 1000,
  ENTERPRISE: -1, // illimité
};

// Niveaux de menace
export const THREAT_COLORS = {
  SAFE: 'green',
  LOW: 'yellow',
  MEDIUM: 'orange',
  HIGH: 'red',
  CRITICAL: 'purple',
};

export const THREAT_LABELS = {
  SAFE: 'Sûr',
  LOW: 'Risque faible',
  MEDIUM: 'Risque moyen',
  HIGH: 'Risque élevé',
  CRITICAL: 'Critique',
};

// Rôles
export const ROLE_PERMISSIONS = {
  USER: ['view_own_files', 'upload_files', 'share_files', 'comment'],
  PREMIUM: ['view_own_files', 'upload_files', 'share_files', 'comment', 'advanced_analytics', 'api_access'],
  MODERATOR: ['view_all_files', 'moderate_content', 'manage_users', 'view_reports'],
  ADMIN: ['*'], // toutes les permissions
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Cache
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 heure
  DAY: 86400, // 24 heures
};

// API ML
export const ML_API_CONFIG = {
  ENDPOINT: process.env.ML_API_ENDPOINT || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
};

// Email
export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@secureshare.com';

// URLs
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  DASHBOARD: '/dashboard',
  FILES: '/files',
  SHARES: '/shares',
  SCAN: '/scan',
  TEAMS: '/teams',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Adresse email invalide',
  INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux',
  FILE_TYPE_NOT_ALLOWED: 'Type de fichier non autorisé',
  STORAGE_LIMIT_EXCEEDED: 'Limite de stockage dépassée',
  SCAN_LIMIT_EXCEEDED: 'Limite de scans dépassée',
  UNAUTHORIZED: 'Non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
  SERVER_ERROR: 'Erreur serveur',
  NETWORK_ERROR: 'Erreur réseau',
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'Fichier uploadé avec succès',
  FILE_DELETED: 'Fichier supprimé avec succès',
  FILE_SHARED: 'Fichier partagé avec succès',
  PROFILE_UPDATED: 'Profil mis à jour avec succès',
  PASSWORD_CHANGED: 'Mot de passe changé avec succès',
  SETTINGS_SAVED: 'Paramètres enregistrés avec succès',
};

