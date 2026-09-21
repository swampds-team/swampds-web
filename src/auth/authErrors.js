/** Maps Firebase auth error codes to plain-language messages. */
export function friendlyAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. This account is temporarily locked. Try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your project lead.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    default:
      return 'Sign-in failed. Please try again.';
  }
}
