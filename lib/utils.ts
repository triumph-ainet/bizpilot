import { twMerge } from 'tailwind-merge';

type ClassValue = string | undefined | null | false | ClassValue[];

function flattenClasses(inputs: ClassValue[]): string[] {
  const result: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) result.push(...flattenClasses(input));
    else result.push(input as string);
  }
  return result;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(flattenClasses(inputs).join(' '));
}
