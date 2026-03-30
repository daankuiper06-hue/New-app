export function euro(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);
}

export function dateNl(value: string | Date) {
  return new Date(value).toLocaleDateString("nl-NL");
}
