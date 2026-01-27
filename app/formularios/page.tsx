"use client"
import Sidebar from "@/components/sidebar";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { useAuth } from "@/context/auth-context";
import { User, VisitForm } from "@/types/entities";
import { ResponsePayload } from "@/types/response-payload";
import { formatDate, GetBackendEndpoint } from "@/utils/utilities";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";

export default function Forms() {
    const [forms, setForms] = useState<VisitForm[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { user, accessToken, logout } = useAuth();

    const fetchForms = async () => {
        try {
            setLoading(true);
            const backendURL = await GetBackendEndpoint();
            if(!backendURL) throw new Error("Error al obtener ruta del backend");
            if(!accessToken) throw new Error("Sin token de acceso");
            const endpoint = user?.user_type === "terreno" ? `${backendURL}${ENDPOINTS.visitFormByUserID(user!.id!)}` : `${backendURL}${ENDPOINTS.visitForms}`;
            const reqConfig = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            const response = await (await fetch(endpoint, reqConfig)).json() as ResponsePayload<VisitForm[]>;
            if(response.error) throw new Error(response.message || "error desconocido");
            console.log(response.data);
            setForms(response.data!);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }

    const fetchTerrainUsers = async () => {
        try {
            setLoading(true);
            const backendURL = await GetBackendEndpoint();
            if(!backendURL) throw new Error("Error al obtener ruta del backend");
            if(!accessToken) throw new Error("Sin token de acceso");
            const endpoint = `${backendURL}${ENDPOINTS.users}`;
            const reqConfig = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken!);
            const response = await (await fetch(endpoint, reqConfig)).json() as ResponsePayload<User[]>;
            if(response.error) throw new Error(response.message || "error desconocido");
            const terrainUsers = response.data!.filter((u) => u.user_type === "terreno");
            console.log(terrainUsers);
            setUsers(terrainUsers);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }
    
    useEffect( () => {
        fetchForms();
        if(user?.user_type !== "terreno") fetchTerrainUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    return(
        <div className="flex min-h-screen bg-gray-100" >
            <Sidebar
            fullName={user?.full_name || "usuario"}
            userType={user?.user_type || "oferente"}
            onLogout={logout}
            />
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-row gap-5 border rounded-xl border-gray-300 shadow w-full h-fit p-4">
                        {
                            loading ?
                            <p className="text-2xl font-bold text-gray-400" >Cargando...</p> 
                            :
                            <> 
                            
                            <input className="w-full border border-gray-400 shadow shadow-gray-400 p-2 rounded-xl outline-0" type="text" placeholder="Filtrar formularios" />
                            { user?.user_type !== "terreno" ?
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered" color="primary" className="shadow-sm shadow-blue-600" >Filtrar por usuario <ChevronDown size={32}/></Button>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="lista-usuarios">
                                        {
                                            users.length === 0 ?
                                            <DropdownItem disableAnimation={true} key="0">
                                                Sin usuarios
                                            </DropdownItem>
                                            :
                                            users.map( (u) => (
                                                <DropdownItem key={u.id} value={u.id} >
                                                    {u.full_name}
                                                </DropdownItem>
                                            ) )
                                        }
                                    </DropdownMenu>
                                </Dropdown>
                                : 
                                null
                            }
                            </>
                        }
                    </div>
                    <div className="flex flex-col gap-4 item-center rounded-xl border border-gray-300 bg-blend-difference  shadow-md w-full h-fit overflow-y-auto p-4 my-5">
                        {
                            loading ?
                            <p className=""></p>
                            :
                            forms.length < 1 ?
                            <p className="text-2xl font-bold">
                                Sin formularios creados
                            </p>
                            :
                            forms.map( (f) => (
                                <div key={f.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 hover:shadow-md transition" >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">Formulario #{f.id}</h3>
                                            <p className="text-gray-600">Órden de trabajo #{f.workOrderId}</p>
                                            <p className="text-gray-600">Creada el: {formatDate(f.creation_date)}</p>
                                            <p className="text-gray-600">Ruta: {f.route?.route_name}</p>
                                            <p className="text-gray-600">Paradero #{f.busStopId} - {f.busStop?.description}</p>
                                            <p className="text-gray-600">Creada por: {f.user?.full_name}</p>
                                        </div>
                                        <div className="flex flex-col" >
                                            <p>Estado: <strong className={`${f.completed ? "text-green-500" : "text-orange-500"}`} > { f.completed ? "Completada" : "Pendiente" } </strong> </p>
                                            <p> {f.completed && f.completion_date ? `Completada el: ${formatDate(f.completion_date)}` : ""} </p>
                                            <Button variant="solid" color="primary" >
                                                Ver detalles
                                            </Button>
                                        </div>
                                    </div>
                                    
                                </div>
                            ) )
                        }
                    </div>
                </main>
            </div>
        </div>
    )
};