"use client";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Store } from "@prisma/client";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown, PlusCircle, Store as StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../ui/command";

type PopOverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface StoreSwitcherProps extends PopOverTriggerProps {
  stores: Store[];
}

const StoreSwithcer = ({ className, stores = [] }: StoreSwitcherProps) => {
  const storeModal = useStoreModal();
  
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const formatedStores = stores.map((item) => ({
    name: item.name,
    id: item.id,
  }));

  const currentStore = formatedStores.find((item) => item.id === params.storeId);

  const onStoreSelect = (store: { name: string; id: string }) => {
    setOpen(false);
    router.push(`/${store.id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"} size={"sm"} role="combobox" aria-expanded={open} aria-label="Choose Store" className={cn("w-[200px] justify-between", className)}>
          <StoreIcon className="mr-2 h-4 w-4" />
          {currentStore?.name}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search Store" />
            <CommandEmpty>Store not found</CommandEmpty>
            <CommandGroup heading="Store">
              {formatedStores.map((store) => (
                <CommandItem key={store.id} onSelect={() => onStoreSelect(store)} className="text-sm">
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.name}
                  <Check className={cn("ml-auto h-4 w-4", currentStore?.id === store.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
                <CommandItem
                onSelect={() => {
                    setOpen(false);
                    storeModal.onOpen()
                }}
                >
                    <PlusCircle className="mr-2 h-5 w-5"/>
                    Create Store
                </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StoreSwithcer;
