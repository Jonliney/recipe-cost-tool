export function getActionFormValue(formData: FormData, fieldName: string) {
  const directValue = formData.get(fieldName);

  if (directValue !== null) {
    return directValue;
  }

  for (const [entryKey, entryValue] of formData.entries()) {
    if (entryKey === fieldName) {
      return entryValue;
    }

    if (entryKey.match(new RegExp(`^_\\d+_${fieldName}$`))) {
      return entryValue;
    }
  }

  return undefined;
}
