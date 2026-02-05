import { ENDPOINTS } from "@/constants/endpoints";
import { GetRequestConfig, METHODS } from "@/constants/request-config";
import { VisitForm } from "@/types/entities";
import { ResponsePayload, VisitFormPicsResponse } from "@/types/response-payload";
import { formatDate, GetBackendEndpoint } from "@/utils/utilities";
import { Image, Spinner, Button } from "@heroui/react";
import { useEffect, useState } from "react";

interface VisitFormDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    visitFormData: VisitForm;
    accessToken: string;
}

export default function VisitFormDetailsModal(props: Readonly<VisitFormDetailsModalProps>) {
    const [picBeforeB64, setPicBeforeB64] = useState<string>();
    const [picAfterB64, setPicAfterB64] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const fetchVisitFormPictures = async () => {
        try{
            setLoading(true);
            const endpoint = `${await GetBackendEndpoint()}${ENDPOINTS.visitFormPictures(props.visitFormData.id)}`;
            const requestConfig = GetRequestConfig(METHODS.GET, "JSON", undefined, props.accessToken);
            const response = await (await fetch(endpoint, requestConfig)).json() as ResponsePayload<VisitFormPicsResponse>;
            if(response.error) throw new Error(response.message || "Error desconocido");
            if(!response.data) throw new Error(response.message || "Error desconocido");
            console.log(response.data);
            setPicBeforeB64(`data:image/jpeg;base64,${response.data.picBefore}`);
            setPicAfterB64(`data:image/jpeg;base64,${response.data.picAfter}`);
        } catch(e) {
            alert(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitFormPictures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if(loading){
        return(
            <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={props.onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <Spinner size="lg" color="primary"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={props.onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Formulario de visita #{props.visitFormData.id}
                                </h3>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-700">
                                        Fecha de creación: {formatDate(props.visitFormData.creation_date)}
                                        <br/>
                                        {
                                            props.visitFormData.completion_date &&
                                            `Fecha de cierre: ${formatDate(props.visitFormData.completion_date)}`
                                        }
                                    </p>
                                </div>
                                
                                <div className="flex flex-col items-start mt-4">
                                    <p>
                                        Foto de llegada:
                                    </p>
                                    {
                                        picBeforeB64 ?
                                        <Image 
                                            src={picBeforeB64}
                                            alt="Foto de llegada"
                                            className="w-full rounded-lg mt-2"
                                        />
                                        :
                                        <p className="text-sm text-gray-500 mt-2">No hay foto de llegada</p>
                                    }
                                </div>
                                <div className="flex flex-col items-start mt-4">
                                    <p>
                                        Foto de cierre:
                                    </p>
                                    {
                                        picAfterB64 ?
                                        <Image 
                                            src={picAfterB64}
                                            alt="Foto de cierre"
                                            className="w-full rounded-lg mt-2"
                                        />
                                        :
                                        <p className="text-gray-500 mt-2 text-sm">
                                            No hay foto de cierre
                                        </p>
                                    }
                                </div>
                                <div className="flex justify-center items-center pt-4" >
                                    <Button color="primary" variant="bordered" onPress={props.onClose}>Cerrar</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}