// Latin digits in both languages (what Algerian shoppers expect on prices).
export function formatDZD(amount: number, lang: "fr" | "ar" = "fr"): string {
  return amount.toLocaleString("en-US") + (lang === "ar" ? " دج" : " DA");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-DZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Algiers",
  });
}

export function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-DZ", { timeZone: "Africa/Algiers" });
}

export function formatTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
}
