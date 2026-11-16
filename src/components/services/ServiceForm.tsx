"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ServicePreviewCard } from "@/components/services/ServicePreviewCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  BILLING_CYCLES,
  SERVICE_CATEGORIES,
  SERVICE_OPERATORS,
  TRIAL_DAYS,
} from "@/lib/constants/service";
import { serviceDefaultValues } from "@/lib/forms/service";
import {
  serviceSchema,
  type ServiceFormInput,
  type ServiceFormValues,
} from "@/lib/validation/service";

type ServiceFormProps = {
  mode?: "create" | "edit";
  initialValues?: ServiceFormValues;
  submitLabel?: string;
  onSubmit: (values: ServiceFormValues) => void | Promise<void>;
};

const detailFields = [
  {
    name: "name",
    label: "Service name",
    placeholder: "CloudPlay Games",
  },
  {
    name: "provider",
    label: "Content provider",
    placeholder: "PixelForge Studio",
  },
] as const;

export function ServiceForm({
  mode = "create",
  initialValues,
  submitLabel,
  onSubmit,
}: ServiceFormProps) {
  const router = useRouter();

  const form = useForm<
    ServiceFormInput,
    unknown,
    ServiceFormValues
  >({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialValues ?? serviceDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const values = form.watch();

  const { errors, isDirty, isSubmitting, submitCount } =
    form.formState;

  const hasErrors = Object.keys(errors).length > 0;

  async function handleValidSubmit(data: ServiceFormValues) {
    try {
      await onSubmit(data);

      if (mode === "edit") {
        form.reset(data);
      }
    } catch (error) {
      form.setError("root.server", {
        message:
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "Unable to save the service. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(handleValidSubmit)}
        className="space-y-5"
        aria-busy={isSubmitting}
      >
        {submitCount > 0 && hasErrors && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">
              Please review the form.
            </p>

            <p className="mt-1">
              {errors.root?.server?.message ??
                "Correct the highlighted fields and submit again."}
            </p>
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <fieldset
              disabled={isSubmitting}
              className="min-w-0 space-y-5"
            >
              <legend className="sr-only">Service settings</legend>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">
                    Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {detailFields.map((item) => (
                      <FormField
                        key={item.name}
                        control={form.control}
                        name={item.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{item.label}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={item.placeholder}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger
                              ref={field.ref}
                              onBlur={field.onBlur}
                              className="w-full"
                            >
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {SERVICE_CATEGORIES.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>

                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Briefly describe this service."
                            rows={3}
                          />
                        </FormControl>

                        <FormDescription>
                          Optional · {field.value?.length ?? 0}/120
                          {" "}characters
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">
                    Operator &amp; pricing
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <FormField
                    control={form.control}
                    name="operator"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operator</FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger
                              ref={field.ref}
                              onBlur={field.onBlur}
                              className="w-full"
                            >
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {SERVICE_OPERATORS.map((operator) => (
                              <SelectItem
                                key={operator}
                                value={operator}
                              >
                                {operator}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USD)</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="any"
                              placeholder="0.00"
                              value={field.value === 0 ? "" : field.value}
                              onChange={(event) => {
                                const number = event.target.valueAsNumber;

                                field.onChange(
                                  Number.isNaN(number) ? 0 : number,
                                );
                              }}
                            />
                          </FormControl>

                          <FormDescription>
                            Greater than $0, up to $50.
                          </FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing cycle</FormLabel>

                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger
                                ref={field.ref}
                                onBlur={field.onBlur}
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              {BILLING_CYCLES.map((cycle) => (
                                <SelectItem key={cycle} value={cycle}>
                                  {cycle}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="trialDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free trial</FormLabel>

                        <FormControl>
                          <RadioGroup
                            ref={field.ref}
                            value={String(field.value)}
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            onBlur={field.onBlur}
                            disabled={isSubmitting}
                            className="flex flex-wrap gap-4"
                          >
                            {TRIAL_DAYS.map((days) => (
                              <div
                                key={days}
                                className="flex items-center gap-2"
                              >
                                <RadioGroupItem
                                  id={`trial-${days}`}
                                  value={String(days)}
                                />

                                <Label htmlFor={`trial-${days}`}>
                                  {days === 0
                                    ? "None"
                                    : `${days} ${days === 1 ? "day" : "days"}`}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">
                    Carrier billing settings
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="keyword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keyword</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              placeholder="PLAY"
                              spellCheck={false}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value.toUpperCase(),
                                )
                              }
                            />
                          </FormControl>

                          <FormDescription>
                            Use 2–10 capital letters.
                          </FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shortcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shortcode</FormLabel>

                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              inputMode="numeric"
                              placeholder="1234"
                            />
                          </FormControl>

                          <FormDescription>
                            Use 3–6 digits.
                          </FormDescription>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notificationUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification URL</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://example.com/notify"
                            spellCheck={false}
                          />
                        </FormControl>

                        <FormDescription>
                          The endpoint that receives billing notifications.
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendWelcomeSms"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 rounded-lg border p-4">
                        <FormControl>
                          <Checkbox
                            ref={field.ref}
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                            onBlur={field.onBlur}
                            disabled={isSubmitting}
                          />
                        </FormControl>

                        <div className="space-y-1">
                          <FormLabel>Send welcome SMS</FormLabel>

                          <FormDescription>
                            Send a welcome message after subscription.
                          </FormDescription>

                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-lg">
                    Status
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <FormLabel>Active service</FormLabel>

                          <FormDescription>
                            Current status: {field.value}
                          </FormDescription>

                          <FormMessage />
                        </div>

                        <FormControl>
                          <Switch
                            ref={field.ref}
                            checked={field.value === "Active"}
                            onCheckedChange={(checked) =>
                              field.onChange(
                                checked ? "Active" : "Paused",
                              )
                            }
                            onBlur={field.onBlur}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </fieldset>

            {mode === "edit" && isDirty && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  You have unsaved changes.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => form.reset()}
                >
                  Discard changes
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => router.push("/services")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isSubmitting || (mode === "edit" && !isDirty)
                }
              >
                {isSubmitting
                  ? "Submitting..."
                  : submitLabel ??
                    (mode === "edit" ? "Save changes" : "Save service")}
              </Button>
            </div>
          </div>

          <ServicePreviewCard values={values} />
        </div>
      </form>
    </Form>
  );
}