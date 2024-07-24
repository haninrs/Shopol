import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imgUrl } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!label) return new NextResponse("Missing label banners", { status: 400 });
    if (!imgUrl) return new NextResponse("Missing Image banners", { status: 400 });
    if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const banner = await db.banner.create({
      data: {
        label,
        imgUrl,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("banner post error : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 });

    const banner = await db.banner.findMany({ where: { storeId: params.storeId } });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("banner get error : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
