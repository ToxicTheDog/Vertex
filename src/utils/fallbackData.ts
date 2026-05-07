export function createEmptyData<T>(sample: T): T {
  if (Array.isArray(sample)) {
    return [] as T;
  }

  if (sample === null || sample === undefined) {
    return sample;
  }

  if (typeof sample === 'number') {
    return 0 as T;
  }

  if (typeof sample === 'string') {
    return '' as T;
  }

  if (typeof sample === 'boolean') {
    return false as T;
  }

  if (sample instanceof Date) {
    return new Date(0) as T;
  }

  if (typeof sample === 'object') {
    const result = Object.fromEntries(
      Object.entries(sample as Record<string, unknown>).map(([key, value]) => [key, createEmptyData(value)])
    );
    return result as T;
  }

  return sample;
}
