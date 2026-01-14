"use client";

import { useEffect, useMemo, useState } from "react";
import { BusStop, VisitForm, WorkOrder } from "@/types/entities";
import { GetBackendEndpoint } from "@/utils/utilities";
import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { ResponsePayload } from "@/types/response-payload";
import { useAuth } from "@/context/auth-context";

interface WorkOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: WorkOrder | null;
}

export default function WorkOrderDetailsModal({ isOpen, onClose, order }: WorkOrderDetailsModalProps) {
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [forms, setForms] = useState<VisitForm[]>([]);

  const visitedStopIds = useMemo(() => order?.stops_visited || [], [order]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!isOpen || !order || !accessToken) return;
      setLoading(true);
      setError(null);
      try {
        const backendUrl = await GetBackendEndpoint();
        const config = GetRequestConfig(METHODS.GET, "JSON", undefined, accessToken);

        const stopsRes = await fetch(`${backendUrl}${ENDPOINTS.busStops}`, config);
        const stopsData: ResponsePayload<BusStop[]> = await stopsRes.json();
        if (!stopsData.error && stopsData.data) {
          setBusStops(stopsData.data);
        } else {
          setBusStops([]);
        }

        let specificOrderForms: VisitForm[] | null = null;
        try {
          const orderRes = await fetch(`${backendUrl}${ENDPOINTS.workOrderByID(order.id)}`, config);
          const orderData: ResponsePayload<WorkOrder> = await orderRes.json();
          if (!orderData.error && orderData.data && Array.isArray(orderData.data.forms)) {
            specificOrderForms = orderData.data.forms as VisitForm[];
          }
        } catch {}

        if (specificOrderForms) {
          setForms(specificOrderForms);
        } else {
          const formsPromises: Promise<VisitForm[]>[] = [];
          if (order.route_id) {
            formsPromises.push(
              (async () => {
                const r = await fetch(`${backendUrl}${ENDPOINTS.visitFormByRouteID(order.route_id!)}`, config);
                const d: ResponsePayload<VisitForm[]> = await r.json();
                return d.data || [];
              })()
            );
          }
          if (order.user_id) {
            formsPromises.push(
              (async () => {
                const r = await fetch(`${backendUrl}${ENDPOINTS.visitFormByUserID(order.user_id!)}`, config);
                const d: ResponsePayload<VisitForm[]> = await r.json();
                return d.data || [];
              })()
            );
          }

          const results = await Promise.all(formsPromises);
          const merged = results.flat();
          const filtered = merged.filter(f => f.workOrderId === order.id);
          const byId: Record<number, VisitForm> = {};
          filtered.forEach(f => { byId[f.id] = f; });
          setForms(Object.values(byId));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar detalles");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, order, accessToken]);

  const visitedStops: BusStop[] = useMemo(() => {
    if (!visitedStopIds?.length) return [];
    const setIds = new Set(visitedStopIds);
    return busStops.filter(s => setIds.has(s.id));
  }, [busStops, visitedStopIds]);

  if (!isOpen || !order) return null;

  const getStopCode = (id: number) => busStops.find(s => s.id === id)?.codigo || `Paradero #${id}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detalles de Orden #{order.id}
                </h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Asignación</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.user_final?.full_name ? `Asignada a: ${order.user_final.full_name}` : order.user_id ? `Usuario ID: ${order.user_id}` : "No asignada"}
                    </p>
                    <p className="text-sm text-gray-600">Ruta: {order.route?.route_name || (order.route_id ? `#${order.route_id}` : "N/A")}</p>
                    <p className="text-sm text-gray-600">Creada: {new Date(order.creation_date).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Estado</h4>
                    <p className="text-sm mt-1">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.completada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.completada ? 'Completada' : 'Pendiente'}
                      </span>
                    </p>
                    {order.complete_date && (
                      <p className="text-sm text-gray-600 mt-1">Cierre: {new Date(order.complete_date).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-800">Paraderos visitados</h4>
                  {loading ? (
                    <div className="text-sm text-gray-500 mt-2">Cargando…</div>
                  ) : visitedStopIds?.length === 0 ? (
                    <div className="text-sm text-gray-500 mt-2">No hay paraderos visitados aún.</div>
                  ) : (
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {visitedStops.map((s) => (
                        <li key={s.id} className="px-4 py-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{s.codigo}</p>
                            <p className="text-xs text-gray-500">{s.description}</p>
                          </div>
                          <span className="text-xs text-gray-400">ID: {s.id}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-800">Formularios relacionados</h4>
                  {loading ? (
                    <div className="text-sm text-gray-500 mt-2">Cargando…</div>
                  ) : forms.length === 0 ? (
                    <div className="text-sm text-gray-500 mt-2">No hay formularios relacionados.</div>
                  ) : (
                    <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                      {forms.map(f => (
                        <li key={f.id} className="px-4 py-2">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <p className="text-sm font-medium text-gray-900">Formulario #{f.id}</p>
                              <p className="text-xs text-gray-500">Paradero: {getStopCode(f.busStopId)}</p>
                              <p className="text-xs text-gray-500">Creado: {new Date(f.creation_date).toLocaleString()}</p>
                              {f.completion_date && (
                                <p className="text-xs text-gray-500">Cerrado: {new Date(f.completion_date).toLocaleString()}</p>
                              )}
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${f.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {f.completed ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                          {f.description && (
                            <p className="mt-1 text-xs text-gray-600">{f.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {error && (
                  <div className="mt-4 text-sm text-red-600">{error}</div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
