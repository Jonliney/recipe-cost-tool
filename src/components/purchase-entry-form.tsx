"use client";

import { useActionState } from "react";

import { addPurchaseEntry } from "@/app/catalog/[itemId]/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PurchaseEntryFormProps = {
  itemId: string;
  canonicalUnit: string;
};

const initialState = {
  error: null,
};

function getDefaultPurchasedAt() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 16);
}

export function PurchaseEntryForm({
  itemId,
  canonicalUnit,
}: PurchaseEntryFormProps) {
  const [state, formAction, isPending] = useActionState(
    addPurchaseEntry,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="itemId" value={itemId} />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="supplierName">Supplier</FieldLabel>
          <Input
            id="supplierName"
            name="supplierName"
            placeholder="Costco"
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="packCount">Pack count</FieldLabel>
          <Input
            id="packCount"
            name="packCount"
            type="number"
            min="1"
            step="1"
            defaultValue="1"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="packQuantity">Pack size</FieldLabel>
          <Input
            id="packQuantity"
            name="packQuantity"
            type="number"
            min="0.0001"
            step="0.0001"
            defaultValue="1"
            required
            className="bg-background"
          />
          <FieldDescription>
            This is entered in the item&apos;s canonical unit: `{canonicalUnit}`.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="totalPrice">Total price</FieldLabel>
          <Input
            id="totalPrice"
            name="totalPrice"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="purchasedAt">Purchased at</FieldLabel>
          <Input
            id="purchasedAt"
            name="purchasedAt"
            type="datetime-local"
            defaultValue={getDefaultPurchasedAt()}
            required
            className="bg-background"
          />
        </Field>

        {state.error ? (
          <Field>
            <FieldError>{state.error}</FieldError>
          </Field>
        ) : null}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving purchase..." : "Add purchase entry"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
