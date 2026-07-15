const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(amount) {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatWithSuffix(amount, suffix = "") {
  return `${formatPrice(amount)}${suffix ?? ""}`;
}
