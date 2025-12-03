import { Route } from "@/types/entities";
import { useState, useEffect } from "react";

interface CreateWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    routes: Route[];
    onCreate: (routeId: number) => Promise<void>;
}

export default function CreateWorkOrderModal({ isOpen, onClose, routes, onCreate }: CreateWorkOrderModalProps) {
    const [selectedRouteId, setSelectedRouteId] = useState<number | "">("");
    const [loading, setLoading] = useState(false);

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedRouteId("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (selectedRouteId === "") return;
        setLoading(true);
        try {
            await onCreate(Number(selectedRouteId));
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Crear Orden de Trabajo
                                </h3>
                                <div className="mt-4">
                                    <label htmlFor="route-select" className="block text-sm font-medium text-gray-700">
                                        Seleccionar Ruta
                                    </label>
                                    <div className="mt-1">
                                        {routes.length === 0 ? (
                                            <p className="text-sm text-gray-500">No hay rutas disponibles.</p>
                                        ) : (
                                            <select
                                                id="route-select"
                                                name="route-select"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                                value={selectedRouteId}
                                                onChange={(e) => setSelectedRouteId(Number(e.target.value))}
                                            >
                                                <option value="" disabled>Selecciona una ruta</option>
                                                {routes.map((route) => (
                                                    <option key={route.id} value={route.id}>
                                                        {route.route_name ? route.route_name : `Ruta #${route.id}`} ({route.route_points.length} paraderos)
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Selecciona la ruta que se asignará a esta orden de trabajo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${loading || selectedRouteId === "" ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={loading || selectedRouteId === ""}
                        >
                            {loading ? 'Creando...' : 'Crear Orden'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}