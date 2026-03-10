// Utility functions to handle BigInt serialization issues

export function convertBigIntToString(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = obj[key].toString();
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigIntToString(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}

export function convertBigIntToNumber(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  } else if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = Number(obj[key]);
      } else if (typeof obj[key] === "object") {
        newObj[key] = convertBigIntToNumber(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}
