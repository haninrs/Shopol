import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req:Request,
    {params} : {params: {storeId: string}}
) {
    try {
        const { userId } = auth()
        const body = await req.json()
        const { name } = body

        if (!userId) return new NextResponse("Unauthenticated", { status: 401 })
        if (!name) return new NextResponse("Missing name", { status: 400 })
        if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 })
        
        const updateStore = await db.store.update({
            where : {
                id : params.storeId,
                userId
            },
            data : {
                name
            }
        })

        return NextResponse.json(updateStore)
    } catch (error) {
        console.log("[STORE_PATCH_ERROR] : ", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


export async function DELETE(
    req: Request,
    {params} : {params: {storeId: string}}
) {
    try {
        const { userId } = auth()
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 })
        if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 })
        
        const deleteStore = await db.store.deleteMany({
            where : {
                id : params.storeId,
                userId
            }
        })

        return NextResponse.json(deleteStore)
    } catch (error) {
        console.log("[STORE_DELETE_ERROR] : ", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}