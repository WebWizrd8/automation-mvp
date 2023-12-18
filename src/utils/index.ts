export function unescapeSqlJsonPath(sqlJsonPath: string): string {
  // Remove SQL-escaped double quotes
  let unescaped = sqlJsonPath.replace(/"/g, "");

  // Remove any wrapping quotes around the entire string, if present
  if (unescaped.startsWith('"') && unescaped.endsWith('"')) {
    unescaped = unescaped.substring(1, unescaped.length - 1);
  }

  return unescaped;
}
