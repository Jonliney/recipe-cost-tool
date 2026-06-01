"use client";

import { useActionState, useState } from "react";

import { completeOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OnboardingFormProps = {
  defaults: {
    bakeryName: string;
    countryCode: string;
    locale: string;
    currencyCode: string;
    vatRegistered: "yes" | "no";
    defaultTaxRate: string;
    defaultMarkupPercentage: string;
    roundingMode: "none" | "increment" | "price_ending";
    roundingIncrement: string;
    roundingPriceEnding: string;
  };
};

const initialState = {
  error: null,
};

export function OnboardingForm({ defaults }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    completeOnboarding,
    initialState,
  );
  const [roundingMode, setRoundingMode] = useState(defaults.roundingMode);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Set up your bakery</h1>
          <p className="text-sm text-muted-foreground">
            This creates the business defaults the app needs before recipe
            costing can begin.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="bakeryName">Bakery name</FieldLabel>
          <Input
            id="bakeryName"
            name="bakeryName"
            defaultValue={defaults.bakeryName}
            placeholder="Joyo Cakes"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="currencyCode">Currency</FieldLabel>
          <Select defaultValue={defaults.currencyCode} name="currencyCode">
            <SelectTrigger id="currencyCode" className="w-full bg-background">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="countryCode">Country</FieldLabel>
          <Select defaultValue={defaults.countryCode} name="countryCode">
            <SelectTrigger id="countryCode" className="w-full bg-background">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="IE">Ireland</SelectItem>
                <SelectItem value="US">United States</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="locale">Locale</FieldLabel>
          <Input
            id="locale"
            name="locale"
            defaultValue={defaults.locale}
            placeholder="en-GB"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="vatRegistered">VAT registered</FieldLabel>
          <Select defaultValue={defaults.vatRegistered} name="vatRegistered">
            <SelectTrigger id="vatRegistered" className="w-full bg-background">
              <SelectValue placeholder="Select VAT status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultTaxRate">Default VAT / tax rate</FieldLabel>
          <Input
            id="defaultTaxRate"
            name="defaultTaxRate"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults.defaultTaxRate}
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="defaultMarkupPercentage">
            Default markup percentage
          </FieldLabel>
          <Input
            id="defaultMarkupPercentage"
            name="defaultMarkupPercentage"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaults.defaultMarkupPercentage}
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="roundingMode">Rounding rule</FieldLabel>
          <Select
            defaultValue={defaults.roundingMode}
            name="roundingMode"
            onValueChange={(value) =>
              setRoundingMode(value as typeof defaults.roundingMode)
            }
          >
            <SelectTrigger id="roundingMode" className="w-full bg-background">
              <SelectValue placeholder="Select a rounding mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="none">No rounding</SelectItem>
                <SelectItem value="increment">Round up to increment</SelectItem>
                <SelectItem value="price_ending">
                  Round up to price ending
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {roundingMode === "increment" ? (
          <Field>
            <FieldLabel htmlFor="roundingIncrement">
              Increment amount
            </FieldLabel>
            <Input
              id="roundingIncrement"
              name="roundingIncrement"
              defaultValue={defaults.roundingIncrement}
              placeholder="0.50"
              className="bg-background"
            />
            <FieldDescription>
              Example values: `0.50` or `1.00`.
            </FieldDescription>
          </Field>
        ) : null}

        {roundingMode === "price_ending" ? (
          <Field>
            <FieldLabel htmlFor="roundingPriceEnding">
              Price ending
            </FieldLabel>
            <Input
              id="roundingPriceEnding"
              name="roundingPriceEnding"
              defaultValue={defaults.roundingPriceEnding}
              placeholder="0.99"
              className="bg-background"
            />
            <FieldDescription>
              Example values: `0.49` or `0.99`.
            </FieldDescription>
          </Field>
        ) : null}

        {state.error ? (
          <Field>
            <FieldError>{state.error}</FieldError>
          </Field>
        ) : null}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving bakery..." : "Save and continue"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
