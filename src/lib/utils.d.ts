import { type ClassValue } from "clsx";
type Procedure = (...args: unknown[]) => unknown;
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatCurrency(amount: number, currency?: string, options?: Intl.NumberFormatOptions): string;
export declare function generateUniqueId(prefix?: string): string;
export declare function truncateText(text: string, maxLength: number): string;
export declare function formatDate(date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string;
export declare function debounce<T extends Procedure>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends Procedure>(func: T, limit: number): (...args: Parameters<T>) => void;
