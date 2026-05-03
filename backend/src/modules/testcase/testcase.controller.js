import TestcaseService from "./testcase.service.js";

class TestcaseController {
  static async addTestCases(req, res) {
  try {
    const { id } = req.params;
    const { testcases } = req.body;

    await TestcaseService.addTestcaseService(id, testcases);

    res.json({ message: "Testcases added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }
}

export default TestcaseController;