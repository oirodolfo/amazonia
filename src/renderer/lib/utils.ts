import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Combines Tailwind and conditional classes with conflict resolution.
 *
 * @param inputs - CSS class values.
 * @returns A merged class string.
 *
 * @example
 * ```ts
 * cn('p-2', true && 'p-4') // 'p-4'
 * ```
 */
export function cn(...inputs: readonly ClassValue[]): string {
    return twMerge(clsx(inputs));
}
