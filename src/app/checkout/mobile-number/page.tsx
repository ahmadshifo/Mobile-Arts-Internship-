"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckoutNote } from "@/components/checkout/CheckoutNote";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { countries, rememberPhone } from "@/lib/checkout/demo";

const schema = z.object({
  dial: z.enum(["+961", "+965", "+971"]),
  number: z.string().refine(
    (value) => /^\d{7,9}$/.test(value.replace(/[ ()-]/g, "")),
    "Enter a valid mobile number (7–9 digits).",
  ),
  consent: z.boolean().refine(Boolean, "Please accept the terms to continue."),
});

type MobileValues = z.infer<typeof schema>;

export default function MobileNumberPage() {
  const router = useRouter();

  const form = useForm<MobileValues>({
    resolver: zodResolver(schema),
    defaultValues: { dial: "+961", number: "", consent: false },
  });

  const dial = useWatch({ control: form.control, name: "dial" });
  const country = countries.find((item) => item.dial === dial) ?? countries[0];

  function sendCode(values: MobileValues) {
    rememberPhone(values.dial, values.number.replace(/\D/g, ""));
    router.push("/checkout/verify-code");
  }

  return (
    <>
      <CheckoutSteps step={1} />

      <div>
        <h2>Subscribe with your mobile number</h2>
        <p className="co-description">
          We’ll send a one-time code by SMS to confirm it’s you.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(sendCode)}
          className="co-form"
          noValidate
        >
          <div>
            <label className="co-label" htmlFor="checkout-phone">
              Mobile number
            </label>

            <div className="co-phone-fields">
              <FormField
                control={form.control}
                name="dial"
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          className="co-input"
                          aria-label="Country calling code"
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((item) => (
                          <SelectItem key={item.dial} value={item.dial}>
                            {item.name} {item.dial}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                className="co-input"
                placeholder="71 123 456"
                {...form.register("number")}
                aria-invalid={!!form.formState.errors.number}
                aria-describedby="checkout-phone-help"
              />
            </div>

            <div id="checkout-phone-help" className="co-help">
              Your operator: <strong>{country.operator}</strong>
              {form.formState.errors.number && (
                <p role="alert" className="co-error">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem>
                <div className="co-agree">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value === true)}
                      ref={field.ref}
                    />
                  </FormControl>
                  <div>
                    <FormLabel>
                      I agree to be charged <strong>$0.99 per week</strong> after
                      the 1-day free trial until I cancel, and to the
                      <span className="sr-only"> terms</span>
                    </FormLabel>{" "}
                    <CheckoutNote kind="Terms" lowercase />.
                  </div>
                </div>
                <FormMessage className="co-error" />
              </FormItem>
            )}
          />

          <Button type="submit" className="co-primary">
            Send code
          </Button>
        </form>
      </Form>

      <p className="co-fine">
        No credit card needed. Standard SMS rates may apply.
      </p>
    </>
  );
}