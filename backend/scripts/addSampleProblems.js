// Sample script to add problems via API
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const sampleProblems = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    difficulty: "EASY",
    timeLimitMs: 2000,
    testcases: [
      {
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        isHidden: false
      },
      {
        input: "[3,2,4]\n6",
        output: "[1,2]",
        isHidden: true
      },
      {
        input: "[3,3]\n6",
        output: "[0,1]",
        isHidden: true
      }
    ]
  },
  {
    title: "Binary Search",
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

**Example 1:**
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4

**Example 2:**
Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1

**Constraints:**
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- All the integers in nums are unique.
- nums is sorted in ascending order.`,
    difficulty: "MEDIUM",
    timeLimitMs: 1500,
    testcases: [
      {
        input: "[-1,0,3,5,9,12]\n9",
        output: "4",
        isHidden: false
      },
      {
        input: "[-1,0,3,5,9,12]\n2",
        output: "-1",
        isHidden: true
      }
    ]
  },
  {
    title: "Merge K Sorted Lists",
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

**Example 1:**
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6

**Example 2:**
Input: lists = []
Output: []

**Example 3:**
Input: lists = [[]]
Output: []

**Constraints:**
- k == lists.length
- 0 <= k <= 10^4
- 0 <= lists[i].length <= 500
- -10^4 <= lists[i][j] <= 10^4
- lists[i] is sorted in ascending order
- The sum of lists[i].length will not exceed 10^4.`,
    difficulty: "HARD",
    timeLimitMs: 3000,
    testcases: [
      {
        input: "[[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
        isHidden: false
      },
      {
        input: "[]",
        output: "[]",
        isHidden: true
      }
    ]
  }
];

async function addProblems() {
  try {
    for (const problem of sampleProblems) {
      // Create problem
      const problemResponse = await axios.post(`${API_BASE}/problem/create`, {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        timeLimitMs: problem.timeLimitMs
      });
      
      const problemId = problemResponse.data.problem.id;
      console.log(`✅ Created problem: ${problem.title} (ID: ${problemId})`);
      
      // Add test cases
      await axios.post(`${API_BASE}/testcase/add/${problemId}`, {
        testcases: problem.testcases
      });
      
      console.log(`✅ Added ${problem.testcases.length} test cases for ${problem.title}`);
    }
    
    console.log('🎉 All sample problems added successfully!');
  } catch (error) {
    console.error('❌ Error adding problems:', error.response?.data || error.message);
  }
}

addProblems();
