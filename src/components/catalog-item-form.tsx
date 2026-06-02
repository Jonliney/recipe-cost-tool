"use client";

import { useActionState } from "react";

import { createCatalogItem } from "@/app/catalog/actions";
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

const initialState = {
  error: null,
};

export function CatalogItemForm() {
  const [state, formAction, isPending] = useActionState(
    createCatalogItem,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select defaultValue="ingredient" name="category">
            <SelectTrigger id="category" className="w-full bg-background">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ingredient">Ingredient</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="name">Item name</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Butter"
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="canonicalUnit">Canonical unit</FieldLabel>
          <Input
            id="canonicalUnit"
            name="canonicalUnit"
            placeholder="g, ml, each"
            required
            className="bg-background"
          />
          <FieldDescription>
            Use the unit this item will be costed in. Example: `g`, `ml`, or
            `each`.
          </FieldDescription>
        </Field>

        {state.error ? (
          <Field>
            <FieldError>{state.error}</FieldError>
          </Field>
        ) : null}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Adding item..." : "Add item"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
