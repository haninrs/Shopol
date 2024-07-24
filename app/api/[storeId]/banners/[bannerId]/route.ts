import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { bannerId: string } }) {
    try {
      if (!params.bannerId) return new NextResponse("Missing storeId", { status: 400 });
  
      const banner = await db.banner.findUnique({
        where: {
          id: params.bannerId,
        },
      });
  
      return NextResponse.json(banner);
    } catch (error) {
      console.log("[BANNER_GET_ERROR] : ", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
  

export async function PATCH(req: Request, { params }: { params: { storeId: string; bannerId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { label, imgUrl } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!label) return new NextResponse("Missing name", { status: 400 });
    if (!imgUrl) return new NextResponse("Missing Image", { status: 400 });
    if (!params.bannerId) return new NextResponse("Missing storeId", { status: 400 });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const updateBanner = await db.banner.updateMany({
      where: {
        id: params.bannerId,
      },
      data: {
        label,
        imgUrl,
      },
    });
    return NextResponse.json(updateBanner);
  } catch (error) {
    console.log("[BANNER_PATCH_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string  , bannerId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!params.bannerId) return new NextResponse("Missing storeId", { status: 400 });

    const storeByUserId = await db.store.findFirst({ where: { id: params.storeId, userId}});
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const deleteBanner = await db.banner.deleteMany({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(deleteBanner);
  } catch (error) {
    console.log("[BANNER_DELETE_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
