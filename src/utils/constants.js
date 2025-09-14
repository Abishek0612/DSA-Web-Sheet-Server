const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const USER_ROLES = {
  STUDENT: "student",
  ADMIN: "admin",
  MODERATOR: "moderator",
};

const PROBLEM_DIFFICULTIES = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

const PROBLEM_STATUS = {
  PENDING: "pending",
  ATTEMPTED: "attempted",
  SOLVED: "solved",
};

const TOPIC_CATEGORIES = [
  "Data Structures",
  "Algorithms",
  "Dynamic Programming",
  "Graph Theory",
  "String Processing",
  "Mathematics",
  "Greedy",
  "Sorting & Searching",
  "Tree & Binary Search Tree",
  "Linked List",
  "Stack & Queue",
  "Hash Table",
  "Heap",
  "Trie",
  "Bit Manipulation",
];

const PROGRAMMING_LANGUAGES = [
  "javascript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
  "typescript",
  "swift",
  "kotlin",
];

const FILE_TYPES = {
  IMAGES: ["jpg", "jpeg", "png", "gif", "webp"],
  DOCUMENTS: ["pdf", "doc", "docx", "txt"],
  CODE: ["js", "py", "java", "cpp", "c", "cs", "go", "rs", "ts"],
  ARCHIVES: ["zip", "rar", "7z", "tar", "gz"],
};

const MAX_FILE_SIZES = {
  AVATAR: 5 * 1024 * 1024,
  DOCUMENT: 10 * 1024 * 1024,
  CODE_FILE: 1 * 1024 * 1024,
  GENERAL: 50 * 1024 * 1024,
};

const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },
  AI: {
    WINDOW_MS: 60 * 60 * 1000,
    MAX_REQUESTS: 50,
  },
  UPLOAD: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 10,
  },
};

const EMAIL_TYPES = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password_reset",
  STREAK_REMINDER: "streak_reminder",
  ACHIEVEMENT: "achievement",
  WEEKLY_PROGRESS: "weekly_progress",
};

const NOTIFICATION_TYPES = {
  WELCOME: "welcome",
  STREAK_REMINDER: "streak_reminder",
  ACHIEVEMENT: "achievement",
  MILESTONE: "milestone",
  WEEKLY_REPORT: "weekly_report",
  SYSTEM: "system",
};

const ACHIEVEMENTS = {
  FIRST_PROBLEM: "First Problem Solved",
  STREAK_7: "7 Day Streak",
  STREAK_30: "30 Day Streak",
  STREAK_100: "100 Day Streak",
  PROBLEMS_10: "10 Problems Solved",
  PROBLEMS_50: "50 Problems Solved",
  PROBLEMS_100: "100 Problems Solved",
  PROBLEMS_500: "500 Problems Solved",
  TOPIC_MASTER: "Topic Master",
  SPEED_DEMON: "Speed Demon",
  PERFECTIONIST: "Perfectionist",
};

const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};

const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

const CACHE_DURATIONS = {
  SHORT: 5 * 60,
  MEDIUM: 30 * 60,
  LONG: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
};

const JWT_EXPIRES = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  RESET_TOKEN: "1h",
  VERIFICATION_TOKEN: "24h",
};

const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  PROBLEM_DIFFICULTIES,
  PROBLEM_STATUS,
  TOPIC_CATEGORIES,
  PROGRAMMING_LANGUAGES,
  FILE_TYPES,
  MAX_FILE_SIZES,
  RATE_LIMITS,
  EMAIL_TYPES,
  NOTIFICATION_TYPES,
  ACHIEVEMENTS,
  REGEX_PATTERNS,
  DEFAULT_PAGINATION,
  CACHE_DURATIONS,
  JWT_EXPIRES,
  ENVIRONMENTS,
};
