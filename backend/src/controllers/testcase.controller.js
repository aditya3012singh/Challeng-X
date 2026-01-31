import { addTestcaseService } from "../services/testcase.service.js";

export async function addTestCases(req, res) {
  try {
    const { id } = req.params;
    const { testcases } = req.body;

    await addTestcaseService(id, testcases);

    res.json({ message: "Testcases added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}