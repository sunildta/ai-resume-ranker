import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from './firebaseConfig';

// Google Authentication
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  try {
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getReadableErrorMessage(error.code)
      }
    };
  }
};

// Email/Password Sign Up
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's display name
    await updateProfile(result.user, { displayName });
    return { success: true, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getReadableErrorMessage(error.code)
      }
    };
  }
};

// Email/Password Login In
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getReadableErrorMessage(error.code)
      }
    };
  }
};

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: error.code,
        message: getReadableErrorMessage(error.code)
      }
    };
  }
};

// Helper function to convert Firebase error codes to readable messages
const getReadableErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request cancelled or another pop-up is already open.';
    case 'auth/requires-recent-login':
      return 'Please log in again to complete this action.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}; 