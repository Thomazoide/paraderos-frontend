"use client"

import StatusMessageBox from "@/components/status-message-box";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { User } from "@/types/entities";
import { LoginPayload } from "@/types/request-payloads";
import { ResponsePayload } from "@/types/response-payload";
import { FastTokenCheck, GetBackendEndpoint } from "@/utils/utilities";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function Home() {

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { login, accessToken } = useAuth();
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const Login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(loading) return;
    try{
      setLoading(true);
      const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.authLogin}`;
      const body: LoginPayload = {
        username: username.current!.value,
        password: password.current!.value
      };
      const rawResponse = await fetch(endpoint, GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(body)));
      const response: ResponsePayload<string> = await rawResponse.json();
      if(response.error) throw new Error(response.message);
      if(response.data) {
        const userData: JwtPayload & Partial<User> = jwtDecode(response.data);
        login(response.data, userData as User);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(accessToken){
      const checkToken = async () => {
        const isValid = await FastTokenCheck(accessToken);
        if(isValid){
          router.push("/dashboard");
        }
      };
      checkToken();
    }
  }, [accessToken, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Bienvenido de nuevo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-yellow-400">
          <form className="space-y-6" action="#" method="POST" onSubmit={Login} >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  ref={username}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  ref={password}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Recordar mis datos
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                aria-disabled={loading}
                disabled={loading}
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                {
                  !loading ?
                  "Ingresar"
                  :
                  "Cargando..."
                }
              </button>
              {
                error ?
                <StatusMessageBox message={error.message} type="error" closeError={setError} value={error}/>
                : null
              }
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
