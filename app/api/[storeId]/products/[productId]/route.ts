import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { productId: string } }) {
  try {
    if (!params.productId) return new NextResponse("Missing storeId", { status: 400 });

    const product = await db.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, price, categoryId, images, isFeatured, isArchived } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!name) return new NextResponse("Missing product name", { status: 400 });
    if (!price) return new NextResponse("Missing product price", { status: 400 });
    if (!categoryId) return new NextResponse("Missing product category", { status: 400 });
    if (!images || !images.length) return new NextResponse("Missing Image products", { status: 400 });
    if (!params.productId) return new NextResponse("Missing storeId", { status: 400 });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    // first step update all except images, images will delete all
    // and created in second step
    await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        images: {
          deleteMany: {},
        },
      },
    });

    const updateProduct = await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });
    return NextResponse.json(updateProduct);
  } catch (error) {
    console.log("[PRODUCT_PATCH_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
    if (!params.productId) return new NextResponse("Missing productId", { status: 400 });

    const storeByUserId = await db.store.findFirst({ where: { id: params.storeId, userId } });
    if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

    const deleteProduct = await db.product.deleteMany({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(deleteProduct);
  } catch (error) {
    console.log("[PRODUCT_DELETE_ERROR] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
