export const mediumProblems = [
  {
    title: "Add Two Numbers (LeetCode)",
    description: "Linked list integer addition.",
    constraints: "List length ≤ 100",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Handle carry."],
    tags: ["Linked List", "LeetCode"],
    testcases: [{ input: "2 4 3\n5 6 4\n", output: "7 0 8\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "0\n0\n", output: "0\n" },
      { input: "9 9 9 9 9 9 9\n9 9 9 9\n", output: "8 9 9 9 0 0 0 1\n" }
    ]
  },
  {
    title: "Unique Paths (LeetCode)",
    description: "Paths from top-left to bottom-right of MxN grid.",
    constraints: "m,n ≤ 100",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["DP (grid[i][j] = grid[i-1][j] + grid[i][j-1])."],
    tags: ["Math", "Dynamic Programming", "LeetCode"],
    testcases: [{ input: "3 7\n", output: "28\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "3 2\n", output: "3\n" },
      { input: "1 1\n", output: "1\n" }
    ]
  },
  {
    title: "Jump Game (LeetCode)",
    description: "Can you reach the last index?",
    constraints: "n ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Greedy: track furthest reachable."],
    tags: ["Greedy", "Dynamic Programming", "LeetCode"],
    testcases: [{ input: "5\n2 3 1 1 4\n", output: "true\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "5\n3 2 1 0 4\n", output: "false\n" },
      { input: "1\n0\n", output: "true\n" }
    ]
  },
  {
    title: "Set Matrix Zeroes (LeetCode)",
    description: "If an element is 0, set its entire row and column to 0.",
    constraints: "m,n ≤ 200",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use first row/col as markers."],
    tags: ["Matrix", "LeetCode"],
    testcases: [{ input: "3 3\n1 1 1\n1 0 1\n1 1 1\n", output: "1 0 1\n0 0 0\n1 0 1\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1 1\n5\n", output: "5\n" },
      { input: "2 2\n0 1\n1 1\n", output: "0 0\n0 1\n" }
    ]
  },
  {
    title: "Word Search (LeetCode)",
    description: "Search for word in character board.",
    constraints: "m,n ≤ 12",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["DFS + Backtracking."],
    tags: ["Backtracking", "Matrix", "LeetCode"],
    testcases: [{ input: "3 4\nA B C E\nS F C S\nA D E E\nABCCED\n", output: "true\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "2 2\na b\nc d\nabcd\n", output: "false\n" }
    ]
  },
  {
    title: "House Robber",
    description: "Maximum money you can rob from houses (cannot rob adjacent).",
    constraints: "n ≤ 100",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["dp[i] = max(dp[i-1], dp[i-2] + nums[i])."],
    tags: ["Dynamic Programming", "LeetCode"],
    testcases: [{ input: "4\n1 2 3 1\n", output: "4\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "5\n2 7 9 3 1\n", output: "12\n" },
      { input: "1\n0\n", output: "0\n" }
    ]
  },
  {
    title: "String to Integer (atoi)",
    description: "Implement custom atoi function.",
    constraints: "|s| ≤ 200",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["Handle whitespace, plus/minus, and overflow."],
    tags: ["Strings", "LeetCode"],
    testcases: [{ input: "42\n", output: "42\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "   -42\n", output: "-42\n" },
      { input: "4193 with words\n", output: "4193\n" }
    ]
  },
  {
    title: "Letter Combinations of a Phone Number (Unique)",
    description: "Phone digits to letters mapping.",
    constraints: "length ≤ 4",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Backtracking or recursion."],
    tags: ["Backtracking", "LeetCode"],
    testcases: [{ input: "23\n", output: "ad ae af bd be bf cd ce cf\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "2\n", output: "a b c\n" }
    ]
  },
  {
    title: "Rotate Array",
    description: "Rotate an array to the right by k steps.",
    constraints: "n ≤ 10^5, k ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["Reverse the whole array, then reverse first k, then rest."],
    tags: ["Array", "Two Pointers", "LeetCode"],
    testcases: [{ input: "7\n1 2 3 4 5 6 7\n3\n", output: "5 6 7 1 2 3 4\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "4\n-1 -100 3 99\n2\n", output: "3 99 -1 -100\n" }]
  },
  {
    title: "Coin Change (Unique)",
    description: "Fewest coins to make up an amount.",
    constraints: "amount ≤ 10^4, n ≤ 12",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["DP: dp[i] = min(dp[i], dp[i-coin] + 1)."],
    tags: ["Dynamic Programming", "LeetCode"],
    testcases: [{ input: "3\n1 2 5\n11\n", output: "3\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n2\n3\n", output: "-1\n" }, { input: "1\n1\n0\n", output: "0\n" }]
  },
  {
    title: "Longest Consecutive Sequence",
    description: "Find the length of the longest consecutive elements sequence in an unsorted array.",
    constraints: "n ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a HashSet for O(n)."],
    tags: ["Array", "Hash Table", "LeetCode"],
    testcases: [{ input: "6\n100 4 200 1 3 2\n", output: "4\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "10\n0 3 7 2 5 8 4 6 0 1\n", output: "9\n" }]
  },
  {
    title: "Validate Binary Search Tree",
    description: "Determine if a binary tree is a valid BST.",
    constraints: "n ≤ 10^4",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["Recursive with min/max boundaries."],
    tags: ["Tree", "DFS", "LeetCode"],
    testcases: [{ input: "2 1 3\n", output: "true\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "5 1 4 null null 3 6\n", output: "false\n" }]
  },
  {
    title: "Number of Islands",
    description: "Count the number of islands in an m x n 2D binary grid.",
    constraints: "m,n ≤ 300",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["DFS or BFS from each '1'."],
    tags: ["Graph", "DFS", "LeetCode"],
    testcases: [{ input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1\n", output: "3\n" }]
  },
  {
    title: "Course Schedule",
    description: "Determine if you can finish all courses given prerequisites.",
    constraints: "n ≤ 2000",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Topological sort/Cycle detection in directed graph."],
    tags: ["Graph", "BFS", "LeetCode"],
    testcases: [{ input: "2\n1 0\n", output: "true\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "2\n1 0 0 1\n", output: "false\n" }]
  },
  {
    title: "Non-overlapping Intervals",
    description: "Minimum number of intervals to remove to make the rest non-overlapping.",
    constraints: "n ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["Greedy: sort by end time."],
    tags: ["Greedy", "Array", "LeetCode"],
    testcases: [{ input: "4\n1 2 2 3 3 4 1 3\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "3\n1 2 1 2 1 2\n", output: "2\n" }]
  },
  {
    title: "Merge Kernels (Codeforces Variant)",
    description: "Combine two arrays into one by following specific merging rules.",
    constraints: "n ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a pointer to track the position in both arrays."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3 3\n1 2 3\n4 5 6\n", output: "1 4 2 5 3 6\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1 1\n5\n10\n", output: "5 10\n" }]
  },
  {
    title: "Subarray Sum Equals K",
    description: "Find the total number of continuous subarrays whose sum equals k.",
    constraints: "n ≤ 2*10^4",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a prefix sum with a HashMap to store counts."],
    tags: ["Array", "Hash Table", "LeetCode"],
    testcases: [{ input: "3\n1 1 1\n2\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "3\n1 2 3\n3\n", output: "2\n" }]
  },
  {
    title: "Top K Frequent Elements (Unique)",
    description: "Return the k most frequent elements in an array.",
    constraints: "n ≤ 10^5",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a bucket sort approach or a PriorityQueue."],
    tags: ["Hash Table", "Heap", "LeetCode"],
    testcases: [{ input: "6\n1 1 1 2 2 3\n2\n", output: "1 2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n1\n1\n", output: "1\n" }]
  },
  {
    title: "Implement Trie (Prefix Tree)",
    description: "Implement a trie with insert, search, and startsWith methods.",
    constraints: "|s| ≤ 2000",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a node with a mapping of characters to children."],
    tags: ["Trie", "Tree", "LeetCode"],
    testcases: [{ input: "insert apple\nsearch apple\nstartsWith app\n", output: "null\ntrue\ntrue\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "insert a\nsearch b\n", output: "null\nfalse\n" }]
  },
  {
    title: "Evaluate Reverse Polish Notation",
    description: "Evaluate the value of an arithmetic expression in RPN.",
    constraints: "n ≤ 10^4",
    difficulty: "MEDIUM",
    timeLimitMs: 1000,
    hints: ["Use a stack to store numbers; apply operator to last two."],
    tags: ["Stack", "Math", "LeetCode"],
    testcases: [{ input: "5\n2 1 + 3 *\n", output: "9\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "5\n4 13 5 / +\n", output: "6\n" }]
  },
  {
    title: "Clone Graph",
    description: "Return a deep copy of a connected undirected graph.",
    constraints: "n ≤ 100",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Use a Map to track visited nodes and their clones."],
    tags: ["Graph", "DFS", "LeetCode"],
    testcases: [{ input: "[[2,4],[1,3],[2,4],[1,3]]\n", output: "[[2,4],[1,3],[2,4],[1,3]]\n", isHidden: false, isSample: true }],
    hiddenCases: []
  },
  {
    title: "Graph Valid Tree",
    description: "Determine if n nodes form a valid tree.",
    constraints: "n ≤ 2000",
    difficulty: "MEDIUM",
    timeLimitMs: 2000,
    hints: ["Check if edges == n-1 and all nodes are connected."],
    tags: ["Graph", "Union Find", "LeetCode"],
    testcases: [{ input: "5\n0 1\n0 2\n0 3\n1 4\n", output: "true\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "5\n0 1\n1 2\n2 3\n1 3\n1 4\n", output: "false\n" }]
  }
];
