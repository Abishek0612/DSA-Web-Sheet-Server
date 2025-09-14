const axios = require("axios");
const { logger } = require("../utils/logger");

class CodeExecutionService {
  constructor() {
    this.judge0BaseUrl = "https://judge0-ce.p.rapidapi.com";
    this.languageMap = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
      c: 50,
      go: 60,
      rust: 73,
    };
  }

  async executeCode(code, language, input = "") {
    try {
      const languageId = this.languageMap[language.toLowerCase()];

      if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
      }

      const submissionResponse = await axios.post(
        `${this.judge0BaseUrl}/submissions?base64_encoded=true&wait=false`,
        {
          source_code: Buffer.from(code).toString("base64"),
          language_id: languageId,
          stdin: Buffer.from(input).toString("base64"),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const token = submissionResponse.data.token;

      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        await this.delay(1000);

        const resultResponse = await axios.get(
          `${this.judge0BaseUrl}/submissions/${token}?base64_encoded=true`,
          {
            headers: {
              "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const result = resultResponse.data;

        if (result.status.id > 2) {
          return {
            success: result.status.id === 3,
            output: result.stdout
              ? Buffer.from(result.stdout, "base64").toString()
              : "",
            error: result.stderr
              ? Buffer.from(result.stderr, "base64").toString()
              : result.compile_output
              ? Buffer.from(result.compile_output, "base64").toString()
              : result.status.description || "",
            executionTime: result.time ? parseFloat(result.time) : 0,
            memoryUsed: result.memory ? parseInt(result.memory) : 0,
          };
        }

        attempts++;
      }

      throw new Error("Execution timeout");
    } catch (error) {
      logger.error("Code execution error:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Code execution failed",
      };
    }
  }

  async runTestCases(code, language, testCases) {
    const results = [];
    let passed = 0;

    for (const testCase of testCases) {
      try {
        const execution = await this.executeCode(
          code,
          language,
          testCase.input
        );

        const actualOutput = (execution.output || "").trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const testPassed = execution.success && actualOutput === expectedOutput;

        if (testPassed) passed++;

        results.push({
          passed: testPassed,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          error: execution.error,
        });
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          error: error.message,
        });
      }
    }

    return {
      passed,
      total: testCases.length,
      results,
    };
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = { CodeExecutionService };
