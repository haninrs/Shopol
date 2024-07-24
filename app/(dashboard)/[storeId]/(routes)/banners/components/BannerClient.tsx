"use client";

import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { BannerColumn, columns } from "./Column";
import { DataTable } from "@/components/Data-Table";
import { ApiList } from "@/components/Api-List";

interface BannerClientProps {
  data: BannerColumn[];
}

export const BannerClient: React.FC<BannerClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between ">
        <Heading title={`Banners (${data.length})`} description="Manage your banners" />
        <Button onClick={() => router.push(`/${params.storeId}/banners/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="label" data={data} columns={columns} />
      <Heading title="API" description="API Banners"/>
      <Separator />
      <ApiList nameIndicator="banners" idIndikator="bannerId"/>
    </>
  );
};
