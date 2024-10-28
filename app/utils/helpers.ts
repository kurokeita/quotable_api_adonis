export function getDefaultValue<T>(v: unknown, d: T) {
  return v === undefined || v === null ? d : v
}
