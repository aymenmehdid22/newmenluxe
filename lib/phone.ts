// Accepts 0550123456 / 0550 12 34 56 / 0550-12-34-56 / +213550123456 and
// returns the canonical form "0550123456", or null when invalid.
export function normalizeAlgerianPhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+213")) digits = "0" + digits.slice(4);
  else if (digits.startsWith("00213")) digits = "0" + digits.slice(5);
  else if (digits.startsWith("213")) digits = "0" + digits.slice(3);
  digits = digits.replace(/\D/g, "");
  return /^0(5|6|7)\d{8}$/.test(digits) ? digits : null;
}
