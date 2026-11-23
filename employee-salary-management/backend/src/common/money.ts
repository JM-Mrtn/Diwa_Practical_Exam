export function numberOf(value: string | number | null | undefined): number {
  return Number(value ?? 0);
}
export function pesos(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
