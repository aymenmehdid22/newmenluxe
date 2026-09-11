export function formatDZD(amount: number): string {
  return amount.toLocaleString("en-US") + " DA";
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
