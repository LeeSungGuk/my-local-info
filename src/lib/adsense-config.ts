const PLACEHOLDER_VALUE = "나중에_입력";

function normalizeValue(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getNormalizedAdSenseId(value: string | undefined) {
  const normalized = normalizeValue(value);
  if (!normalized || normalized === PLACEHOLDER_VALUE) {
    return "";
  }

  return normalized;
}

function getNormalizedSlot(value: string | undefined) {
  const normalized = normalizeValue(value);
  if (!normalized || normalized === PLACEHOLDER_VALUE) {
    return "";
  }

  return normalized;
}

export function isAdSenseEnabled(enabledFlag: string | undefined) {
  return normalizeValue(enabledFlag).toLowerCase() === "true";
}

export function shouldRenderAdSenseScript({
  adSenseId,
  enabledFlag,
}: {
  adSenseId: string | undefined;
  enabledFlag: string | undefined;
}) {
  return isAdSenseEnabled(enabledFlag) && Boolean(getNormalizedAdSenseId(adSenseId));
}

export function shouldRenderAdSenseBanner({
  adSenseId,
  enabledFlag,
  slot,
}: {
  adSenseId: string | undefined;
  enabledFlag: string | undefined;
  slot: string | undefined;
}) {
  return (
    shouldRenderAdSenseScript({ adSenseId, enabledFlag }) &&
    Boolean(getNormalizedSlot(slot))
  );
}
