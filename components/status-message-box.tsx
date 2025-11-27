import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function StatusMessageBox(props: Readonly<{
    message: string;
    type: ("success" | "error" | "warning");
    closeAction?: Dispatch<SetStateAction<boolean>>;
    closeError?: Dispatch<SetStateAction<Error | null>>;
    value?: boolean | Error | null;
}>) {
    const color = props.type === "success" ? "bg-green-500" : props.type === "warning" ? "bg-yellow-500" : "bg-red-500";
    const style = `${color} p-7 rounded shadow-md h-fit w-full text-center my-5 font-bold border-solid border-1 border-white text-white`;
    const closeBox = () => {
        if(typeof props.value === "boolean" && props.closeAction) {
            props.closeAction(false)
        } else if(props.closeError){
            props.closeError(null);
        }
    };
    return (
        <div className={style} >
            <div className="flex flex-row w-full h-fit justify-end">
                <button className="hover:cursor-pointer" onClick={closeBox} >
                    <X/>
                </button>
            </div>
            <p>
                {
                    props.message
                }
            </p>
        </div>
    )
};