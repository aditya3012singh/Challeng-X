// Handles trimming spaces, newline differences

class OutputComparer {
  static compareOutput(actual, expected) {
    return actual.trim() === expected.trim();
  }
}

export default OutputComparer;
