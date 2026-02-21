// Re-export user search functionality from core user-management
export { 
  searchUsersApi as searchUsers,
  type UserSearchItem,
  type UserSearchParams 
} from '../core/user-management';

// Re-export Google Authenticator API
export {
  setupGoogleAuthApi,
  verifyGoogleAuthApi,
  disableGoogleAuthApi,
  getGoogleAuthStatusApi,
  regenerateBackupCodesApi,
  type GoogleAuthSetup,
  type GoogleAuthVerifyResponse,
  type GoogleAuthStatus,
} from './googleAuth'; 