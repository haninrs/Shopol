"use client";

import {  Category, Image, Product } from "@prisma/client";
import { Heading } from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AlertModal } from "@/components/modal/alert-modal";
import { ApiAlert } from "@/components/ApiAlert";
import { useOrigin } from "@/hooks/use-origin";
import ImgUpload from "@/components/ImgUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
interface ProductFormProps {
  initialData: Product & {images: Image[]} | null;
  categories: Category[]
}

const formSchema = z.object({
  name: z.string().min(3).max(32),
  images: z.object({url: z.string()}).array().min(1),
  price : z.coerce.number().min(1),
  categoryId : z.string().min(1),
  isFeatured : z.boolean().default(false).optional(),
  isArchived : z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm: React.FC<ProductFormProps> = ({ initialData , categories}) => {
  const router = useRouter();
  const params = useParams();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Product" : "Add Product";
  const description = initialData ? "Edit Product Store" : "Create Product Store";
  const toastMassage = initialData ? "Product updated successfully" : "Product created successfully";
  const action = initialData ? "Save Changes" : "Create Product";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData  ? { 
      ...initialData,
      price : parseFloat(String(initialData?.price))
    } : {
      name: "",
      images: [],
      price : 0,
      categoryId : "",
      isFeatured : false,
      isArchived : false,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId!}/products/${params.productId}`, data);
      } else {
        await axios.post(`/api/${params.storeId!}/products`, data);
      }
      router.push(`/${params.storeId}/products`);
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
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted successfully");
      router.refresh();
    } catch (error) {
      console.log("error", error);
      toast.error("Error deleting store. Check your connection and try again");
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
        <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <ImgUpload 
                    disabled={loading} 
                    onChange={(url) => field.onChange([...field.value, {url}])} 
                    onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])} 
                    value={field.value.map((image) => image.url )} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                    placeholder="Rp" 
                    type="number"
                    disabled={loading}
                    {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
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
                            placeholder="Select Category"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.length === 0 && <SelectItem value=" "  disabled>No category found</SelectItem>}
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Featured
                    </FormLabel>
                    <FormDescription>
                      This product will show in the home page
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Archived
                    </FormLabel>
                    <FormDescription>
                      This product will archived from store
                    </FormDescription>
                  </div>
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
