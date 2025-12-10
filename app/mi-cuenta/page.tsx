"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import StatusMessageBox from "@/components/status-message-box";
import { GetBackendEndpoint, rejectSession } from "@/utils/utilities";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { ResponsePayload } from "@/types/response-payload";
import { User } from "@/types/entities";
import { Save, Lock, User as UserIcon, Mail, Shield } from "lucide-react";

export default function MyAccountPage() {
  const { user, accessToken, loading: authLoading, logout, login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if(accessToken) rejectSession(router, accessToken);
    if (!authLoading && !user) {
      router.push("/");
    } else if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        username: user.username || "",
      });
    }
  }, [user, authLoading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = await GetBackendEndpoint();
      const payload = {
        id: user.id,
        ...formData,
        user_type: user.user_type // Preserve user type
      };

      const res = await fetch(
        `${backendUrl}${ENDPOINTS.userUpdate}`,
        GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(payload), accessToken)
      );
      const data: ResponsePayload<User> = await res.json();

      if (data.error) throw new Error(data.message);

      setSuccess("Perfil actualizado correctamente.");
      
      if (data.data && accessToken) {
        login(accessToken, data.data);
      }

    } catch (err) {
      console.error(err);
      setError(new Error((err as Error).message || "Error al actualizar el perfil"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(new Error("Las nuevas contraseñas no coinciden"));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = await GetBackendEndpoint();
      const payload = {
        id: user.id,
        password: passwordData.newPassword
      };

      const res = await fetch(
        `${backendUrl}${ENDPOINTS.userChangePassword}`,
        GetRequestConfig(METHODS.POST, "JSON", JSON.stringify(payload), accessToken)
      );
      const data: ResponsePayload<boolean> = await res.json();

      if (data.error) throw new Error(data.message);

      setSuccess("Contraseña actualizada correctamente.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });

    } catch (err) {
      console.error(err);
      setError(new Error((err as Error).message || "Error al actualizar la contraseña"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        fullName={user?.full_name || "Usuario"} 
        userType={user?.user_type || "oferente"} 
        onLogout={logout} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden h-16" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mi Cuenta</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`${
                      activeTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2`}
                  >
                    <UserIcon className="h-4 w-4" />
                    Información Personal
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`${
                      activeTab === 'security'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2`}
                  >
                    <Lock className="h-4 w-4" />
                    Seguridad
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'profile' ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                          Nombre Completo
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="full_name"
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="Juan Pérez"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                          Nombre de Usuario
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="username"
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Correo Electrónico
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                            placeholder="juan@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tipo de Usuario
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            disabled
                            value={user?.user_type || ""}
                            className="bg-gray-50 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">El tipo de usuario no se puede modificar.</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? "Guardando..." : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          Nueva Contraseña
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="new-password"
                            id="new-password"
                            required
                            minLength={6}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirmar Nueva Contraseña
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="confirm-password"
                            id="confirm-password"
                            required
                            minLength={6}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? "Actualizando..." : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Actualizar Contraseña
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {error && (
            <StatusMessageBox 
              message={error.message} 
              type="error" 
              closeError={setError} 
              value={error} 
            />
          )}
          
          {success && (
            <StatusMessageBox 
              message={success} 
              type="success"
              closeAction={() => setSuccess(null)}
              value={!!success} 
            />
          )}
        </main>
      </div>
    </div>
  );
}