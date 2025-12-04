import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Trash2, Save, Loader2 } from "lucide-react";
import type { InsertRfp, RfpItem } from "@/lib/types";
import { insertRfpSchema } from "@shared/schema";
import { useState } from "react";

interface RfpFormViewProps {
  initialData?: Partial<InsertRfp>;
  onSave: (data: InsertRfp) => void;
  isSaving?: boolean;
}

export function RfpFormView({ initialData, onSave, isSaving }: RfpFormViewProps) {
  const [items, setItems] = useState<RfpItem[]>(initialData?.items || []);
  const [mandatoryCriteria, setMandatoryCriteria] = useState<string[]>(
    initialData?.mandatoryCriteria || []
  );
  const [optionalCriteria, setOptionalCriteria] = useState<string[]>(
    initialData?.optionalCriteria || []
  );
  const [newCriterion, setNewCriterion] = useState("");

  const form = useForm<InsertRfp>({
    resolver: zodResolver(insertRfpSchema),
    defaultValues: {
      title: initialData?.title || "",
      items: initialData?.items || [],
      totalBudget: initialData?.totalBudget || null,
      currency: initialData?.currency || "USD",
      deliveryDays: initialData?.deliveryDays || null,
      paymentTerms: initialData?.paymentTerms || null,
      warranty: initialData?.warranty || null,
      notes: initialData?.notes || null,
      mandatoryCriteria: initialData?.mandatoryCriteria || [],
      optionalCriteria: initialData?.optionalCriteria || [],
    },
  });

  const addItem = () => {
    const newItems = [...items, { name: "", qty: 1, specs: "" }];
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const updateItem = (index: number, field: keyof RfpItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue("items", newItems);
  };

  const addCriterion = (type: "mandatory" | "optional") => {
    if (!newCriterion.trim()) return;
    if (type === "mandatory") {
      const newList = [...mandatoryCriteria, newCriterion.trim()];
      setMandatoryCriteria(newList);
      form.setValue("mandatoryCriteria", newList);
    } else {
      const newList = [...optionalCriteria, newCriterion.trim()];
      setOptionalCriteria(newList);
      form.setValue("optionalCriteria", newList);
    }
    setNewCriterion("");
  };

  const removeCriterion = (type: "mandatory" | "optional", index: number) => {
    if (type === "mandatory") {
      const newList = mandatoryCriteria.filter((_, i) => i !== index);
      setMandatoryCriteria(newList);
      form.setValue("mandatoryCriteria", newList);
    } else {
      const newList = optionalCriteria.filter((_, i) => i !== index);
      setOptionalCriteria(newList);
      form.setValue("optionalCriteria", newList);
    }
  };

  const handleSubmit = (data: InsertRfp) => {
    onSave({
      ...data,
      items,
      mandatoryCriteria,
      optionalCriteria,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-medium">AI-Generated RFP</p>
          <p className="text-xs text-muted-foreground">
            Review and edit the extracted information below
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFP Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter RFP title"
                    data-testid="input-rfp-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Line Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-1.5"
                  data-testid="button-add-item"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items added yet. Click "Add Item" to start.
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-start p-3 rounded-lg bg-muted/50"
                  >
                    <div className="col-span-5">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="Item name"
                        data-testid={`input-item-name-${index}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 0)}
                        placeholder="Qty"
                        min={1}
                        data-testid={`input-item-qty-${index}`}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={item.specs}
                        onChange={(e) => updateItem(index, "specs", e.target.value)}
                        placeholder="Specifications"
                        data-testid={`input-item-specs-${index}`}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="totalBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 50000"
                      data-testid="input-total-budget"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="USD"
                      data-testid="input-currency"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="e.g., 30"
                      data-testid="input-delivery-days"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g., Net 30"
                      data-testid="input-payment-terms"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warranty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g., 2 years"
                      data-testid="input-warranty"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Any additional requirements or notes..."
                    className="min-h-[100px]"
                    data-testid="input-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Mandatory Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    placeholder="Add criterion"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCriterion("mandatory");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addCriterion("mandatory")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mandatoryCriteria.map((criterion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {criterion}
                      <button
                        type="button"
                        onClick={() => removeCriterion("mandatory", index)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Optional Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    placeholder="Add criterion"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCriterion("optional");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addCriterion("optional")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {optionalCriteria.map((criterion, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="gap-1 pr-1"
                    >
                      {criterion}
                      <button
                        type="button"
                        onClick={() => removeCriterion("optional", index)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2"
              data-testid="button-save-rfp"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save RFP
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
