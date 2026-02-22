function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }

    const valueA = (a as any)[key];
    const valueB = (b as any)[key];

    if (typeof valueA === 'object' && typeof valueB === 'object') {
      if (!isEqual(valueA, valueB)) {
        return false;
      }
    } else {
      if (valueA !== valueB) {
        return false;
      }
    }
  }

  return true;
}

export default isEqual;
