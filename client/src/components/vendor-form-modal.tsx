import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import type { InsertVendor, Vendor } from "@/lib/types";
import { insertVendorSchema } from "@shared/schema";
import { useState, useEffect } from "react";

interface VendorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertVendor) => void;
  initialData?: Vendor;
  isSubmitting?: boolean;
}

export function VendorFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
}: VendorFormModalProps) {
  const [capabilities, setCapabilities] = useState<string[]>(
    initialData?.capabilities || []
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newCapability, setNewCapability] = useState("");
  const [newTag, setNewTag] = useState("");

  const form = useForm<InsertVendor>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      contactPerson: initialData?.contactPerson || "",
      rating: initialData?.rating || 3,
      capabilities: initialData?.capabilities || [],
      tags: initialData?.tags || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        contactPerson: initialData.contactPerson,
        rating: initialData.rating,
        capabilities: initialData.capabilities,
        tags: initialData.tags,
      });
      setCapabilities(initialData.capabilities);
      setTags(initialData.tags);
    } else {
      form.reset({
        name: "",
        email: "",
        contactPerson: "",
        rating: 3,
        capabilities: [],
        tags: [],
      });
      setCapabilities([]);
      setTags([]);
    }
  }, [initialData, form, open]);

  const addCapability = () => {
    if (newCapability.trim() && !capabilities.includes(newCapability.trim())) {
      const updated = [...capabilities, newCapability.trim()];
      setCapabilities(updated);
      form.setValue("capabilities", updated);
      setNewCapability("");
    }
  };

  const removeCapability = (cap: string) => {
    const updated = capabilities.filter((c) => c !== cap);
    setCapabilities(updated);
    form.setValue("capabilities", updated);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updated = [...tags, newTag.trim()];
      setTags(updated);
      form.setValue("tags", updated);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    form.setValue("tags", updated);
  };

  const handleSubmit = (data: InsertVendor) => {
    onSubmit({
      ...data,
      capabilities,
      tags,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Vendor" : "Add New Vendor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Acme Corporation"
                      data-testid="input-vendor-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="sales@acme.com"
                      data-testid="input-vendor-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Smith"
                      data-testid="input-vendor-contact"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-vendor-rating">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Capabilities</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="e.g., IT Hardware"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCapability();
                    }
                  }}
                  data-testid="input-vendor-capability"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addCapability}
                  data-testid="button-add-capability"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {capabilities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {capabilities.map((cap) => (
                    <Badge key={cap} variant="secondary" className="gap-1 pr-1">
                      {cap}
                      <button
                        type="button"
                        onClick={() => removeCapability(cap)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., Preferred"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  data-testid="input-vendor-tag"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addTag}
                  data-testid="button-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-vendor"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit-vendor"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : initialData ? (
                  "Update Vendor"
                ) : (
                  "Add Vendor"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
