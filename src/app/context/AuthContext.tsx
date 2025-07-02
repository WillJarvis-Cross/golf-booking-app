"use client";

import { Hub } from "aws-amplify/utils";

import { signIn, signOut, signUp, getCurrentUser } from "aws-amplify/auth";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        const mappedUser = {
          ...currentUser,
          email: currentUser?.signInDetails?.loginId || null,
        };
        setUser(mappedUser);
      })
      .catch(() => setUser(null));

    const unsubscribe = Hub.listen("auth", (data) => {
      const { payload } = data;

      switch (payload.event) {
        case "signedIn":
          getCurrentUser()
            .then((currentUser) => {
              const mappedUser = {
                ...currentUser,
                email: currentUser?.signInDetails?.loginId || null,
              };
              setUser(mappedUser);
            })
            .catch(() => setUser(null));
          break;
        case "signedOut":
          setUser(null);
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
