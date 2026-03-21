/**
 * Deep merge a target object with a source object.
 * This ensures that nested configurations from a base default object
 * are not completely overwritten by partial updates from the source (e.g. database payload),
 * unless explicitly defined.
 *
 * Arrays in the source object will overwrite arrays in the target object.
 * 
 * @param target The default base object
 * @param source The partial update object
 * @returns A new deeply merged object
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
    if (target === null || target === undefined) {
        return source as T;
    }

    if (source === null || source === undefined) {
        return target;
    }

    if (typeof target !== "object" || typeof source !== "object") {
        return source as T;
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        return source as unknown as T; // Source arrays override target arrays
    }

    const output = { ...target };

    // Iterate through all keys of the source object
    Object.keys(source).forEach((key) => {
        const targetValue = (target as Record<string, any>)[key];
        const sourceValue = (source as Record<string, any>)[key];

        if (Array.isArray(sourceValue)) {
            // Source array overwrites
            (output as Record<string, any>)[key] = sourceValue;
        } else if (
            sourceValue !== null &&
            typeof sourceValue === "object" &&
            targetValue !== null &&
            typeof targetValue === "object"
        ) {
            // Recursively deep merge objects
            (output as Record<string, any>)[key] = deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
            // Primitive or simple value overwrites
            (output as Record<string, any>)[key] = sourceValue;
        }
    });

    return output;
}
