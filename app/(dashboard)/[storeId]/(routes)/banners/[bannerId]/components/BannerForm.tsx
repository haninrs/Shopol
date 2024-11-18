"use client";

import { Banner } from "@prisma/client";
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
import ImgUpload from "@/components/ImgUpload";
import { url } from "inspector";

interface BannerFormProps {
  initialData: Banner | null;
}

const formSchema = z.object({
  label: z.string().min(3).max(32),
  imgUrl: z.string().min(1),
});

type BannerFormValues = z.infer<typeof formSchema>;

export const BannerForm: React.FC<BannerFormProps> = ({ initialData }) => {
  const router = useRouter();
  const params = useParams();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Banner" : "Add Banner";
  const description = initialData ? "Edit Banner Store" : "Create Banner Store";
  const toastMassage = initialData ? "Banner updated successfully" : "Banner created successfully";
  const action = initialData ? "Save Changes" : "Create Banner";

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: "",
      imgUrl: "",
    },
  });

  const onSubmit = async (data: BannerFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/${params.storeId!}/banners/${params.bannerId}`, data);
      } else {
        await axios.post(`/api/${params.storeId!}/banners`, data);
      }
      router.push(`/${params.storeId}/banners`);
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
      await axios.delete(`/api/${params.storeId}/banners/${params.bannerId}`);
      router.refresh();
      router.push(`/${params.storeId}/banners`);
      toast.success("Banner deleted successfully");
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
        <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input
                     placeholder="Label Banner" 
                     disabled={loading} 
                     {...field} 
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imgUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImgUpload disabled={loading} onChange={(url) => field.onChange(url)} onRemove={() => field.onChange("")} value={field.value ? [field.value] : []} />
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
