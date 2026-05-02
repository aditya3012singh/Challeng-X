export const originalProblems = [
  {
    "title": "Sum of Two Numbers",
    "description": "Given two integers `a` and `b` on a single line separated by a space, print their sum.\n\n**Example Input:**\n```\n3 5\n```\n**Example Output:**\n```\n8\n```",
    "constraints": "-10^9 ≤ a, b ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "hints": [
      "Read both numbers from the input.",
      "Add them using the + operator.",
      "Use BigInt if you're in a language that might overflow, though 10^9 fits in a standard integer."
    ],
    "tags": [
      "Basic",
      "Math"
    ],
    "testcases": {
      "create": [
        {
          "input": "3 5\n",
          "output": "8\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "-1 1\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0 0\n",
        "output": "0\n"
      },
      {
        "input": "1000 2000\n",
        "output": "3000\n"
      },
      {
        "input": "-500 500\n",
        "output": "0\n"
      },
      {
        "input": "999999999 1\n",
        "output": "1000000000\n"
      },
      {
        "input": "-1000000000 -1\n",
        "output": "-1000000001\n"
      },
      {
        "input": "123 456\n",
        "output": "579\n"
      },
      {
        "input": "-200 -300\n",
        "output": "-500\n"
      },
      {
        "input": "1 -1\n",
        "output": "0\n"
      },
      {
        "input": "42 58\n",
        "output": "100\n"
      },
      {
        "input": "0 -1\n",
        "output": "-1\n"
      },
      {
        "input": "777 333\n",
        "output": "1110\n"
      },
      {
        "input": "-999 999\n",
        "output": "0\n"
      },
      {
        "input": "1000000000 1000000000\n",
        "output": "2000000000\n"
      },
      {
        "input": "-1000000000 -1000000000\n",
        "output": "-2000000000\n"
      }
    ]
  },
  {
    "title": "Reverse a String",
    "description": "Given a string `s`, print the reverse of `s`.\n\n**Example Input:**\n```\nhello\n```\n**Example Output:**\n```\nolleh\n```",
    "constraints": "1 ≤ |s| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "hints": [
      "Think about iterating from the end to the beginning.",
      "You can use built-in functions like reverse() or a simple loop.",
      "Remember to handle strings with spaces if any."
    ],
    "tags": [
      "Strings",
      "Basic"
    ],
    "testcases": {
      "create": [
        {
          "input": "hello\n",
          "output": "olleh\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "abcde\n",
          "output": "edcba\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "a\n",
        "output": "a\n"
      },
      {
        "input": "racecar\n",
        "output": "racecar\n"
      },
      {
        "input": "abcdef\n",
        "output": "fedcba\n"
      },
      {
        "input": "z\n",
        "output": "z\n"
      },
      {
        "input": "CodeArena\n",
        "output": "anerAedoC\n"
      },
      {
        "input": "12345\n",
        "output": "54321\n"
      },
      {
        "input": "aabbcc\n",
        "output": "ccbbaa\n"
      },
      {
        "input": "stressed\n",
        "output": "desserts\n"
      },
      {
        "input": "madam\n",
        "output": "madam\n"
      },
      {
        "input": "openai\n",
        "output": "ianepo\n"
      },
      {
        "input": "xyzzyx\n",
        "output": "xyzzy x\n"
      },
      {
        "input": "noon\n",
        "output": "noon\n"
      },
      {
        "input": " \n",
        "output": " \n"
      },
      {
        "input": "!@#$%^&*()\n",
        "output": ")(*&^%$#@!\n"
      }
    ]
  },
  {
    "title": "Check Even or Odd",
    "description": "Given an integer `n`, print `Even` if it is even, or `Odd` if it is odd.\n\n**Example Input:**\n```\n4\n```\n**Example Output:**\n```\nEven\n```",
    "constraints": "-10^9 ≤ n ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "hints": [
      "Use the modulo operator (%) to check divisibility.",
      "A number is even if n % 2 is zero.",
      "Be careful with negative numbers, but the parity remains the same."
    ],
    "tags": [
      "Basic",
      "Logic"
    ],
    "testcases": {
      "create": [
        {
          "input": "4\n",
          "output": "Even\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "7\n",
          "output": "Odd\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0\n",
        "output": "Even\n"
      },
      {
        "input": "-2\n",
        "output": "Even\n"
      },
      {
        "input": "-3\n",
        "output": "Odd\n"
      },
      {
        "input": "1000000000\n",
        "output": "Even\n"
      },
      {
        "input": "999999999\n",
        "output": "Odd\n"
      },
      {
        "input": "100\n",
        "output": "Even\n"
      },
      {
        "input": "101\n",
        "output": "Odd\n"
      },
      {
        "input": "-10000\n",
        "output": "Even\n"
      },
      {
        "input": "-9999\n",
        "output": "Odd\n"
      },
      {
        "input": "2\n",
        "output": "Even\n"
      },
      {
        "input": "3\n",
        "output": "Odd\n"
      },
      {
        "input": "1\n",
        "output": "Odd\n"
      },
      {
        "input": "2147483647\n",
        "output": "Odd\n"
      },
      {
        "input": "-2147483648\n",
        "output": "Even\n"
      }
    ]
  },
  {
    "title": "FizzBuzz",
    "description": "Given an integer `n`, for each number `i` from 1 to `n` (inclusive):\n- Print `FizzBuzz` if `i` is divisible by both 3 and 5\n- Print `Fizz` if `i` is divisible by 3\n- Print `Buzz` if `i` is divisible by 5\n- Otherwise print `i`\n\nEach on its own line.\n\n**Example Input:**\n```\n5\n```\n**Example Output:**\n```\n1\n2\nFizz\n4\nBuzz\n```",
    "constraints": "1 ≤ n ≤ 10^4",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "hints": [
      "Use a loop from 1 to N.",
      "Check divisibility by 15 first (both 3 and 5).",
      "Use if-else statements to handle the four cases."
    ],
    "tags": [
      "Basic",
      "Logic",
      "Math"
    ],
    "testcases": {
      "create": [
        {
          "input": "5\n",
          "output": "1\n2\nFizz\n4\nBuzz\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "15\n",
          "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\n",
        "output": "1\n"
      },
      {
        "input": "3\n",
        "output": "1\n2\nFizz\n"
      },
      {
        "input": "10\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n"
      },
      {
        "input": "20\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\n"
      },
      {
        "input": "30\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n"
      },
      {
        "input": "6\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n"
      },
      {
        "input": "15\n",
        "output": "[COMPUTED_VALUE]"
      },
      {
        "input": "10\n",
        "output": "[COMPUTED_VALUE]"
      },
      {
        "input": "2\n",
        "output": "1\n2\n"
      },
      {
        "input": "9\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\n"
      },
      {
        "input": "100\n",
        "output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n31\n32\nFizz\n34\nBuzz\nFizz\n37\n38\nFizz\nBuzz\n41\nFizz\n43\n44\nFizzBuzz\n46\n47\nFizz\n49\nBuzz\nFizz\n52\n53\nFizz\nBuzz\n56\nFizz\n58\n59\nFizzBuzz\n61\n62\nFizz\n64\nBuzz\nFizz\n67\n68\nFizz\nBuzz\n71\nFizz\n73\n74\nFizzBuzz\n76\n77\nFizz\n79\nBuzz\nFizz\n82\n83\nFizz\nBuzz\n86\nFizz\n88\n89\nFizzBuzz\n91\n92\nFizz\n94\nBuzz\nFizz\n97\n98\nFizz\nBuzz\n"
      }
    ]
  },
  {
    "title": "Two Sum",
    "description": "Given an array of integers and a target, find the **0-based indices** of the two numbers that add up to the target. You may assume exactly one solution exists.\n\n**Input format:**\nLine 1: space-separated integers (the array)\nLine 2: the target integer\n\n**Example Input:**\n```\n2 7 11 15\n9\n```\n**Example Output:**\n```\n0 1\n```",
    "constraints": "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i], target ≤ 10^9\nExactly one valid answer exists.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "hints": [
      "The brute force O(N^2) solution uses nested loops.",
      "Can you use a Hash Map to find the complement in O(N)?",
      "Store each number's index as you iterate through the array."
    ],
    "tags": [
      "Hash Table",
      "Array",
      "Two Pointers"
    ],
    "testcases": {
      "create": [
        {
          "input": "4\n2 7 11 15\n9\n",
          "output": "0 1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n3 2 4\n6\n",
          "output": "1 2\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "2\n3 3\n6\n",
        "output": "0 1\n"
      },
      {
        "input": "5\n1 2 3 4 5\n9\n",
        "output": "3 4\n"
      },
      {
        "input": "4\n0 4 3 0\n0\n",
        "output": "0 3\n"
      },
      {
        "input": "4\n2 5 5 11\n10\n",
        "output": "1 2\n"
      },
      {
        "input": "4\n-3 4 3 90\n0\n",
        "output": "0 2\n"
      },
      {
        "input": "4\n1 3 4 2\n6\n",
        "output": "2 3\n"
      },
      {
        "input": "4\n10 20 30 40\n50\n",
        "output": "0 3\n"
      },
      {
        "input": "3\n5 75 25\n100\n",
        "output": "1 2\n"
      },
      {
        "input": "5\n-1 -2 -3 -4 -5\n-8\n",
        "output": "2 4\n"
      },
      {
        "input": "4\n1 5 3 8\n11\n",
        "output": "1 3\n"
      },
      {
        "input": "3\n100 200 300\n500\n",
        "output": "1 2\n"
      },
      {
        "input": "4\n7 2 13 11\n9\n",
        "output": "0 1\n"
      }
    ]
  },
  {
    "title": "Binary Search",
    "description": "Given a sorted array of integers and a target, return the **0-based index** of the target. If not found, return `-1`.\n\n**Input format:**\nLine 1: space-separated sorted integers\nLine 2: the target\n\n**Example Input:**\n```\n-1 0 3 5 9 12\n9\n```\n**Example Output:**\n```\n4\n```",
    "constraints": "1 ≤ n ≤ 10^4\nAll integers unique, sorted ascending.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 1500,
    "hints": [
      "Initialize two pointers: low = 0 and high = len(nums)-1.",
      "Calculate mid = (low + high) / 2 and compare nums[mid] with target.",
      "Adjust low or high and repeat until found or pointers cross."
    ],
    "tags": [
      "Binary Search",
      "Array",
      "Searching"
    ],
    "testcases": {
      "create": [
        {
          "input": "6\n-1 0 3 5 9 12\n9\n",
          "output": "4\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "6\n-1 0 3 5 9 12\n2\n",
          "output": "-1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\n1\n1\n",
        "output": "0\n"
      },
      {
        "input": "5\n1 3 5 7 9\n3\n",
        "output": "1\n"
      },
      {
        "input": "5\n1 3 5 7 9\n10\n",
        "output": "-1\n"
      },
      {
        "input": "5\n2 4 6 8 10\n6\n",
        "output": "2\n"
      },
      {
        "input": "5\n-10 -5 0 5 10\n0\n",
        "output": "2\n"
      },
      {
        "input": "5\n-10 -5 0 5 10\n-10\n",
        "output": "0\n"
      },
      {
        "input": "5\n-10 -5 0 5 10\n10\n",
        "output": "4\n"
      },
      {
        "input": "10\n1 2 3 4 5 6 7 8 9 10\n7\n",
        "output": "6\n"
      },
      {
        "input": "1\n5\n5\n",
        "output": "0\n"
      },
      {
        "input": "2\n1 3\n2\n",
        "output": "-1\n"
      },
      {
        "input": "10\n0 1 2 3 4 5 6 7 8 9\n0\n",
        "output": "0\n"
      },
      {
        "input": "10\n0 1 2 3 4 5 6 7 8 9\n9\n",
        "output": "9\n"
      }
    ]
  },
  {
    "title": "Palindrome Number",
    "description": "Given an integer `x`, print `true` if it is a palindrome, otherwise print `false`.\n\nA number is a palindrome if it reads the same forwards and backwards. Negative numbers are **not** palindromes.\n\n**Example Input:**\n```\n121\n```\n**Example Output:**\n```\ntrue\n```",
    "constraints": "-2^31 ≤ x ≤ 2^31 - 1",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "121\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "-121\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0\n",
        "output": "true\n"
      },
      {
        "input": "10\n",
        "output": "false\n"
      },
      {
        "input": "1001\n",
        "output": "true\n"
      },
      {
        "input": "12321\n",
        "output": "true\n"
      },
      {
        "input": "12345\n",
        "output": "false\n"
      },
      {
        "input": "1221\n",
        "output": "true\n"
      },
      {
        "input": "-1\n",
        "output": "false\n"
      },
      {
        "input": "9\n",
        "output": "true\n"
      },
      {
        "input": "11\n",
        "output": "true\n"
      },
      {
        "input": "100\n",
        "output": "false\n"
      },
      {
        "input": "1000021\n",
        "output": "false\n"
      },
      {
        "input": "999\n",
        "output": "true\n"
      },
      {
        "input": "2147483647\n",
        "output": "false\n"
      },
      {
        "input": "1000000001\n",
        "output": "true\n"
      },
      {
        "input": "1234567899\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Longest Common Prefix",
    "description": "Given `n` words on separate lines, find the **longest common prefix** shared by all words. If there is no common prefix, print an empty line.\n\n**Input format:**\nLine 1: n (number of words)\nNext n lines: one word each\n\n**Example Input:**\n```\n3\nflower\nflow\nflight\n```\n**Example Output:**\n```\nfl\n```",
    "constraints": "1 ≤ n ≤ 200\n0 ≤ word length ≤ 200\nAll lowercase English letters.",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\nflower\nflow\nflight\n",
          "output": "fl\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\ndog\nracecar\ncar\n",
          "output": "\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\nhello\n",
        "output": "hello\n"
      },
      {
        "input": "2\nabc\nabc\n",
        "output": "abc\n"
      },
      {
        "input": "4\ninter\ninterview\ninteract\ninter\n",
        "output": "inter\n"
      },
      {
        "input": "3\nabc\ndef\nghi\n",
        "output": "\n"
      },
      {
        "input": "2\na\nab\n",
        "output": "a\n"
      },
      {
        "input": "3\nprefix\npre\npre-order\n",
        "output": "pre\n"
      },
      {
        "input": "5\ncat\ncar\ncab\ncafe\ncap\n",
        "output": "ca\n"
      },
      {
        "input": "3\naa\na\n\n",
        "output": "\n"
      },
      {
        "input": "2\nflower\nflow\n",
        "output": "flow\n"
      },
      {
        "input": "3\ntest\ntesting\ntested\n",
        "output": "test\n"
      },
      {
        "input": "4\nreflect\nreflection\nreflex\nreflate\n",
        "output": "refl\n"
      },
      {
        "input": "2\nzoo\nzoom\n",
        "output": "zoo\n"
      }
    ]
  },
  {
    "title": "Palindrome String",
    "description": "Given a string `s`, print `true` if it is a palindrome, otherwise print `false`.\n      \nA palindrome reads the same forwards and backwards (case-sensitive).",
    "constraints": "1 ≤ |s| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "racecar\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "hello\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "a\n",
        "output": "true\n"
      },
      {
        "input": "ab\n",
        "output": "false\n"
      },
      {
        "input": "aba\n",
        "output": "true\n"
      },
      {
        "input": "racecar\n",
        "output": "true\n"
      },
      {
        "input": "Aba\n",
        "output": "false\n"
      },
      {
        "input": "121\n",
        "output": "true\n"
      },
      {
        "input": "12321\n",
        "output": "true\n"
      },
      {
        "input": "noon\n",
        "output": "true\n"
      },
      {
        "input": "level\n",
        "output": "true\n"
      },
      {
        "input": "step on no pets\n",
        "output": "true\n"
      },
      {
        "input": "not a palindrome\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Factorial of a Number",
    "description": "Given a non-negative integer `n`, calculate its factorial.\n      \nFactorial of `n` (n!) is the product of all positive integers less than or equal to `n`. 0! = 1.",
    "constraints": "0 ≤ n ≤ 20",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n",
          "output": "120\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\n",
        "output": "1\n"
      },
      {
        "input": "2\n",
        "output": "2\n"
      },
      {
        "input": "3\n",
        "output": "6\n"
      },
      {
        "input": "4\n",
        "output": "24\n"
      },
      {
        "input": "10\n",
        "output": "3628800\n"
      },
      {
        "input": "12\n",
        "output": "479001600\n"
      },
      {
        "input": "15\n",
        "output": "1307674368000\n"
      },
      {
        "input": "20\n",
        "output": "2432902008176640000\n"
      }
    ]
  },
  {
    "title": "Fibonacci Number",
    "description": "Given an integer `n`, find the `n`-th Fibonacci number.\n      \nThe Fibonacci sequence starts with 0 and 1: 0, 1, 1, 2, 3, 5, 8, 13, ...",
    "constraints": "0 ≤ n ≤ 45",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "6\n",
          "output": "8\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\n",
        "output": "1\n"
      },
      {
        "input": "2\n",
        "output": "1\n"
      },
      {
        "input": "3\n",
        "output": "2\n"
      },
      {
        "input": "4\n",
        "output": "3\n"
      },
      {
        "input": "5\n",
        "output": "5\n"
      },
      {
        "input": "10\n",
        "output": "55\n"
      },
      {
        "input": "20\n",
        "output": "6765\n"
      },
      {
        "input": "30\n",
        "output": "832040\n"
      },
      {
        "input": "40\n",
        "output": "102334155\n"
      },
      {
        "input": "45\n",
        "output": "1134903170\n"
      }
    ]
  },
  {
    "title": "Find Maximum in Array",
    "description": "Given `n` integers on a single line, find the maximum value.\n      \n**Input format:**\nLine 1: space-separated integers",
    "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n1 5 3 9 2\n",
          "output": "9\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n-10 -20 -30\n",
          "output": "-10\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5\n10 20 30 40 50\n",
        "output": "50\n"
      },
      {
        "input": "5\n5 4 3 2 1\n",
        "output": "5\n"
      },
      {
        "input": "1\n100\n",
        "output": "100\n"
      },
      {
        "input": "5\n-1 -2 -3 -4 -5\n",
        "output": "-1\n"
      },
      {
        "input": "3\n0 0 0\n",
        "output": "0\n"
      },
      {
        "input": "3\n1000000000 -1000000000 0\n",
        "output": "1000000000\n"
      },
      {
        "input": "6\n1 2 3 10 5 6\n",
        "output": "10\n"
      }
    ]
  },
  {
    "title": "Find Minimum in Array",
    "description": "Given `n` integers on a single line, find the minimum value.\n      \n**Input format:**\nLine 1: space-separated integers",
    "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n1 5 3 9 2\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n-10 -20 -30\n",
          "output": "-30\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5\n10 20 30 40 50\n",
        "output": "10\n"
      },
      {
        "input": "5\n5 4 3 2 1\n",
        "output": "1\n"
      },
      {
        "input": "1\n100\n",
        "output": "100\n"
      },
      {
        "input": "5\n-1 -2 -3 -4 -5\n",
        "output": "-5\n"
      },
      {
        "input": "3\n0 0 0\n",
        "output": "0\n"
      },
      {
        "input": "3\n1000000000 -1000000000 0\n",
        "output": "-1000000000\n"
      },
      {
        "input": "6\n1 2 3 -10 5 6\n",
        "output": "-10\n"
      }
    ]
  },
  {
    "title": "Count Vowels in String",
    "description": "Given a string `s`, count the number of vowels (a, e, i, o, u) in it. The check should be case-insensitive.",
    "constraints": "1 ≤ |s| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "hello\n",
          "output": "2\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "AEIOU\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "a\n",
        "output": "1\n"
      },
      {
        "input": "b\n",
        "output": "0\n"
      },
      {
        "input": "aeiou\n",
        "output": "5\n"
      },
      {
        "input": "AEIOU\n",
        "output": "5\n"
      },
      {
        "input": "hello world\n",
        "output": "3\n"
      },
      {
        "input": "programming is fun\n",
        "output": "4\n"
      },
      {
        "input": "bcdfg\n",
        "output": "0\n"
      },
      {
        "input": "12345\n",
        "output": "0\n"
      },
      {
        "input": " \n",
        "output": "0\n"
      }
    ]
  },
  {
    "title": "Check Prime Number",
    "description": "Given an integer `n`, print `true` if it is prime, otherwise print `false`.",
    "constraints": "-10^9 ≤ n ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "7\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "4\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "2\n",
        "output": "true\n"
      },
      {
        "input": "3\n",
        "output": "true\n"
      },
      {
        "input": "4\n",
        "output": "false\n"
      },
      {
        "input": "5\n",
        "output": "true\n"
      },
      {
        "input": "10\n",
        "output": "false\n"
      },
      {
        "input": "13\n",
        "output": "true\n"
      },
      {
        "input": "17\n",
        "output": "true\n"
      },
      {
        "input": "19\n",
        "output": "true\n"
      },
      {
        "input": "23\n",
        "output": "true\n"
      },
      {
        "input": "100\n",
        "output": "false\n"
      },
      {
        "input": "97\n",
        "output": "true\n"
      },
      {
        "input": "1\n",
        "output": "false\n"
      },
      {
        "input": "0\n",
        "output": "false\n"
      },
      {
        "input": "-5\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Sum of Digits",
    "description": "Given a non-negative integer `n`, print the sum of its digits.",
    "constraints": "0 ≤ n ≤ 10^18",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "123\n",
          "output": "6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "10\n",
        "output": "1\n"
      },
      {
        "input": "99\n",
        "output": "18\n"
      },
      {
        "input": "100\n",
        "output": "1\n"
      },
      {
        "input": "12345\n",
        "output": "15\n"
      },
      {
        "input": "0\n",
        "output": "0\n"
      },
      {
        "input": "111111111111111111\n",
        "output": "18\n"
      },
      {
        "input": "9876543210\n",
        "output": "45\n"
      }
    ]
  },
  {
    "title": "Calculate Power (a^b)",
    "description": "Given two integers `a` and `b`, print the result of `a` raised to the power `b` (`a^b`).",
    "constraints": "0 ≤ a, b ≤ 15",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "2 3\n",
          "output": "8\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "5 0\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "2 0\n",
        "output": "1\n"
      },
      {
        "input": "2 1\n",
        "output": "2\n"
      },
      {
        "input": "2 10\n",
        "output": "1024\n"
      },
      {
        "input": "3 3\n",
        "output": "27\n"
      },
      {
        "input": "10 5\n",
        "output": "100000\n"
      },
      {
        "input": "0 5\n",
        "output": "0\n"
      },
      {
        "input": "1 15\n",
        "output": "1\n"
      },
      {
        "input": "15 2\n",
        "output": "225\n"
      }
    ]
  },
  {
    "title": "Find Second Largest in Array",
    "description": "Given `n` unique integers on a single line, find the second largest value.",
    "constraints": "2 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n1 5 3 9 2\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n-10 -20 0\n",
          "output": "-10\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5\n10 20 30 40 50\n",
        "output": "40\n"
      },
      {
        "input": "5\n5 4 3 2 1\n",
        "output": "4\n"
      },
      {
        "input": "2\n100 -100\n",
        "output": "-100\n"
      },
      {
        "input": "3\n1 2 3\n",
        "output": "2\n"
      },
      {
        "input": "4\n-5 -10 -1 0\n",
        "output": "-1\n"
      },
      {
        "input": "10\n10 9 8 7 6 5 4 3 2 1\n",
        "output": "9\n"
      }
    ]
  },
  {
    "title": "Array Rotation (Left)",
    "description": "Given `n` integers and a value `d`, rotate the array to the left by `d` positions.\n      \n**Input format:**\nLine 1: n d\nLine 2: n space-separated integers",
    "constraints": "1 ≤ n ≤ 10^5\n0 ≤ d ≤ n\n-10^9 ≤ elements ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5 2\n1 2 3 4 5\n",
          "output": "3 4 5 1 2\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3 0\n10 20 30\n",
          "output": "10 20 30\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3 1\n1 2 3\n",
        "output": "2 3 1\n"
      },
      {
        "input": "3 2\n1 2 3\n",
        "output": "3 1 2\n"
      },
      {
        "input": "3 3\n1 2 3\n",
        "output": "1 2 3\n"
      },
      {
        "input": "5 0\n10 20 30 40 50\n",
        "output": "10 20 30 40 50\n"
      },
      {
        "input": "1 0\n42\n",
        "output": "42\n"
      },
      {
        "input": "4 4\n1 2 3 4\n",
        "output": "1 2 3 4\n"
      }
    ]
  },
  {
    "title": "Remove Duplicates from Sorted Array",
    "description": "Given a sorted array of `n` integers, print the unique elements in the same order.",
    "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9 (Sorted)",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n1 1 2 2 3\n",
          "output": "1 2 3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n5 5 5\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5\n1 2 3 4 5\n",
        "output": "1 2 3 4 5\n"
      },
      {
        "input": "5\n1 1 1 1 1\n",
        "output": "1\n"
      },
      {
        "input": "6\n1 1 2 2 3 3\n",
        "output": "1 2 3\n"
      },
      {
        "input": "5\n-10 -10 0 10 10\n",
        "output": "-10 0 10\n"
      },
      {
        "input": "7\n1 2 2 3 4 4 5\n",
        "output": "1 2 3 4 5\n"
      }
    ]
  },
  {
    "title": "Binary to Decimal Conversion",
    "description": "Given a binary string `s`, print its decimal (base-10) equivalent.",
    "constraints": "1 ≤ |s| ≤ 60",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "1010\n",
          "output": "10\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "111\n",
          "output": "7\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0\n",
        "output": "0\n"
      },
      {
        "input": "1\n",
        "output": "1\n"
      },
      {
        "input": "10\n",
        "output": "2\n"
      },
      {
        "input": "11\n",
        "output": "3\n"
      },
      {
        "input": "100\n",
        "output": "4\n"
      },
      {
        "input": "1111\n",
        "output": "15\n"
      },
      {
        "input": "11111111\n",
        "output": "255\n"
      },
      {
        "input": "10101010\n",
        "output": "170\n"
      },
      {
        "input": "1000000000000000000000000000000\n",
        "output": "1073741824\n"
      }
    ]
  },
  {
    "title": "Decimal to Binary Conversion",
    "description": "Given a non-negative integer `n`, print its binary (base-2) equivalent string.",
    "constraints": "0 ≤ n ≤ 10^18",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "10\n",
          "output": "1010\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0\n",
        "output": "0\n"
      },
      {
        "input": "1\n",
        "output": "1\n"
      },
      {
        "input": "2\n",
        "output": "10\n"
      },
      {
        "input": "3\n",
        "output": "11\n"
      },
      {
        "input": "4\n",
        "output": "100\n"
      },
      {
        "input": "15\n",
        "output": "1111\n"
      },
      {
        "input": "255\n",
        "output": "11111111\n"
      },
      {
        "input": "170\n",
        "output": "10101010\n"
      },
      {
        "input": "1073741824\n",
        "output": "1000000000000000000000000000000\n"
      }
    ]
  },
  {
    "title": "Check Anagram",
    "description": "Given two strings `s1` and `s2` on separate lines, print `true` if they are anagrams, otherwise `false`.\n      \nTwo strings are anagrams if they contain the same characters with the same frequencies.",
    "constraints": "1 ≤ |s1|, |s2| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "listen\nsilent\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "rat\ncar\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "a\na\n",
        "output": "true\n"
      },
      {
        "input": "a\nb\n",
        "output": "false\n"
      },
      {
        "input": "abc\ncba\n",
        "output": "true\n"
      },
      {
        "input": "anagram\nnagaram\n",
        "output": "true\n"
      },
      {
        "input": "hello\nworld\n",
        "output": "false\n"
      },
      {
        "input": "aabbcc\naabbcc\n",
        "output": "true\n"
      },
      {
        "input": "aabbcc\nabccba\n",
        "output": "true\n"
      },
      {
        "input": "abc\nab\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Find GCD of Two Numbers",
    "description": "Given two integers `a` and `b` on a single line, find their Greatest Common Divisor (GCD).",
    "constraints": "1 ≤ a, b ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "12 18\n",
          "output": "6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "13 17\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "10 5\n",
        "output": "5\n"
      },
      {
        "input": "10 10\n",
        "output": "10\n"
      },
      {
        "input": "1 100\n",
        "output": "1\n"
      },
      {
        "input": "48 18\n",
        "output": "6\n"
      },
      {
        "input": "101 103\n",
        "output": "1\n"
      },
      {
        "input": "1000000000 500000000\n",
        "output": "500000000\n"
      }
    ]
  },
  {
    "title": "Find LCM of Two Numbers",
    "description": "Given two integers `a` and `b` on a single line, find their Least Common Multiple (LCM).",
    "constraints": "1 ≤ a, b ≤ 10^6",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "12 18\n",
          "output": "36\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "5 7\n",
          "output": "35\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "10 5\n",
        "output": "10\n"
      },
      {
        "input": "10 10\n",
        "output": "10\n"
      },
      {
        "input": "1 100\n",
        "output": "100\n"
      },
      {
        "input": "4 6\n",
        "output": "12\n"
      },
      {
        "input": "15 20\n",
        "output": "60\n"
      },
      {
        "input": "1000 1000\n",
        "output": "1000\n"
      }
    ]
  },
  {
    "title": "Count Occurrences of a Character",
    "description": "Given a string `s` on line 1 and a character `c` on line 2, count how many times `c` appears in `s`.",
    "constraints": "1 ≤ |s| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "hello world\nl\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "aaaaa\nb\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "abcabcabc\na\n",
        "output": "3\n"
      },
      {
        "input": "aaaaa\na\n",
        "output": "5\n"
      },
      {
        "input": "abc\nz\n",
        "output": "0\n"
      },
      {
        "input": "AaAaA\na\n",
        "output": "2\n"
      },
      {
        "input": " \n \n",
        "output": "1\n"
      }
    ]
  },
  {
    "title": "Capitalize First Letter",
    "description": "Given a string `s`, capitalize the first letter of each word. Words are separated by a single space.",
    "constraints": "1 ≤ |s| ≤ 10^5",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "hello world\n",
          "output": "Hello World\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "code arena is great\n",
          "output": "Challengx Is Great\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "a b c\n",
        "output": "A B C\n"
      },
      {
        "input": "  hello  world  \n",
        "output": "  Hello  World  \n"
      },
      {
        "input": "lowercase\n",
        "output": "Lowercase\n"
      },
      {
        "input": "UPPERCASE\n",
        "output": "UPPERCASE\n"
      },
      {
        "input": "123 numbers\n",
        "output": "123 Numbers\n"
      }
    ]
  },
  {
    "title": "Check if Array is Sorted",
    "description": "Given `n` integers on a single line, print `true` if the array is sorted in non-decreasing order, otherwise `false`.",
    "constraints": "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5\n1 2 3 4 5\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "5\n1 3 2 4 5\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1\n1\n",
        "output": "true\n"
      },
      {
        "input": "4\n1 1 1 1\n",
        "output": "true\n"
      },
      {
        "input": "5\n5 4 3 2 1\n",
        "output": "false\n"
      },
      {
        "input": "3\n-10 0 10\n",
        "output": "true\n"
      },
      {
        "input": "4\n1 2 2 3\n",
        "output": "true\n"
      },
      {
        "input": "5\n1 2 3 2 4\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Length of Longest Substring",
    "description": "Given a string `s`, find the length of the **longest substring** without repeating characters.",
    "constraints": "0 ≤ |s| ≤ 5 * 10^4\n`s` consists of English letters, digits, symbols and spaces.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "abcabcbb\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "bbbbb\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "pwwkew\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "abcabcbb\n",
        "output": "3\n"
      },
      {
        "input": "bbbbb\n",
        "output": "1\n"
      },
      {
        "input": "pwwkew\n",
        "output": "3\n"
      },
      {
        "input": "\n",
        "output": "0\n"
      },
      {
        "input": " \n",
        "output": "1\n"
      },
      {
        "input": "au\n",
        "output": "2\n"
      },
      {
        "input": "dvdf\n",
        "output": "3\n"
      },
      {
        "input": "abcdefghijklmnopqrstuvwxyz\n",
        "output": "26\n"
      }
    ]
  },
  {
    "title": "Container With Most Water",
    "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n      \nFind two lines that together with the x-axis form a container, such that the container contains the most water. Return the **maximum amount of water** a container can store.",
    "constraints": "n == height.length\n2 ≤ n ≤ 10^5\n0 ≤ height[i] ≤ 10^4",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "9\n1 8 6 2 5 4 8 3 7\n",
          "output": "49\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "2\n1 1\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "9\n1 8 6 2 5 4 8 3 7\n",
        "output": "49\n"
      },
      {
        "input": "2\n1 1\n",
        "output": "1\n"
      },
      {
        "input": "5\n4 3 2 1 4\n",
        "output": "16\n"
      },
      {
        "input": "3\n1 2 1\n",
        "output": "2\n"
      },
      {
        "input": "10\n1 2 3 4 5 6 7 8 9 10\n",
        "output": "25\n"
      }
    ]
  },
  {
    "title": "3Sum",
    "description": "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n      \nThe solution set must not contain duplicate triplets. Print each triplet on a new line, sorted internally and externally.",
    "constraints": "3 ≤ nums.length ≤ 3000\n-10^5 ≤ nums[i] ≤ 10^5",
    "difficulty": "MEDIUM",
    "timeLimitMs": 3000,
    "testcases": {
      "create": [
        {
          "input": "6\n-1 0 1 2 -1 -4\n",
          "output": "-1 -1 2\n-1 0 1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n0 1 1\n",
          "output": "\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n0 0 0\n",
          "output": "0 0 0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "6\n-1 0 1 2 -1 -4\n",
        "output": "-1 -1 2\n-1 0 1\n"
      },
      {
        "input": "3\n0 1 1\n",
        "output": "\n"
      },
      {
        "input": "3\n0 0 0\n",
        "output": "0 0 0\n"
      },
      {
        "input": "5\n-2 0 1 1 2\n",
        "output": "-2 0 2\n-2 1 1\n"
      },
      {
        "input": "4\n0 0 0 0\n",
        "output": "0 0 0\n"
      }
    ]
  },
  {
    "title": "Group Anagrams",
    "description": "Given an array of strings `strs`, group the **anagrams** together. You can return the answer in any order.\n      \nPrint each group on a new line, elements sorted within each line.",
    "constraints": "1 ≤ strs.length ≤ 10^4\n0 ≤ strs[i].length ≤ 100\n`strs[i]` consists of lowercase English letters.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "6\neat tea tan ate nat bat\n",
          "output": "ate eat tea\nnat tan\nbat\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n\n",
          "output": "\n\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\na\n",
          "output": "a\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "6\neat tea tan ate nat bat\n",
        "output": "ate eat tea\nnat tan\nbat\n"
      },
      {
        "input": "0\n\n",
        "output": "\n\n"
      },
      {
        "input": "1\na\n",
        "output": "a\n"
      },
      {
        "input": "6\nabc cba bca dog god rat\n",
        "output": "abc bca cba\ndog god\nrat\n"
      }
    ]
  },
  {
    "title": "Merge Intervals",
    "description": "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and print the merged intervals.\n      \n**Input format:**\nLine 1: space-separated integers in pairs: s1 e1 s2 e2 ...",
    "constraints": "1 ≤ intervals.length ≤ 10^4\n0 ≤ start_i ≤ end_i ≤ 10^4",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "4\n1 3 2 6 8 10 15 18\n",
          "output": "1 6 8 10 15 18\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "2\n1 4 4 5\n",
          "output": "1 5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "4\n1 3 2 6 8 10 15 18\n",
        "output": "1 6 8 10 15 18\n"
      },
      {
        "input": "2\n1 4 4 5\n",
        "output": "1 5\n"
      },
      {
        "input": "5\n1 10 2 3 4 5 6 7 8 9\n",
        "output": "1 10\n"
      },
      {
        "input": "2\n1 5 6 10\n",
        "output": "1 5 6 10\n"
      },
      {
        "input": "3\n1 4 0 2 3 5\n",
        "output": "0 5\n"
      }
    ]
  },
  {
    "title": "Rotate Image",
    "description": "You are given an `n x n` 2D matrix representing an image, rotate the image by **90 degrees (clockwise)**.\n      \n**Input format:**\nLine 1: n\nLine 2 to n+1: space-separated integers for each row.",
    "constraints": "n == matrix.length == matrix[i].length\n1 ≤ n ≤ 20\n-1000 ≤ matrix[i][j] ≤ 1000",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\n1 2 3\n4 5 6\n7 8 9\n",
          "output": "7 4 1\n8 5 2\n9 6 3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "2\n1 2\n3 4\n",
          "output": "3 1\n4 2\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n1 2 3\n4 5 6\n7 8 9\n",
        "output": "7 4 1\n8 5 2\n9 6 3\n"
      },
      {
        "input": "2\n1 2\n3 4\n",
        "output": "3 1\n4 2\n"
      },
      {
        "input": "1\n5\n",
        "output": "5\n"
      },
      {
        "input": "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16\n",
        "output": "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4\n"
      }
    ]
  },
  {
    "title": "Spiral Matrix",
    "description": "Given an `m x n` matrix, return all elements of the matrix in **spiral order**.\n      \n**Input format:**\nLine 1: m n\nLine 2 to m+1: space-separated integers for each row.",
    "constraints": "m == matrix.length\nn == matrix[i].length\n1 ≤ m, n ≤ 10\n-100 ≤ matrix[i][j] ≤ 100",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3 3\n1 2 3\n4 5 6\n7 8 9\n",
          "output": "1 2 3 6 9 8 7 4 5\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n",
          "output": "1 2 3 4 8 12 11 10 9 5 6 7\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3 3\n1 2 3\n4 5 6\n7 8 9\n",
        "output": "1 2 3 6 9 8 7 4 5\n"
      },
      {
        "input": "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n",
        "output": "1 2 3 4 8 12 11 10 9 5 6 7\n"
      },
      {
        "input": "1 1\n42\n",
        "output": "42\n"
      },
      {
        "input": "2 2\n1 2\n3 4\n",
        "output": "1 2 4 3\n"
      }
    ]
  },
  {
    "title": "Subsets",
    "description": "Given an integer array `nums` of unique elements, return all possible **subsets** (the power set).\n      \nThe solution set must not contain duplicate subsets. Print each subset on a new line, elements sorted within each line, and subsets sorted lexicographically.",
    "constraints": "1 ≤ nums.length ≤ 10\n-10 ≤ nums[i] ≤ 10\nAll elements are unique.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\n1 2 3\n",
          "output": "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\n0\n",
          "output": "\n0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n1 2 3\n",
        "output": "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3\n"
      },
      {
        "input": "1\n0\n",
        "output": "\n0\n"
      },
      {
        "input": "2\n1 10\n",
        "output": "\n1\n1 10\n10\n"
      }
    ]
  },
  {
    "title": "Permutations",
    "description": "Given an array `nums` of distinct integers, return all the possible **permutations**. You can return the answer in any order.\n      \nPrint each permutation on a new line, sorted lexicographically.",
    "constraints": "1 ≤ nums.length ≤ 6\n-10 ≤ nums[i] ≤ 10\nAll elements are unique.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\n1 2 3\n",
          "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "2\n0 1\n",
          "output": "0 1\n1 0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n1 2 3\n",
        "output": "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1\n"
      },
      {
        "input": "2\n0 1\n",
        "output": "0 1\n1 0\n"
      },
      {
        "input": "1\n1\n",
        "output": "1\n"
      }
    ]
  },
  {
    "title": "Lowest Common Ancestor",
    "description": "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes, `p` and `q`.\n      \nAccording to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in T that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).”\n      \n**Input format:**\nLine 1: Tree elements in level-order (use 'null' for empty children)\nLine 2: Value of node p\nLine 3: Value of node q",
    "constraints": "The number of nodes in the tree is in the range [2, 10^5].\n-10^9 ≤ Node.val ≤ 10^9\nAll Node.val are unique.\np != q\np and q exist in the tree.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3 5 1 6 2 0 8 null null 7 4\n5\n1\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3 5 1 6 2 0 8 null null 7 4\n5\n4\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n1\n",
        "output": "3\n"
      },
      {
        "input": "3 5 1 6 2 0 8 null null 7 4\n5\n4\n",
        "output": "5\n"
      },
      {
        "input": "1 2\n1\n2\n",
        "output": "1\n"
      },
      {
        "input": "2 1 null\n2\n1\n",
        "output": "2\n"
      }
    ]
  },
  {
    "title": "Kth Largest Element",
    "description": "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n      \nNote that it is the `k`th largest element in the sorted order, not the `k`th distinct element.\n      \n**Input format:**\nLine 1: k\nLine 2: space-separated integers",
    "constraints": "1 ≤ k ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "6 2\n3 2 1 5 6 4\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "9 4\n3 2 3 1 2 4 5 5 6\n",
          "output": "4\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "6 2\n3 2 1 5 6 4\n",
        "output": "5\n"
      },
      {
        "input": "9 4\n3 2 3 1 2 4 5 5 6\n",
        "output": "4\n"
      },
      {
        "input": "3 1\n10 20 30\n",
        "output": "30\n"
      },
      {
        "input": "5 3\n-1 -5 0 10 5\n",
        "output": "0\n"
      },
      {
        "input": "6 2\n1 1 1 2 2 2\n",
        "output": "2\n"
      }
    ]
  },
  {
    "title": "Top K Frequent Elements",
    "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in **any order**.\n      \nPrint the elements space-separated, sorted ascending.",
    "constraints": "1 ≤ nums.length ≤ 10^5\nk is in the range [1, the number of unique elements in the array].\nIt is guaranteed that the answer is unique.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "6 2\n1 1 1 2 2 3\n",
          "output": "1 2\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1 1\n1\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "6 2\n1 1 1 2 2 3\n",
        "output": "1 2\n"
      },
      {
        "input": "1 1\n1\n",
        "output": "1\n"
      },
      {
        "input": "11 3\n1 1 1 2 2 2 3 3 3 4 5\n",
        "output": "1 2 3\n"
      },
      {
        "input": "5 2\n10 10 20 20 30\n",
        "output": "10 20\n"
      }
    ]
  },
  {
    "title": "Search in Rotated Sorted Array",
    "description": "There is an integer array `nums` sorted in ascending order (with distinct values).\n      \nPrior to being passed to your function, `nums` is **possibly rotated** at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (0-indexed).\n      \nGiven the array `nums` **after** the rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n      \n**Input format:**\nLine 1: target\nLine 2: space-separated integers",
    "constraints": "1 ≤ nums.length ≤ 5000\n-10^4 ≤ nums[i] ≤ 10^4\nAll values of `nums` are unique.\n`nums` is an ascending array that is possibly rotated.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "7 0\n4 5 6 7 0 1 2\n",
          "output": "4\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "7 3\n4 5 6 7 0 1 2\n",
          "output": "-1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "7 0\n4 5 6 7 0 1 2\n",
        "output": "4\n"
      },
      {
        "input": "7 3\n4 5 6 7 0 1 2\n",
        "output": "-1\n"
      },
      {
        "input": "1 1\n1\n",
        "output": "0\n"
      },
      {
        "input": "1 0\n1\n",
        "output": "-1\n"
      },
      {
        "input": "2 1\n3 1\n",
        "output": "1\n"
      },
      {
        "input": "2 3\n1 3\n",
        "output": "1\n"
      }
    ]
  },
  {
    "title": "Coin Change",
    "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n      \nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.\n      \n**Input format:**\nLine 1: amount\nLine 2: space-separated integers (denominations)",
    "constraints": "1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31 - 1\n0 ≤ amount ≤ 10^4",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3 11\n1 2 5\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1 3\n2\n",
          "output": "-1\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1 0\n1\n",
          "output": "0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3 11\n1 2 5\n",
        "output": "3\n"
      },
      {
        "input": "1 3\n2\n",
        "output": "-1\n"
      },
      {
        "input": "1 0\n1\n",
        "output": "0\n"
      },
      {
        "input": "4 6249\n186 419 83 408\n",
        "output": "20\n"
      },
      {
        "input": "4 100\n1 5 10 25\n",
        "output": "4\n"
      }
    ]
  },
  {
    "title": "Longest Palindromic Substring",
    "description": "Given a string `s`, return the **longest palindromic substring** in `s`.",
    "constraints": "1 ≤ |s| ≤ 1000\n`s` consist of only digits and English letters.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "babad\n",
          "output": "bab\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "cbbd\n",
          "output": "bb\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "babad\n",
        "output": "bab\n"
      },
      {
        "input": "cbbd\n",
        "output": "bb\n"
      },
      {
        "input": "a\n",
        "output": "a\n"
      },
      {
        "input": "ac\n",
        "output": "a\n"
      },
      {
        "input": "racecar\n",
        "output": "racecar\n"
      },
      {
        "input": "aaaaa\n",
        "output": "aaaaa\n"
      }
    ]
  },
  {
    "title": "Valid Sudoku",
    "description": "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:\n      \n1. Each row must contain the digits 1-9 without repetition.\n2. Each column must contain the digits 1-9 without repetition.\n3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.\n      \n**Input format:**\n9 lines, each with 9 space-separated characters (1-9 or '.').",
    "constraints": "board.length == 9\nboard[i].length == 9\n`board[i][j]` is a digit 1-9 or '.'.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
        "output": "true\n"
      },
      {
        "input": "8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Generate Parentheses",
    "description": "Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n      \nPrint each combination on a new line, sorted lexicographically.",
    "constraints": "1 ≤ n ≤ 8",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\n",
          "output": "((()))\n(()())\n(())()\n()(())\n()()()\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\n",
          "output": "()\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n",
        "output": "((()))\n(()())\n(())()\n()(())\n()()()\n"
      },
      {
        "input": "1\n",
        "output": "()\n"
      },
      {
        "input": "2\n",
        "output": "(())\n()()\n"
      }
    ]
  },
  {
    "title": "Product of Array Except Self",
    "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n      \nThe algorithm must run in **O(n)** time and **without** using the division operation.\n      \n**Input format:**\nLine 1: space-separated integers",
    "constraints": "2 ≤ nums.length ≤ 10^5\n-30 ≤ nums[i] ≤ 30\nThe product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "4\n1 2 3 4\n",
          "output": "24 12 8 6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "5\n-1 1 0 -3 3\n",
          "output": "0 0 9 0 0\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "4\n1 2 3 4\n",
        "output": "24 12 8 6\n"
      },
      {
        "input": "5\n-1 1 0 -3 3\n",
        "output": "0 0 9 0 0\n"
      },
      {
        "input": "2\n1 1\n",
        "output": "1 1\n"
      },
      {
        "input": "2\n0 0\n",
        "output": "0 0\n"
      },
      {
        "input": "5\n1 2 0 4 0\n",
        "output": "0 0 0 0 0\n"
      }
    ]
  },
  {
    "title": "Sort Colors",
    "description": "Given an array `nums` with `n` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n      \nWe will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.\n      \n**Input format:**\nLine 1: space-separated integers (0s, 1s, and 2s)",
    "constraints": "n == nums.length\n1 ≤ n ≤ 300\n`nums[i]` is either 0, 1, or 2.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "6\n2 0 2 1 1 0\n",
          "output": "0 0 1 1 2 2\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "3\n2 0 1\n",
          "output": "0 1 2\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "6\n2 0 2 1 1 0\n",
        "output": "0 0 1 1 2 2\n"
      },
      {
        "input": "3\n2 0 1\n",
        "output": "0 1 2\n"
      },
      {
        "input": "1\n0\n",
        "output": "0\n"
      },
      {
        "input": "1\n1\n",
        "output": "1\n"
      },
      {
        "input": "1\n2\n",
        "output": "2\n"
      },
      {
        "input": "5\n1 0 2 1 0\n",
        "output": "0 0 1 1 2\n"
      }
    ]
  },
  {
    "title": "Find All Anagrams in a String",
    "description": "Given two strings `s` and `p`, return an array of all the start indices of `p`'s anagrams in `s`. You may return the answer in **any order**.\n      \nPrint the indices space-separated, sorted ascending.\n      \n**Input format:**\nLine 1: s\nLine 2: p",
    "constraints": "1 ≤ |s|, |p| ≤ 3 * 10^4\n`s` and `p` consist of lowercase English letters.",
    "difficulty": "MEDIUM",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "cbaebabacd\nabc\n",
          "output": "0 6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "abab\nab\n",
          "output": "0 1 2\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "cbaebabacd\nabc\n",
        "output": "0 6\n"
      },
      {
        "input": "abab\nab\n",
        "output": "0 1 2\n"
      },
      {
        "input": "aaaaa\na\n",
        "output": "0 1 2 3 4\n"
      },
      {
        "input": "af\nbe\n",
        "output": "\n"
      }
    ]
  },
  {
    "title": "Median of Two Sorted Arrays",
    "description": "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the **median** of the two sorted arrays.\n      \nThe overall run time complexity should be **O(log (m+n))**.\n      \n**Input format:**\nLine 1: space-separated integers (nums1)\nLine 2: space-separated integers (nums2)",
    "constraints": "m == nums1.length\nn == nums2.length\n0 ≤ m ≤ 1000\n0 ≤ n ≤ 1000\n1 ≤ m + n ≤ 2000\n-10^6 ≤ nums1[i], nums2[i] ≤ 10^6",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "1 3\n2\n",
          "output": "2.0\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1 2\n3 4\n",
          "output": "2.5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "1 3\n2\n",
        "output": "2.0\n"
      },
      {
        "input": "1 2\n3 4\n",
        "output": "2.5\n"
      },
      {
        "input": "0 0\n0 0\n",
        "output": "0.0\n"
      },
      {
        "input": "\n1\n",
        "output": "1.0\n"
      },
      {
        "input": "2\n\n",
        "output": "2.0\n"
      },
      {
        "input": "100 200 300\n1 2 3\n",
        "output": "51.5\n"
      }
    ]
  },
  {
    "title": "Regular Expression Matching",
    "description": "Given an input string `s` and a pattern `p`, implement regular expression matching with support for '.' and '*' where:\n      \n- '.' Matches any single character.\n- '*' Matches zero or more of the preceding element.\n      \nThe matching should cover the **entire** input string (not partial).\n      \n**Input format:**\nLine 1: s\nLine 2: p",
    "constraints": "1 ≤ s.length ≤ 20\n1 ≤ p.length ≤ 30\n`s` contains only lowercase English letters.\n`p` contains only lowercase English letters, '.', and '*'.\nIt is guaranteed for each appearance of the character '*', there will be a previous valid character to match.",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "aa\na\n",
          "output": "false\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "aa\na*\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "ab\n.*\n",
          "output": "true\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "aa\na\n",
        "output": "false\n"
      },
      {
        "input": "aa\na*\n",
        "output": "true\n"
      },
      {
        "input": "ab\n.*\n",
        "output": "true\n"
      },
      {
        "input": "aab\nc*a*b\n",
        "output": "true\n"
      },
      {
        "input": "mississippi\nmis*is*p*.\n",
        "output": "false\n"
      }
    ]
  },
  {
    "title": "Merge K Sorted Lists",
    "description": "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n      \nMerge all the linked-lists into one sorted linked-list and return it.\n      \n**Input format:**\nLine 1: k\nNext k lines: space-separated integers for each sorted list.",
    "constraints": "k == lists.length\n0 ≤ k ≤ 10^4\n0 ≤ lists[i].length ≤ 500\n-10^4 ≤ lists[i][j] ≤ 10^4\n`lists[i]` is sorted in ascending order.\nThe sum of `lists[i].length` will not exceed 10^4.",
    "difficulty": "HARD",
    "timeLimitMs": 3000,
    "testcases": {
      "create": [
        {
          "input": "3\n1 4 5\n1 3 4\n2 6\n",
          "output": "1 1 2 3 4 4 5 6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "0\n",
          "output": "\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\n\n",
          "output": "\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n1 4 5\n1 3 4\n2 6\n",
        "output": "1 1 2 3 4 4 5 6\n"
      },
      {
        "input": "0\n",
        "output": "\n"
      },
      {
        "input": "1\n\n",
        "output": "\n"
      },
      {
        "input": "2\n1 2 3\n4 5 6\n",
        "output": "1 2 3 4 5 6\n"
      }
    ]
  },
  {
    "title": "Trapping Rain Water",
    "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n      \n**Input format:**\nLine 1: space-separated integers",
    "constraints": "n == height.length\n1 ≤ n ≤ 2 * 10^4\n0 ≤ height[i] ≤ 10^5",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "0 1 0 2 1 0 1 3 2 1 2 1\n",
          "output": "6\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "4 2 0 3 2 5\n",
          "output": "9\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "0 1 0 2 1 0 1 3 2 1 2 1\n",
        "output": "6\n"
      },
      {
        "input": "4 2 0 3 2 5\n",
        "output": "9\n"
      },
      {
        "input": "1 1 1\n",
        "output": "0\n"
      },
      {
        "input": "5 4 3 2 1\n",
        "output": "0\n"
      },
      {
        "input": "2 0 2\n",
        "output": "2\n"
      }
    ]
  },
  {
    "title": "Edit Distance",
    "description": "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n      \nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character\n      \n**Input format:**\nLine 1: word1\nLine 2: word2",
    "constraints": "0 ≤ word1.length, word2.length ≤ 500\n`word1` and `word2` consist of lowercase English letters.",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "horse\nros\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "intention\nexecution\n",
          "output": "5\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "horse\nros\n",
        "output": "3\n"
      },
      {
        "input": "intention\nexecution\n",
        "output": "5\n"
      },
      {
        "input": "abc\n",
        "output": "3\n"
      },
      {
        "input": "\nabc\n",
        "output": "3\n"
      },
      {
        "input": "sea\neat\n",
        "output": "2\n"
      }
    ]
  },
  {
    "title": "Word Search II",
    "description": "Given an `m x n` board of characters and a list of strings `words`, return all words on the board.\n      \nEach word must be constructed from letters of sequentially adjacent cells, where **adjacent** cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.\n      \n**Input format:**\nLine 1: m n\nNext m lines: n characters separated by space\nNext line: space-separated words",
    "constraints": "m == board.length\nn == board[i].length\n1 ≤ m, n ≤ 12\nboard[i][j] is a lowercase English letter.\n1 ≤ words.length ≤ 10^4\n1 ≤ words[i].length ≤ 10\nwords[i] consists of lowercase English letters.\nAll strings in words are unique.",
    "difficulty": "HARD",
    "timeLimitMs": 4000,
    "testcases": {
      "create": [
        {
          "input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain\n",
          "output": "eat oath\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "2 2\na b\nc d\nabcb\n",
          "output": "\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain\n",
        "output": "eat oath\n"
      },
      {
        "input": "2 2\na b\nc d\nabcb\n",
        "output": "\n"
      },
      {
        "input": "3 3\na a a\na a a\na a a\na\n",
        "output": "a\n"
      }
    ]
  },
  {
    "title": "Sliding Window Maximum",
    "description": "You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.\n      \nReturn the **max** sliding window.\n      \n**Input format:**\nLine 1: k\nLine 2: space-separated integers",
    "constraints": "1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4\n1 ≤ k ≤ nums.length",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "8 3\n1 3 -1 -3 5 3 6 7\n",
          "output": "3 3 5 5 6 7\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1 1\n1\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "8 3\n1 3 -1 -3 5 3 6 7\n",
        "output": "3 3 5 5 6 7\n"
      },
      {
        "input": "1 1\n1\n",
        "output": "1\n"
      },
      {
        "input": "5 2\n1 2 3 4 5\n",
        "output": "2 3 4 5\n"
      },
      {
        "input": "6 4\n10 5 2 7 8 7\n",
        "output": "10 7 8 8\n"
      }
    ]
  },
  {
    "title": "First Missing Positive",
    "description": "Given an unsorted integer array `nums`, return the smallest missing positive integer.\n      \nYou must implement an algorithm that runs in **O(n)** time and uses **O(1)** auxiliary space.\n      \n**Input format:**\nLine 1: space-separated integers",
    "constraints": "1 ≤ nums.length ≤ 10^5\n-2^31 ≤ nums[i] ≤ 2^31 - 1",
    "difficulty": "HARD",
    "timeLimitMs": 2000,
    "testcases": {
      "create": [
        {
          "input": "3\n1 2 0\n",
          "output": "3\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "4\n3 4 -1 1\n",
          "output": "2\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "5\n7 8 9 11 12\n",
          "output": "1\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "3\n1 2 0\n",
        "output": "3\n"
      },
      {
        "input": "4\n3 4 -1 1\n",
        "output": "2\n"
      },
      {
        "input": "5\n7 8 9 11 12\n",
        "output": "1\n"
      },
      {
        "input": "1\n1\n",
        "output": "2\n"
      },
      {
        "input": "1\n2\n",
        "output": "1\n"
      },
      {
        "input": "5\n1 2 3 4 5\n",
        "output": "6\n"
      }
    ]
  },
  {
    "title": "Sudoku Solver",
    "description": "Write a program to solve a Sudoku puzzle by filling the empty cells.\n      \nA sudoku solution must satisfy all of the following rules:\n1. Each of the digits 1-9 must occur exactly once in each row.\n2. Each of the digits 1-9 must occur exactly once in each column.\n3. Each of the digits 1-9 must occur exactly once in each of the nine 3 x 3 sub-boxes of the grid.\n      \nThe '.' character indicates empty cells.\n      \n**Input format:**\n9 lines, each with 9 space-separated characters (1-9 or '.').\n      \n**Output format:**\n9 lines, each with 9 space-separated digits.",
    "constraints": "board.length == 9\nboard[i].length == 9\n`board[i][j]` is a digit 1-9 or '.'.\nIt is guaranteed that the input board has only one solution.",
    "difficulty": "HARD",
    "timeLimitMs": 5000,
    "testcases": {
      "create": [
        {
          "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
          "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n",
        "output": "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n"
      }
    ]
  },
  {
    "title": "N-Queens",
    "description": "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n      \nGiven an integer `n`, return all distinct solutions to the **n-queens puzzle**. You may return the answer in any order.\n      \nEach solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.\n      \n**Input format:**\nLine 1: n\n      \n**Output format:**\nEach solution separated by a blank line. For each solution, print `n` lines with `n` characters.",
    "constraints": "1 ≤ n ≤ 9",
    "difficulty": "HARD",
    "timeLimitMs": 5000,
    "testcases": {
      "create": [
        {
          "input": "4\n",
          "output": ". Q . .\n. . . Q\nQ . . .\n. . Q .\n\n. . Q .\nQ . . .\n. . . Q\n. Q . .\n",
          "isHidden": false,
          "isSample": true
        },
        {
          "input": "1\n",
          "output": "Q\n",
          "isHidden": false,
          "isSample": true
        }
      ]
    },
    "hiddenCases": [
      {
        "input": "4\n",
        "output": ". Q . .\n. . . Q\nQ . . .\n. . Q .\n\n. . Q .\nQ . . .\n. . . Q\n. Q . .\n"
      },
      {
        "input": "1\n",
        "output": "Q\n"
      },
      {
        "input": "2\n",
        "output": "\n"
      },
      {
        "input": "3\n",
        "output": "\n"
      }
    ]
  }
];