import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, price, categoryId, images, isFeatured, isArchived } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Missing product name", { status: 400 });
    if (!price) return new NextResponse("Missing product price", { status: 400 });
    if (!categoryId) return new NextResponse("Missing product category", { status: 400 });
    if (!images || !images.length) return new NextResponse("Missing Image products", { status: 400 });
    if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const product = await db.product.create({
      data: {
        name,
        price,
        categoryId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        isFeatured,
        isArchived,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_POST_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit") || 6;
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) return new NextResponse("Missing storeId", { status: 400 });

    const products = await db.product.findMany({
      take: +limit,
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });



    // const response = NextResponse.json({ count: products.length, limit, products });

    const response = NextResponse.json(products);
    response.headers.set('Access-Control-Allow-Origin', '*'); // Or specify a particular origin
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.log("[PRODUCTS_GET_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
