import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './ConfigUser';
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthenticated(user);
      setLoading(true)
    });
    return () => unsubscribe();
  }, []);


  const login = () => setAuthenticated(true);
  const logout = () => setAuthenticated(false);

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      {loading && children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
export { AuthContext };
