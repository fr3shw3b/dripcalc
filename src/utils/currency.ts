const FORMATTERS: Record<string, Intl.NumberFormat> = {
  $: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }),
  "£": new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }),
  "€": new Intl.NumberFormat("es", {
    style: "currency",
    currency: "EUR",
  }),
};

function formatCurrency(currency: string, value?: number): string {
  return FORMATTERS[currency].format(value ?? 0);
}

export default formatCurrency;
