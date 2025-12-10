"use client";

import { ENDPOINTS } from "@/constants/endpoints";
import { ACCESS_TOKEN, USER_DATA } from "@/constants/misc";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { User } from "@/types/entities";
import { VerifyTokenPayload } from "@/types/request-payloads";
import { ResponsePayload } from "@/types/response-payload";
import { GetBackendEndpoint } from "@/utils/utilities";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Partial<User> | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const checkForStoredKeys = async () => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN);
    const storedUser = localStorage.getItem(USER_DATA);

    if (storedToken && storedUser) {
      try {
        const reqBody: VerifyTokenPayload = {
          token: storedToken
        }
        const rawRes = await fetch(`${await GetBackendEndpoint()}${ENDPOINTS.authVerifyToken}`, GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(reqBody)));
        const response: ResponsePayload<boolean> = await rawRes.json();
        console.log(response);
        const parsedUserData: Partial<User> = JSON.parse(storedUser);
        if(response.data === false){
          setAccessToken(null);
          setUser(null);
          localStorage.setItem(ACCESS_TOKEN, "");
          localStorage.setItem(USER_DATA, "");
        }
        if(response.error){
          setAccessToken(null);
          setUser(null);
          localStorage.setItem(ACCESS_TOKEN, "");
          localStorage.setItem(USER_DATA, "");
          throw new Error(response.message);
        }
        setAccessToken(storedToken);
        setUser(parsedUserData);
      } catch (error) {
        console.error("Error parsing stored user data", error);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(USER_DATA);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkForStoredKeys();
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem(ACCESS_TOKEN, token);
    localStorage.setItem(USER_DATA, JSON.stringify(userData));
  };
  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_DATA);
    router.push("/");
  };
  

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!accessToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
