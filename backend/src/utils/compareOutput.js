// Handles trimming spaces, newline differences

export function compareOutput(actual, expected) {
  return actual.trim() === expected.trim();
}
