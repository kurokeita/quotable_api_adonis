export function getDefaultValue<T>(v: unknown, d: T | null = null) {
  return v === undefined || v === null ? d : v
}
