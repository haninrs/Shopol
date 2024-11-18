"use client";

import { Banner, Category } from "@prisma/client";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AlertModal } from "@/components/modal/alert-modal";
import { ApiAlert } from "@/components/ApiAlert";
import { useOrigin } from "@/hooks/use-origin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormProps {
  initialData: Category | null;
  banners : Banner[]
}

const formSchema = z.object({
  name: z.string().min(3).max(32),
  bannerId: z.string().min(1),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export const CategoryForm: React.FC<CategoryFormProps> = ({ initialData , banners}) => {
  const router = useRouter();
  const params = useParams();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Category" : "Add Category";
  const description = initialData ? "Edit Category Store" : "Create Category Store";
  const toastMassage = initialData ? "Category updated successfully" : "Category created successfully";
  const action = initialData ? "Save Changes" : "Create Category";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      bannerId: "",
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
      } else {
        await axios.post(`/api/${params.storeId!}/categories`, data);
      }
      router.push(`/${params.storeId}/categories`);
      toast.success(toastMassage);
      router.refresh();
    } catch (error) {
      toast.error("Incorrect data input. Check again the data input");
    } finally {
      setLoading(false);
      
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
      router.refresh();
      router.push(`/${params.storeId}/categories`);
      toast.success("Category deleted successfully");
      router.refresh();
    } catch (error) {
      console.log("error", error);
      toast.error("Error deleting store");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal loading={loading} isOpen={open} onConfirm={onDelete} onClose={() => setOpen(false)} />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button variant={"destructive"} size={"sm"} disabled={loading} onClick={() => setOpen(true)}>
            <Trash className=" h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                    placeholder="Category Name" 
                    disabled={loading} 
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner</FormLabel>
                  <FormControl>
                    <Select 
                      disabled={loading} 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                            defaultValue={field.value}
                            placeholder="Select Banner"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {banners?.map((banner) => (
                            <SelectItem key={banner.id} value={banner.id}>
                              {banner.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          </div>
          <Button disabled={loading} type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert variant="public" title="PUBLIC_API_URL" description={`${origin}/api/${params.storeId}`} />
    </>
  );
};
