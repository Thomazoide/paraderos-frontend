import { User, UserType } from "@/types/entities";
import { useState, useEffect } from "react";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userToEdit?: User | null;
    onSave: (userData: Partial<User>) => Promise<void>;
}

export default function UserModal({ isOpen, onClose, userToEdit, onSave }: UserModalProps) {
    const [formData, setFormData] = useState<Partial<User>>({
        full_name: "",
        email: "",
        username: "",
        password: "",
        user_type: "terreno"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setFormData({
                    full_name: userToEdit.full_name,
                    email: userToEdit.email,
                    username: userToEdit.username,
                    user_type: userToEdit.user_type,
                    password: "" // Don't populate password on edit
                });
            } else {
                setFormData({
                    full_name: "",
                    email: "",
                    username: "",
                    password: "",
                    user_type: "terreno"
                });
            }
        }
    }, [isOpen, userToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // If editing and password is empty, don't send it (or handle in backend)
            // For now we send what we have.
            const dataToSend = { ...formData };
            if (userToEdit && !dataToSend.password) {
                delete dataToSend.password;
            }

            // If creating, remove username so backend generates it
            if (!userToEdit) {
                delete dataToSend.username;
            }

            await onSave(dataToSend);
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
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {userToEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
                                    </h3>
                                    <div className="mt-4 grid grid-cols-1 gap-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        {userToEdit && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
                                            <input
                                                type="text"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            />
                                        </div>
                                        )}
                                        {!userToEdit && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo de Usuario</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                value={formData.user_type}
                                                onChange={(e) => setFormData({...formData, user_type: e.target.value as UserType})}
                                            >
                                                <option value="terreno">Terreno</option>
                                                <option value="jefatura">Jefatura</option>
                                                <option value="oferente">Oferente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
