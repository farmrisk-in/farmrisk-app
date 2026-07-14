export function normalizePhoneNumber(value: string) {
  const normalized = value.trim().replace(/\s+/g, "");

  // Must be a 10-digit Indian mobile number
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return null;
  }

  return normalized;
}
