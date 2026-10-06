export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api/v1';

export const GITHUB_API_URL = `${API_BASE_URL}/github`;
export const AI_API_URL = `${API_BASE_URL}/ai`;
