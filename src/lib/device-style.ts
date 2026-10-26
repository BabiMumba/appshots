/**
 * Helpers for device frame rendering variants.
 */

export function isPunchHoleDevice(deviceId: string): boolean {
  return (
    deviceId.startsWith("samsung-") ||
    deviceId.startsWith("pixel-") ||
    deviceId.includes("galaxy")
  );
}

export function isTabletDevice(deviceId: string): boolean {
  return deviceId.includes("tab") || deviceId.includes("ipad");
}
