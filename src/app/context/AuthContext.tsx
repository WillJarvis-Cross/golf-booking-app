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
        // Map the email from signInDetails.loginId
        const mappedUser = {
          ...currentUser,
          email: currentUser?.signInDetails?.loginId || null,
        };
        setUser(mappedUser);
      })
      .catch(() => setUser(null));

    const listener = (data: any) => {
      switch (data.payload.event) {
        case "signedIn":
          getCurrentUser().then((currentUser) => {
            const mappedUser = {
              ...currentUser,
              email: currentUser?.signInDetails?.loginId || null,
            };
            setUser(mappedUser);
          });
          break;
        case "signedOut":
          setUser(null);
          break;
      }
    };

    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
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
