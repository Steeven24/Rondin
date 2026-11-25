/**
 * Validates an Ecuadorian national ID (cédula): 10 digits, province 01-24 (or 30),
 * third digit below 6 and the modulo-10 check digit.
 */
export function isValidNationalId(value: string): boolean {
  if (!/^\d{10}$/.test(value)) return false;

  const province = Number(value.slice(0, 2));
  if (!((province >= 1 && province <= 24) || province === 30)) return false;
  if (Number(value[2]) >= 6) return false;

  const digits = value.split("").map(Number);
  const sum = digits.slice(0, 9).reduce((acc, digit, index) => {
    const product = index % 2 === 0 ? digit * 2 : digit;
    return acc + (product > 9 ? product - 9 : product);
  }, 0);
  const check = (10 - (sum % 10)) % 10;
  return check === digits[9];
}
