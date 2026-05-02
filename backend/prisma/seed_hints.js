
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const problemMetadata = {
  "Add Two Numbers": {
    hints: [
      "Read both numbers from the input.",
      "Add them using the + operator.",
      "Use BigInt if you're in a language that might overflow, though 10^9 fits in a standard integer."
    ],
    tags: ["Basic", "Math"]
  },
  "Reverse a String": {
    hints: [
      "Think about iterating from the end to the beginning.",
      "You can use built-in functions like reverse() or a simple loop.",
      "Remember to handle strings with spaces if any."
    ],
    tags: ["Strings", "Basic"]
  },
  "Check Even or Odd": {
    hints: [
      "Use the modulo operator (%) to check divisibility.",
      "A number is even if n % 2 is zero.",
      "Be careful with negative numbers, but the parity remains the same."
    ],
    tags: ["Basic", "Logic"]
  },
  "FizzBuzz": {
    hints: [
      "Use a loop from 1 to N.",
      "Check divisibility by 15 first (both 3 and 5).",
      "Use if-else statements to handle the four cases."
    ],
    tags: ["Basic", "Logic", "Math"]
  },
  "Two Sum": {
    hints: [
      "The brute force O(N^2) solution uses nested loops.",
      "Can you use a Hash Map to find the complement in O(N)?",
      "Store each number's index as you iterate through the array."
    ],
    tags: ["Hash Table", "Array", "Two Pointers"]
  },
  "Binary Search": {
    hints: [
      "Initialize two pointers: low = 0 and high = len(nums)-1.",
      "Calculate mid = (low + high) / 2 and compare nums[mid] with target.",
      "Adjust low or high and repeat until found or pointers cross."
    ],
    tags: ["Binary Search", "Array", "Searching"]
  },
  "Palindrome Number": {
    hints: [
      "Negative numbers cannot be palindromes.",
      "Try reversing the integer digit by digit.",
      "Compare the reversed number with the original."
    ],
    tags: ["Math", "Logic"]
  },
  "Longest Common Prefix": {
    hints: [
      "Take the first string as the initial common prefix.",
      "Iteratively compare it with the next strings.",
      "Shorten the prefix until it matches the start of the current string."
    ],
    tags: ["Strings", "Basic"]
  },
  "Palindrome String": {
    hints: [
      "Use two pointers, one at the start and one at the end.",
      "Move towards the middle, comparing characters.",
      "It's a palindrome if all corresponding characters match."
    ],
    tags: ["Strings", "Two Pointers"]
  },
  "Factorial of a Number": {
    hints: [
      "Factorial of n is n * (n-1) * ... * 1.",
      "You can use a loop or recursion.",
      "Special case: 0! is 1."
    ],
    tags: ["Math", "Recursion"]
  },
  "Fibonacci Number": {
    hints: [
      "The sequence is 0, 1, 1, 2, 3, 5, 8, 13...",
      "Use a loop to calculate F(n) = F(n-1) + F(n-2).",
      "Keep track of the last two values to save space."
    ],
    tags: ["Math", "Dynamic Programming"]
  },
  "Find Maximum in Array": {
    hints: [
      "Initialize a variable max_val with the first element.",
      "Iterate through the array and update max_val if a larger number is found.",
      "Return max_val at the end."
    ],
    tags: ["Array", "Basic"]
  },
  "Find Minimum in Array": {
    hints: [
      "Initialize min_val with the first element or a very large value.",
      "Compare each element with min_val using a loop.",
      "Update min_val whenever a smaller element is encountered."
    ],
    tags: ["Array", "Basic"]
  },
  "Count Vowels in String": {
    hints: [
      "Convert the string to lowercase first.",
      "Iterate through the characters and check if they are in 'aeiou'.",
      "Increment a counter for each match."
    ],
    tags: ["Strings", "Basic"]
  },
  "Check Prime Number": {
    hints: [
      "A prime number is only divisible by 1 and itself.",
      "Check divisors from 2 up to sqrt(n).",
      "Handle edge cases: numbers < 2 are not prime."
    ],
    tags: ["Math", "Logic"]
  },
  "Sum of Digits": {
    hints: [
      "Use n % 10 to get the last digit.",
      "Use n = Math.floor(n / 10) to remove the last digit.",
      "Repeat until n is 0 and sum the digits."
    ],
    tags: ["Math", "Basic"]
  }
};

async function main() {
  console.log("🌱 Seeding hints and tags...");

  for (const [title, metadata] of Object.entries(problemMetadata)) {
    console.log(`Updating: ${title}`);

    await prisma.problem.updateMany({
      where: { title },
      data: {
        hints: metadata.hints
      }
    });

    // Handle tags separately as it's a relation
    const problem = await prisma.problem.findFirst({ where: { title } });
    if (problem) {
      await prisma.problem.update({
        where: { id: problem.id },
        data: {
          tags: {
            connectOrCreate: metadata.tags.map(tagName => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          }
        }
      });
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
