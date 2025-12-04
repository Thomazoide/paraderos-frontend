import { BusStop, Route } from "@/types/entities";
import { useState, useEffect } from "react";

interface RouteDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    route: Route | null;
    busStops: BusStop[];
    onUpdate: (id: number, selectedIds: number[], routeName: string) => Promise<void>;
    isLoadingBusStops?: boolean;
}

export default function RouteDetailsModal({ isOpen, onClose, route, busStops, onUpdate, isLoadingBusStops = false }: RouteDetailsModalProps) {
    const [selectedBusStops, setSelectedBusStops] = useState<number[]>([]);
    const [routeName, setRouteName] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize state when modal opens or route changes
    useEffect(() => {
        if (isOpen && route) {
            setSelectedBusStops(route.route_points || []);
            setRouteName(route.route_name || "");
        } else if (!isOpen) {
            // Reset when closed
            setSelectedBusStops([]);
            setRouteName("");
        }
    }, [isOpen, route]);

    if (!isOpen || !route) return null;

    const toggleBusStopSelection = (id: number) => {
        setSelectedBusStops(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (selectedBusStops.length === 0 || !routeName.trim()) return;
        setLoading(true);
        try {
            await onUpdate(route.id, selectedBusStops, routeName);
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
                                    Detalles de la Ruta #{route.id}
                                </h3>
                                <div className="mt-4">
                                    <label htmlFor="edit-route-name" className="block text-sm font-medium text-gray-700">
                                        Nombre de la Ruta
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            name="edit-route-name"
                                            id="edit-route-name"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                            placeholder="Ej: Ruta Centro - Norte"
                                            value={routeName}
                                            onChange={(e) => setRouteName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">
                                        Editar paraderos de la ruta.
                                    </p>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                        {isLoadingBusStops ? (
                                            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                                <span>Cargando paraderos...</span>
                                            </div>
                                        ) : busStops.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">No hay paraderos disponibles.</div>
                                        ) : (
                                            <ul className="divide-y divide-gray-200">
                                                {busStops.map((stop) => (
                                                    <li key={stop.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggleBusStopSelection(stop.id)}>
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            checked={selectedBusStops.includes(stop.id)}
                                                            onChange={() => {}} 
                                                        />
                                                        <div className="ml-3 text-sm">
                                                            <span className="font-medium text-gray-900">{stop.codigo}</span>
                                                            <span className="text-gray-500 ml-2">- {stop.description}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 text-right">
                                        {selectedBusStops.length} paraderos seleccionados
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${loading || selectedBusStops.length === 0 || !routeName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleSave}
                            disabled={loading || selectedBusStops.length === 0 || !routeName.trim()}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
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