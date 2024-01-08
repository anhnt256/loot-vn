import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getRandomItem = (arr: any) => {
  if (arr.length === 0) {
    throw new Error("Cannot get a random item from an empty array.");
  }
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
};
