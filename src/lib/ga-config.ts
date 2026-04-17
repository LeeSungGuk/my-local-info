const PLACEHOLDER_VALUE = "나중에_입력";

function normalizeValue(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getNormalizedGaId(value: string | undefined) {
  const normalized = normalizeValue(value);
  if (!normalized || normalized === PLACEHOLDER_VALUE) {
    return "";
  }

  return normalized;
}

export function shouldRenderGaScript(gaId: string | undefined) {
  return Boolean(getNormalizedGaId(gaId));
}
