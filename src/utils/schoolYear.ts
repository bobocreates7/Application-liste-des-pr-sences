export function getSchoolYearFromDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed, 0 = Jan, 8 = Sept
  
  if (month >= 8) { // Sept to Dec
    return `${year}-${year + 1}`;
  } else { // Jan to Aug
    return `${year - 1}-${year}`;
  }
}

export function getCurrentSchoolYear(): string {
  return getSchoolYearFromDate(new Date());
}
