import db from "@/lib/db";
import React from "react";

interface DashboardPageProps {
  params: { storeId: string };
}
const DashboardPage = async ({ params }: DashboardPageProps) => {

  const store = await db.store.findFirst({ where: { id: params.storeId } })

  return (
    <div>
      Active store : {store?.name}
    </div>
  );
};

export default DashboardPage;
