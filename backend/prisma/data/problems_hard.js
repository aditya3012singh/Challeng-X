export const hardProblems = [
  {
    title: "Distinct Subsequences (Hard)",
    description: "Count unique subsequences of S that equal T.",
    constraints: "|s|,|t| ≤ 1000",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Classic DP: dp[i][j] is count for s[0...i] and t[0...j]."],
    tags: ["Dynamic Programming", "Strings", "LeetCode"],
    testcases: [{ input: "rabbbit\nrabbit\n", output: "3\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "babgbag\nbag\n", output: "5\n" }
    ]
  },
  {
    title: "Burst Balloons (Unique)",
    description: "Maximize coins from bursting balloons.",
    constraints: "n ≤ 300",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Interval DP: dp[i][j] is max coins in range (i,j)."],
    tags: ["Dynamic Programming", "LeetCode"],
    testcases: [{ input: "4\n3 1 5 8\n", output: "167\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "2\n1 5\n", output: "10\n" }
    ]
  },
  {
    title: "Reverse Nodes in k-Group (Hard)",
    description: "Reverse nodes of a linked list k at a time.",
    constraints: "n ≤ 5000",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Check if k nodes exist, then reverse and recurse."],
    tags: ["Linked List", "LeetCode"],
    testcases: [{ input: "5\n1 2 3 4 5\n2\n", output: "2 1 4 3 5\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "5\n1 2 3 4 5\n3\n", output: "3 2 1 4 5\n" }
    ]
  },
  {
    title: "Dungeon Game",
    description: "Calculate minimum health for a knight to reach the princess in a grid.",
    constraints: "m,n ≤ 200",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Bottom-up DP starting from princess."],
    tags: ["Dynamic Programming", "Matrix", "LeetCode"],
    testcases: [{ input: "3 3\n-2 -3 3\n-5 -10 1\n10 30 -5\n", output: "7\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1 1\n0\n", output: "1\n" }]
  },
  {
    title: "Maximal Rectangle",
    description: "Find the largest rectangle containing only 1's in a binary matrix.",
    constraints: "m,n ≤ 200",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Convert each row to histogram and use 'Largest Rectangle in Histogram' logic."],
    tags: ["Matrix", "Stack", "LeetCode"],
    testcases: [{ input: "4 5\n1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0\n", output: "6\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1 1\n0\n", output: "0\n" }]
  },
  {
    title: "The Skyline Problem",
    description: "Return the collective sky line formed by buildings.",
    constraints: "n ≤ 10^4",
    difficulty: "HARD",
    timeLimitMs: 3000,
    hints: ["Divide and conquer or max-heap with sweep-line."],
    tags: ["Divide and Conquer", "Heap", "LeetCode"],
    testcases: [{ input: "5\n2 9 10\n3 7 15\n5 12 12\n15 20 10\n19 24 8\n", output: "2 10 3 15 7 12 12 0 15 10 20 8 24 0\n", isHidden: false, isSample: true }],
    hiddenCases: []
  },
  {
    title: "Word Ladder II",
    description: "Find all shortest transformation sequences from beginWord to endWord.",
    constraints: "n ≤ 500, length ≤ 10",
    difficulty: "HARD",
    timeLimitMs: 5 * 1000,
    hints: ["BFS to find shortest distance, then DFS/Backtracking for all paths."],
    tags: ["Graph", "BFS", "Backtracking", "LeetCode"],
    testcases: [{ input: "hit\ncog\n5\nhot\ndot\ndog\nlot\nlog\n", output: "hit hot dot dog cog\nhit hot lot log cog\n", isHidden: false, isSample: true }],
    hiddenCases: []
  },
  {
    title: "Shortest Palindrome",
    description: "Add minimum characters at the front of s to make it a palindrome.",
    constraints: "|s| ≤ 5*10^4",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Find longest palindromic prefix using KMP table logic."],
    tags: ["Strings", "KMP", "LeetCode"],
    testcases: [{ input: "aacecaaa\n", output: "aaacecaaa\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "abcd\n", output: "dcbabcd\n" }]
  },
  {
    title: "Binary Tree Maximum Path Sum (Unique)",
    description: "Find max path sum in binary tree.",
    constraints: "n ≤ 3*10^4",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["DFS gain."],
    tags: ["Tree", "DFS", "LeetCode"],
    testcases: [{ input: "1 2 3\n", output: "6\n", isHidden: false, isSample: true }],
    hiddenCases: []
  },
  {
    title: "Smallest Range Covering Elements from K Lists",
    description: "Find the smallest range that includes at least one number from each of the k lists.",
    constraints: "k ≤ 3500, total elements ≤ 10^5",
    difficulty: "HARD",
    timeLimitMs: 3000,
    hints: ["Use a Min-Heap to track the current smallest element from each list."],
    tags: ["Heap", "Sliding Window", "LeetCode"],
    testcases: [{ input: "3\n4 10 15 24 26\n0 9 12 20\n5 18 22 30\n", output: "20 24\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n1 2 3\n", output: "1 1\n" }]
  },
  {
    title: "Longest Valid Parentheses",
    description: "Find the length of the longest valid (well-formed) parentheses substring.",
    constraints: "length ≤ 3*10^4",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Use a stack or dynamic programming to track valid segments."],
    tags: ["Strings", "Stack", "LeetCode"],
    testcases: [{ input: "(()\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: ")()())\n", output: "4\n" }, { input: "\n", output: "0\n" }]
  },
  {
    title: "Largest Rectangle in Histogram (Unique)",
    description: "Find the largest rectangle area in a histogram.",
    constraints: "n ≤ 10^5",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Monotonic stack."],
    tags: ["Stack", "Array", "LeetCode"],
    testcases: [{ input: "6\n2 1 5 6 2 3\n", output: "10\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "2\n2 4\n", output: "4\n" }]
  },
  {
    title: "Sliding Window Maximum (Unique)",
    description: "Find the maximum element in each sliding window of size k.",
    constraints: "n ≤ 10^5, k ≤ n",
    difficulty: "HARD",
    timeLimitMs: 2000,
    hints: ["Use a Deque to maintain indices of elements in the current window."],
    tags: ["Sliding Window", "Heap", "LeetCode"],
    testcases: [{ input: "8\n1 3 -1 -3 5 3 6 7\n3\n", output: "3 3 5 5 6 7\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n1\n1\n", output: "1\n" }]
  }
];
