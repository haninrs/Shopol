"use client"

import { useOrigin } from "@/hooks/use-origin"
import { useParams, useRouter } from "next/navigation"
import { ApiAlert } from "./ApiAlert"

interface ApiListProps {
    nameIndicator: string
    idIndikator : string
}
export const ApiList: React.FC<ApiListProps> = ({nameIndicator, idIndikator}) => {

    const router = useRouter()
    const params = useParams()
    const origin = useOrigin()

    const baseUrl = `${origin}/api/${params.storeId}`

    return (
        <>
        <ApiAlert 
        title="GET" 
        description={`${baseUrl}/${nameIndicator}`} 
        variant="public"/>

        <ApiAlert 
        title="GET" 
        description={`${baseUrl}/${nameIndicator}/${idIndikator}`} 
        variant="public"/>

        <ApiAlert 
        title="POST" 
        description={`${baseUrl}/${nameIndicator}`} 
        variant="admin"/>

        <ApiAlert 
        title="PATCH" 
        description={`${baseUrl}/${nameIndicator}`} 
        variant="admin"/>

        <ApiAlert 
        title="DELETE" 
        description={`${baseUrl}/${nameIndicator}`} 
        variant="admin"/>

        </>
    )
}