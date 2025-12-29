import { User } from "@/types/entities";
import { formatDate } from "@/utils/utilities";
import { Caravan, Radio, UserX } from "lucide-react";

export default function TerrainUserListComponent(props:{
    users: User[];
    onCenter: (coords: {
        lat: number;
        lng: number;
        zoom: number | undefined;
    }) => void
}) {
    const terrainUsers = props.users.filter( u  => u.user_type === "terreno" && u.lat && u.lng && u.lastUpdated);
    return (
        <div className="flex flex-col items-center p-6 rounded-lg shadow bg-white w-full h-fit" >
            <div className="flex flex-row justify-start border-b-2 border-b-gray-500 text-lg w-full" >
                { terrainUsers.length > 0 ? 
                <>
                <Caravan/>
                <p>
                    Usuarios en terreno activos
                </p>
                </>
                :
                <>
                <UserX/>
                <p>
                    No hay usuarios en terreno activos
                </p>
                </>
                }
            </div>
            { terrainUsers.length > 0 ? 
            <div className="w-full overflow-auto max-h-[250px] " >
                <table className="min-w-full table-fixed" >
                    <thead className="sticky top-0 bg-white" >
                        <tr className="text-sm text-gray-600" >
                            <th scope="col" className="px-4 py-2 text-left w-20" > ID </th>
                            <th scope="col" className="px-4 py-2 text-left" > Nombre </th>
                            <th scope="col" className="px-4 py-2 text-left"> Email </th>
                            <th scope="col" className="px-4 py-2 text-left"> Ult- Actualización </th>
                            <th scope="col" className="px-4 py-2 text-left"> Acciones </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            terrainUsers.map( (u, i) => (
                                <tr className={`border-t ${i === terrainUsers.length-1 ? "border-b" : ""}`} key={u.id}>
                                    <td className="px-4 py-2 font-semibold " >
                                        <strong>
                                            #{u.id}
                                        </strong>
                                    </td>
                                    <td className="px-4 py-2" >
                                        {u.full_name}
                                    </td>
                                    <td className="px-4 py-2">
                                        {u.email}
                                    </td>
                                    <td className="px-4 py-2">
                                        {formatDate(u.lastUpdated!)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button className="flex flex-row justify-center bg-transparent p-2 text-blue-600 w-fit rounded-lg border-[0.5px] border-blue-600 hover:bg-blue-600 hover:text-white transition-[1s] hover:cursor-pointer " onClick={() => 
                                            u.lat &&
                                            u.lng &&
                                            props.onCenter?.({
                                                lat: u.lat,
                                                lng: u.lng,
                                                zoom: 16
                                            })
                                        } >
                                            <span><Radio/></span><span> Centrar </span>
                                        </button>
                                    </td>
                                </tr>
                            ) )
                        }
                    </tbody>
                </table>
            </div>
            :
            <div className="flex flex-row items-center min-h-[150px] w-full justify-center text-center " >
                <p>
                    No hay usuarios compartiendo su ubicación en este momento...
                </p>
            </div>
            }
        </div>
    )
}