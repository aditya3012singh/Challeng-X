export const easyProblems = [
  {
    title: "Watermelon",
    description: " Pete and Billy want to divide a watermelon of weight w into two parts, each weighing an even positive integer number of kilos.",
    constraints: "1 ≤ w ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Check if w is even and > 2."],
    tags: ["Math", "Codeforces"],
    testcases: [{ input: "8\n", output: "YES\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1\n", output: "NO\n" },
      { input: "2\n", output: "NO\n" },
      { input: "3\n", output: "NO\n" },
      { input: "4\n", output: "YES\n" },
      { input: "99\n", output: "NO\n" },
      { input: "100\n", output: "YES\n" }
    ]
  },
  {
    title: "Way Too Long Words",
    description: "Abbreviate words longer than 10 characters (e.g., 'internationalization' -> 'i18n').",
    constraints: "1 ≤ n ≤ 100, length ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Check length > 10, use first and last chars."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis\n", output: "word\nl10n\ni18n\np43s\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1\nabcdefghij\n", output: "abcdefghij\n" },
      { input: "1\nabcdefghijk\n", output: "a9k\n" },
      { input: "2\na\nveryverylongword\n", output: "a\nv14d\n" }
    ]
  },
  {
    title: "Two Sum (LeetCode)",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.",
    constraints: "2 ≤ n ≤ 10^4",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Use a hash map for O(n)."],
    tags: ["Array", "Hash Table", "LeetCode"],
    testcases: [{ input: "4\n2 7 11 15\n9\n", output: "0 1\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "3\n3 2 4\n6\n", output: "1 2\n" },
      { input: "2\n3 3\n6\n", output: "0 1\n" },
      { input: "5\n-1 -2 -3 -4 -5\n-8\n", output: "2 4\n" }
    ]
  },
  // "Palindrome Number" removed (exists in original)
  {
    title: "Team",
    description: "Count problems where at least two out of three friends are sure of the solution.",
    constraints: "1 ≤ n ≤ 1000",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Sum the 0/1 values for each problem."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3\n1 1 0\n1 1 1\n1 0 0\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1\n0 0 0\n", output: "0\n" },
      { input: "1\n1 1 0\n", output: "1\n" },
      { input: "2\n1 0 0\n0 1 1\n", output: "1\n" }
    ]
  },
  {
    title: "Next Round",
    description: "Contestants score >= k-th score and > 0 advance.",
    constraints: "1 ≤ n, k ≤ 50",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Find k-th score first."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "8 5\n10 9 8 7 7 7 5 5\n", output: "6\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "4 2\n0 0 0 0\n", output: "0\n" },
      { input: "1 1\n1\n", output: "1\n" }
    ]
  },
  {
    title: "Bit++",
    description: "Execute Bit++ operations and find final X.",
    constraints: "1 ≤ n ≤ 150",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Look for '+' or '-'."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "1\n++X\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "2\nX++\n--X\n", output: "0\n" },
      { input: "3\n++X\n++X\n++X\n", output: "3\n" }
    ]
  },
  {
    title: "Domino piling",
    description: "Maximum dominoes of size 2x1 on MxN board.",
    constraints: "1 ≤ m, n ≤ 16",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Divide area by 2."],
    tags: ["Math", "Codeforces"],
    testcases: [{ input: "2 4\n", output: "4\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "3 3\n", output: "4\n" },
      { input: "1 1\n", output: "0\n" }
    ]
  },
  {
    title: "Boy or Girl",
    description: "Identify gender by unique characters in username.",
    constraints: "|s| ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Count unique chars. Even = GIRL."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "wjmzbmr\n", output: "CHAT WITH HER!\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "xiaodao\n", output: "IGNORE HIM!\n" },
      { input: "sevenkplus\n", output: "CHAT WITH HER!\n" }
    ]
  },
  {
    title: "Helpful Maths",
    description: "Rearrange a sum in non-decreasing order (e.g., '3+2+1' -> '1+2+3').",
    constraints: "|s| ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Extract digits, sort them, join with '+'."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "3+2+1\n", output: "1+2+3\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1+1\n", output: "1+1\n" },
      { input: "2\n", output: "2\n" }
    ]
  },
  {
    title: "Petya and Strings",
    description: "Compare two strings lexicographically (case-insensitive).",
    constraints: "|s| ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Convert to lowercase first."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "aaaa\naaaa\n", output: "0\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "abcdefg\nAbCdEfF\n", output: "1\n" },
      { input: "abc\nabd\n", output: "-1\n" }
    ]
  },
  {
    title: "Stones on the Table",
    description: "Minimum stones to remove so no two neighbor stones have same color.",
    constraints: "1 ≤ n ≤ 50",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Count color[i] == color[i+1]."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "3\nRRG\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "5\nRRRRR\n", output: "4\n" },
      { input: "4\nRGBY\n", output: "0\n" }
    ]
  },
  {
    title: "Elephant",
    description: "Minimum steps of 1-5 units to reach distance x.",
    constraints: "1 ≤ x ≤ 10^6",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Ceil of x/5."],
    tags: ["Math", "Codeforces"],
    testcases: [{ input: "5\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "12\n", output: "3\n" },
      { input: "1000000\n", output: "200000\n" }
    ]
  },
  {
    title: "Bear and Big Brother",
    description: "Years for Limak's weight (triples/year) to exceed Bob's (doubles/year).",
    constraints: "1 ≤ a ≤ b ≤ 10",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Simple loop while a <= b."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "4 7\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "4 9\n", output: "3\n" },
      { input: "1 1\n", output: "1\n" }
    ]
  },
  {
    title: "Wrong Subtraction",
    description: "Tanya's subtraction algorithm: if last digit is 0, divide by 10, else subtract 1.",
    constraints: "2 ≤ n ≤ 10^9, 1 ≤ k ≤ 50",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Repeat k times."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "512 4\n", output: "50\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1000000000 9\n", output: "1\n" },
      { input: "10 1\n", output: "1\n" }
    ]
  },
  {
    title: "Queue at the School",
    description: "Rearrange queue: girls move ahead of boys every second.",
    constraints: "1 ≤ n, t ≤ 50",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Update queue t times. Swap BG to GB."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "5 1\nBGGBG\n", output: "GBGGB\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "5 2\nBGGBG\n", output: "GGBGB\n" },
      { input: "2 1\nBG\n", output: "GB\n" }
    ]
  },
  {
    title: "Tram",
    description: "Minimum tram capacity required to handle passengers at all x stops.",
    constraints: "2 ≤ n ≤ 1000",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Current = Current - a + b. Track max current."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "4\n0 3\n2 5\n4 2\n4 0\n", output: "6\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "2\n0 5\n5 0\n", output: "5\n" },
      { input: "3\n0 10\n5 5\n10 0\n", output: "10\n" }
    ]
  },
  {
    title: " Nearly Lucky Number (Codeforces)",
    description: "Check if count of luck digits (4, 7) is a lucky number.",
    constraints: "n ≤ 10^18",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Count 4s and 7s. Check if count is 4 or 7."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "40047\n", output: "NO\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "7747774\n", output: "YES\n" },
      { input: "4\n", output: "NO\n" }
    ]
  },
  {
    title: "Anton and Danik",
    description: "Who won more chess games: Anton (A) or Danik (D)?",
    constraints: "n ≤ 10^5",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Count A and D, compare."],
    tags: ["Implementation", "Strings", "Codeforces"],
    testcases: [{ input: "6\nADAAAA\n", output: "Anton\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "6\nADADAD\n", output: "Friendship\n" },
      { input: "3\nDDD\n", output: "Danik\n" }
    ]
  },
  {
    title: "George and Accommodation",
    description: "Count rooms with at least 2 free spaces.",
    constraints: "1 ≤ n ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Check if q - p >= 2."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3\n1 1\n2 2\n3 3\n", output: "0\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "3\n1 10\n0 10\n10 10\n", output: "2\n" },
      { input: "1\n8 10\n", output: "1\n" }
    ]
  },
  {
    title: "Vanya and Fence",
    description: "Minimum width of road required for friends to walk (tall friends take width 2).",
    constraints: "1 ≤ n ≤ 1000, 1 ≤ h ≤ 1000",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["If height > h, 2, else 1. Sum up."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3 7\n4 5 14\n", output: "4\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "6 1\n1 1 1 1 1 1\n", output: "6\n" },
      { input: "2 5\n10 10\n", output: "4\n" }
    ]
  },
  {
    title: "In Search of an Easy Problem",
    description: "Problem is hard if at least one person says it's hard (1).",
    constraints: "1 ≤ n ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Look for '1' in input."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3\n0 0 1\n", output: "HARD\n", isHidden: false, isSample: true }],
    hiddenCases: [
      { input: "1\n0\n", output: "EASY\n" },
      { input: "2\n0 0\n", output: "EASY\n" }
    ]
  },
  {
    title: "Soldier and Bananas",
    description: "Calculate money to borrow for bananas with increasing price.",
    constraints: "1 ≤ k, w ≤ 1000, 0 ≤ n ≤ 10^9",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Total cost = k(1+2+...+w) = k * w * (w+1)/2."],
    tags: ["Math", "Implementation", "Codeforces"],
    testcases: [{ input: "3 17 4\n", output: "13\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1 10 10\n", output: "45\n" }]
  },
  {
    title: "Registration system",
    description: "Handle username registrations. If name exists, add lowest possible integer suffix.",
    constraints: "1 ≤ n ≤ 10^5",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Use a map to store name counts."],
    tags: ["Hashing", "Strings", "Codeforces"],
    testcases: [{ input: "4\nabacaba\nacaba\nabacaba\nacaba\n", output: "OK\nOK\nabacaba1\nacaba1\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "2\na\na\n", output: "OK\na1\n" }]
  },
  {
    title: "Police Recruits",
    description: "Count untreated crimes given police recruits and crime occurrences.",
    constraints: "1 ≤ n ≤ 10^5",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Keep track of available officers."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3\n-1 -1 1\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "8\n1 -1 1 -1 -1 1 1 1\n", output: "1\n" }]
  },
  {
    title: "Magnets",
    description: "Count groups of magnets placed in a row.",
    constraints: "1 ≤ n ≤ 10^5",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Compare current magnet with previous one."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "6\n10\n10\n10\n01\n01\n10\n", output: "3\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "3\n01\n01\n01\n", output: "1\n" }]
  },
  {
    title: "Calculating Function",
    description: "f(n) = -1 + 2 - 3 + 4 - ... + (-1)^n * n. Find f(n).",
    constraints: "1 ≤ n ≤ 10^15",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["If n is even, n/2. If odd, -(n+1)/2."],
    tags: ["Math", "Codeforces"],
    testcases: [{ input: "4\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "5\n", output: "-3\n" }, { input: "1000000000000000\n", output: "500000000000000\n" }]
  },
  {
    title: "Is your horseshoe on the other hoof?",
    description: "Find minimum horseshoes to buy to have 4 distinct colors.",
    constraints: "s1, s2, s3, s4 ≤ 10^9",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["4 - number of unique colors."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "1 7 3 3\n", output: "1\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "7 7 7 7\n", output: "3\n" }]
  },
  {
    title: "Arrival of the General",
    description: "Minimum seconds to move tallest soldier to start and shortest to end.",
    constraints: "2 ≤ n ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Find indices of max (first) and min (last)."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "4\n33 44 11 22\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "7\n10 10 58 31 63 40 56\n", output: "10\n" }]
  },
  {
    title: "Divisibility Problem",
    description: "Minimum moves (+1 to a) to make 'a' divisible by 'b'.",
    constraints: "1 ≤ t ≤ 10^4",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["(b - (a % b)) % b."],
    tags: ["Math", "Codeforces"],
    testcases: [{ input: "1\n10 4\n", output: "2\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n13 9\n", output: "5\n" }]
  },
  {
    title: "Hulk",
    description: "Generate Hulk's feelings: 'I hate that I love that I hate...'",
    constraints: "1 ≤ n ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Alternate 'I hate' and 'I love' joined by 'that'."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "3\n", output: "I hate that I love that I hate it\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "1\n", output: "I hate it\n" }, { input: "2\n", output: "I hate that I love it\n" }]
  },
  {
    title: "Pangram",
    description: "Check if string contains every letter of alphabet at least once.",
    constraints: "1 ≤ n ≤ 100",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Convert to lowercase and use a Set."],
    tags: ["Strings", "Codeforces"],
    testcases: [{ input: "35\nTheQuickBrownFoxJumpsOverTheLazyDog\n", output: "YES\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "12\nabcdefghijkl\n", output: "NO\n" }]
  },
  {
    title: "Anton and Letters",
    description: "Count unique letters in a set like {a, b, c}.",
    constraints: "|s| ≤ 1000",
    difficulty: "EASY",
    timeLimitMs: 2000,
    hints: ["Parse letters and use a Set."],
    tags: ["Implementation", "Codeforces"],
    testcases: [{ input: "{a, b, c}\n", output: "3\n", isHidden: false, isSample: true }],
    hiddenCases: [{ input: "{}\n", output: "0\n" }, { input: "{a, b, a}\n", output: "1\n" }]
  }
];
