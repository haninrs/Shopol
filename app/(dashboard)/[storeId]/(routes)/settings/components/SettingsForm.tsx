"use client";

import { Store } from "@prisma/client";
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

interface SettingsFormProps {
  initialData: Store;
}

const formSchema = z.object({
  name: z.string().min(3).max(32),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const router = useRouter();
  const params = useParams();
  const origin = useOrigin();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${params.storeId!}`, data);
      router.refresh();
      router.push(`/${params.storeId}`);
      toast.success("Store updated successfully");
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
      await axios.delete(`/api/stores/${params.storeId}`);
      router.refresh();
      router.push("/");
      toast.success("Store deleted successfully");
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
        <Heading title="Settings" description="Set up your store" />
        <Button variant={"destructive"} size={"sm"} disabled={loading} onClick={() => setOpen(true)}>
          <Trash className=" h-4 w-4" />
        </Button>
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
                    <Input placeholder="Store Name" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit">
            Save
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert variant="public" title="PUBLIC_API_URL" description={`${origin}/api/${params.storeId}`} />
    </>
  );
};
