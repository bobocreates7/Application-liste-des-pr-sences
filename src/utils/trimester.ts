export type Trimester = '1' | '2' | '3';

export function getTrimesterFromDate(dateString: string): Trimester {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11
  
  // 1 (septembre à décembre) => 8 to 11
  // 2 (janvier à mars) => 0 to 2
  // 3 (avril à juin) => 3 to 5
  // (juillet, aout) => 6 to 7. Let's put them in 3 for fallback, or 1 if it's prep for next year. Let's say 3.

  if (month >= 8 && month <= 11) {
    return '1';
  } else if (month >= 0 && month <= 2) {
    return '2';
  } else {
    return '3';
  }
}

export function getTrimesterLabel(trimester: Trimester): string {
  switch (trimester) {
    case '1': return '1er Trimestre';
    case '2': return '2ème Trimestre';
    case '3': return '3ème Trimestre';
  }
}

export const TRIMESTER_OPTIONS = [
  { value: '1', label: '1er Trimestre' },
  { value: '2', label: '2ème Trimestre' },
  { value: '3', label: '3ème Trimestre' }
];
