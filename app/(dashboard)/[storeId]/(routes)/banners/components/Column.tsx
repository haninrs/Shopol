"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./Cell-Action";

export type BannerColumn = {
  id: string;
  label: string;
  createdAt: string;
};

export const columns: ColumnDef<BannerColumn>[] = [
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id : "actions",
    cell: ({row}) => <CellAction data={row.original}/>
  }
];
