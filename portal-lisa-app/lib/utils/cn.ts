/**
 * Concatena classes condicionalmente, ignorando valores falsos.
 * Versão minimalista — sem resolução de conflitos do Tailwind.
 * Suficiente enquanto não houver sobreposição agressiva de utilities.
 */
export function cn(
  ...args: Array<string | number | false | null | undefined>
): string {
  return args.filter(Boolean).join(' ');
}
