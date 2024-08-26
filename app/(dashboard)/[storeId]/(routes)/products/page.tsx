import db from "@/lib/db";
import { ProductClient } from "./components/ProductClient";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
import { ProductColumn } from "./components/Column";

const ProductsPage = async ({ params }: { params: { storeId: string } }) => {
  const products = await db.product.findMany({
    where: { storeId: params.storeId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedBanners:ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured : item.isFeatured,
    isArchived : item.isArchived,
    price : formatter.format(item.price.toNumber()),
    category : item.category.name,
    createdAt: format(item.createdAt, "MM do, yyyy")
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedBanners} />
      </div>
    </div>
  );
};

export default ProductsPage;
