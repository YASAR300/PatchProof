import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names and resolves Tailwind CSS conflicts.
 *
 * @param {...any} inputs - Class names, conditions, or arrays
 * @returns {string} - Combined class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
