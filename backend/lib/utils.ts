import parsePhoneNumberFromString from "libphonenumber-js";

export const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// Format phone number to E.164 standard
export function formatPhoneNumber(input: string): string | null {
  const phoneNumber = parsePhoneNumberFromString(input);

  if (!phoneNumber || !phoneNumber.isValid()) {
    return null;
  }

  return phoneNumber.format('E.164');
}