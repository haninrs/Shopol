"use client";

import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {  CategoryColumn, columns } from "./Column";
import { DataTable } from "@/components/Data-Table";
import { ApiList } from "@/components/Api-List";

interface CategoryClientProps {
  data: CategoryColumn[];
}

export const CategoryClient: React.FC<CategoryClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between ">
        <Heading title={`Category (${data.length})`} description="Manage your categories" />
        <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="label" data={data} columns={columns} />
      <Heading title="API" description="API for Categories"/>
      <Separator />
      <ApiList nameIndicator="category" idIndikator="categoryId"/>
    </>
  );
};
