import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { categoryId: string } }) {
    try {
      if (!params.categoryId) return new NextResponse("Missing categoryId", { status: 400 });
  
      const category = await db.category.findUnique({
        where: {
          id: params.categoryId,
        },
        include: {
          banner: true,
        }
      });

  
      // console.log("category data:" , category);
      
      return NextResponse.json(category);
    } catch (error) {
      console.log("[CATEGORY_GET_ERROR] : ", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  

export async function PATCH(req: Request, { params }: { params: { storeId: string; categoryId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, bannerId } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Missing name", { status: 400 });
    if (!bannerId) return new NextResponse("Missing banner Id", { status: 400 });
    if (!params.categoryId) return new NextResponse("Missing categotyId", { status: 400 });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const updateCategory = await db.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        bannerId,
      },
    });
    return NextResponse.json(updateCategory);
  } catch (error) {
    console.log("[CATEGORY_PATCH_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string  , categoryId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!params.categoryId) return new NextResponse("Missing categoryId", { status: 400 });

    const storeByUserId = await db.store.findFirst({ where: { id: params.storeId, userId}});
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const deleteCategory = await db.category.deleteMany({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(deleteCategory);
  } catch (error) {
    console.log("[CATEGORY_DELETE_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
