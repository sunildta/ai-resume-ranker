import  { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'; // Renamed signOut to firebaseSignOut
import { auth } from '../firebase/firebaseConfig'; // Your Firebase auth instance

// 1. Create the Context
const AuthContext = createContext();

// 2. Create a custom hook to use the AuthContext easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // To manage initial auth state loading


  useEffect(() => {
    // This listener will be called whenever the user's sign-in state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth state has been determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  // Function to sign out the user
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // The onAuthStateChanged listener will handle updating currentUser to null
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Re-throw to allow component to catch and display error
    }
  };

  // The value that will be provided to consumers of this context
  const value = {
    currentUser,
    loading,
    signOut, // Expose the signOut function
    // You could add signIn, signUp functions here too, or keep them in specific pages
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when the auth state has been determined */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

