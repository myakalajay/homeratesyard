import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with clsx to handle conditionals and conflicts.
 * This is the standard utility for all UI components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}