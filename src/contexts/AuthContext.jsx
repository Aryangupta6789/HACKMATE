import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, fullName, additionalData = {}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update Profile
    await updateProfile(user, { displayName: fullName });
    
    // Create User Document in Firestore
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        photoURL: user.photoURL || "",
        honorScore: 100, // Default honor score
        collegeName: additionalData.collegeName || "",
        skills: additionalData.skills || [],
        experienceLevel: additionalData.experienceLevel || "Beginner",
        linkedinUrl: additionalData.linkedinUrl || "",
        githubUrl: additionalData.githubUrl || "",
        resumeUrl: additionalData.resumeUrl || "",
        createdAt: new Date()
    });
    
    return userCredential;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Subscribe to user document
        unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
           if (docSnap.exists()) {
             setCurrentUser({ ...user, ...docSnap.data() }); 
           } else {
             setCurrentUser(user);
           }
           setLoading(false);
        }, (error) => {
           console.error("Auth Doc Error:", error);
           setLoading(false);
        });
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeDoc) unsubscribeDoc();
    }
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
