"use client"

import Sidebar from "@/components/sidebar";
import CreateWorkOrderModal from "@/components/create-work-order-modal";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { WorkOrder, Route } from "@/types/entities";
import { ResponsePayload } from "@/types/response-payload";
import { FastTokenCheck, GetBackendEndpoint, rejectSession } from "@/utils/utilities";
import { Plus, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkOrdersPage() {
    const { user, logout, accessToken } = useAuth();
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [errorFetching, setErrorFetching] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const backendUrl = await GetBackendEndpoint();
            const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);

            // Fetch Work Orders
            const woRes = await fetch(`${backendUrl}${ENDPOINTS.workOrders}`, config);
            const woData: ResponsePayload<WorkOrder[]> = await woRes.json();
            if (woData.error) throw new Error(woData.message);
            setWorkOrders(woData.data || []);

            // Fetch Routes
            const routesRes = await fetch(`${backendUrl}${ENDPOINTS.routes}`, config);
            const routesData: ResponsePayload<Route[]> = await routesRes.json();
            if (!routesData.error) {
                setRoutes(routesData.data || []);
            }

        } catch (err) {
            setErrorFetching(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            rejectSession(router, accessToken);
            fetchData();
        }
    }, []);

    const handleCreateWorkOrder = async (routeId: number) => {
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.workOrders}`;
            const ruta = routes.find( (r) => r.id === routeId );
            const payload = JSON.stringify({
                creation_date: new Date().toISOString(),
                route_id: routeId,
                route: ruta ? ruta : null
            });
            const config = GetRequestConfig(METHODS.POST, "JSON", payload, accessToken!);
            const response: ResponsePayload<WorkOrder> = await (await fetch(endpoint, config)).json();
            
            if(response.error) throw new Error(response.message);
            
            setIsCreating(false);
            fetchData(); // Refresh list
        } catch (err) {
            alert("Error al crear la orden de trabajo: " + (err as Error).message);
        }
    };

    const handleTakeOrder = async (orderId: number) => {
        if (!user?.id) return;
        try {
            const backendUrl = await GetBackendEndpoint();
            const endpoint = `${backendUrl}${ENDPOINTS.workOrders}`;
            
            // We send the ID and the new user_id to update the order
            const payload = JSON.stringify({
                id: orderId,
                user_id: user.id,
                user_final: user
            });
            
            const config = GetRequestConfig(METHODS.POST, "JSON", payload, accessToken!);
            const response: ResponsePayload<WorkOrder> = await (await fetch(endpoint, config)).json();
            
            if(response.error) throw new Error(response.message);
            
            fetchData(); // Refresh list
            alert("Orden asignada correctamente.");
        } catch (err) {
            alert("Error al tomar la orden: " + (err as Error).message);
        }
    };

    const totalOrders = workOrders.length;
    const completedOrders = workOrders.filter(wo => wo.completada).length;
    const incompleteOrders = totalOrders - completedOrders;
    const hasRoutes = routes.length > 0;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar
                fullName={user?.full_name || "usuario"}
                userType={user?.user_type || "oferente"}
                onLogout={logout}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="md:hidden h-16" />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Órdenes de trabajo</h1>
                        {user?.user_type !== 'terreno' && (
                            hasRoutes ? (
                                <button 
                                    onClick={() => setIsCreating(true)}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={20} />
                                    Crear Orden
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-md border border-amber-200">
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">
                                        No hay rutas creadas.{" "}
                                        <Link href="/rutas" className="underline hover:text-amber-800">
                                            Ir a Rutas
                                        </Link>
                                    </span>
                                </div>
                            )
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            title="Total Órdenes"
                            value={totalOrders}
                            icon={<FileText className="text-blue-500" />}
                            bgColor="bg-blue-50"
                        />
                        <StatCard
                            title="Pendientes"
                            value={incompleteOrders}
                            icon={<Clock className="text-orange-500" />}
                            bgColor="bg-orange-50"
                        />
                        <StatCard
                            title="Completadas"
                            value={completedOrders}
                            icon={<CheckCircle className="text-green-500" />}
                            bgColor="bg-green-50"
                        />
                    </div>

                    {/* List Section */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Listado de Órdenes
                            </h3>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Cargando...</div>
                        ) : totalOrders === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No existen órdenes de trabajo registradas.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {workOrders.map((order) => (
                                    <li key={order.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-medium text-blue-600 truncate">
                                                    Orden #{order.id}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Creada: {new Date(order.creation_date).toLocaleDateString()}
                                                </p>
                                                {order.route && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Progreso: {order.stops_visited?.length || 0} / {order.route.route_points?.length || 0} paraderos
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.completada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.completada ? 'Completada' : 'Pendiente'}
                                                </span>
                                                {user?.user_type === 'terreno' && !order.completada && order.user_id !== user.id && (
                                                    <button
                                                        onClick={() => handleTakeOrder(order.id)}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                                    >
                                                        Tomar Orden
                                                    </button>
                                                )}
                                                {user?.user_type === 'terreno' && !order.completada && order.user_id === user.id && (
                                                    <span className="text-xs text-blue-600 font-medium border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                                                        Asignada a ti
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>
            <CreateWorkOrderModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                routes={routes}
                onCreate={handleCreateWorkOrder}
            />
        </div>
    );
}

function StatCard({ title, value, icon, bgColor }: { title: string, value: number, icon: React.ReactNode, bgColor: string }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`shrink-0 rounded-md p-3 ${bgColor}`}>
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">
                                    {value}
                                </div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}