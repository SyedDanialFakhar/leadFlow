export function getRecommendedContactRole(employeeCountStr: string | null): string {
  if (!employeeCountStr) return 'Director or CEO';

  const parsed = parseEmployeeCount(employeeCountStr);

  if (parsed < 30) return 'Director or CEO';
  if (parsed <= 100) return 'Sales Manager or General Manager';
  if (parsed <= 300) return 'HR Manager or People & Culture Manager';
  if (parsed <= 500) return 'People & Culture Manager';
  
  return 'People & Culture Manager'; // Default for 500+
}

export function parseEmployeeCount(str: string): number {
  const cleaned = str.replace(/[^0-9-]/g, '');
  const parts = cleaned.split('-');
  if (parts.length === 2) {
    return Math.round((parseInt(parts[0], 10) + parseInt(parts[1], 10)) / 2);
  }
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function shouldTargetCEO(employeeCountStr: string | null): boolean {
  if (!employeeCountStr) return true;
  return parseEmployeeCount(employeeCountStr) < 100;
}
