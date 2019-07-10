export function formatPayment(total, currency = "USD") {
  if (!total) total = 0;
  if (Intl && Intl.NumberFormat) {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(total);
  } else {
    return total + " " + currency;
  }
}
