/**
 * seed_s3_testcases.js
 *
 * Uploads hard-coded hidden test cases for each problem directly to Cloudflare R2.
 * Run AFTER `npx prisma db seed` so problems exist in the DB.
 *
 * Usage: npm run seed:s3
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import S3Service from "../src/services/s3.service.js";

const prisma = new PrismaClient();

// ─── Hidden test cases per problem ──────────────────────────────────────────
// Keys must EXACTLY match the titles in prisma/seed.js
const HIDDEN_CASES = {
    "Sum of Two Numbers": [
        { input: "0 0\n", output: "0\n" },
        { input: "1000 2000\n", output: "3000\n" },
        { input: "-500 500\n", output: "0\n" },
        { input: "999999999 1\n", output: "1000000000\n" },
        { input: "-1000000000 -1\n", output: "-1000000001\n" },
        { input: "123 456\n", output: "579\n" },
        { input: "-200 -300\n", output: "-500\n" },
        { input: "1 -1\n", output: "0\n" },
        { input: "42 58\n", output: "100\n" },
        { input: "0 -1\n", output: "-1\n" },
        { input: "777 333\n", output: "1110\n" },
        { input: "-999 999\n", output: "0\n" },
    ],

    "Reverse a String": [
        { input: "a\n", output: "a\n" },
        { input: "racecar\n", output: "racecar\n" },
        { input: "abcdef\n", output: "fedcba\n" },
        { input: "z\n", output: "z\n" },
        { input: "CodeArena\n", output: "anerAedoC\n" },
        { input: "12345\n", output: "54321\n" },
        { input: "aabbcc\n", output: "ccbbaa\n" },
        { input: "stressed\n", output: "desserts\n" },
        { input: "madam\n", output: "madam\n" },
        { input: "openai\n", output: "ianepo\n" },
        { input: "xyzzyx\n", output: "xyzzy x\n".trim() + "\n" },
        { input: "noon\n", output: "noon\n" },
    ],

    "Check Even or Odd": [
        { input: "0\n", output: "Even\n" },
        { input: "-2\n", output: "Even\n" },
        { input: "-3\n", output: "Odd\n" },
        { input: "1000000000\n", output: "Even\n" },
        { input: "999999999\n", output: "Odd\n" },
        { input: "100\n", output: "Even\n" },
        { input: "101\n", output: "Odd\n" },
        { input: "-10000\n", output: "Even\n" },
        { input: "-9999\n", output: "Odd\n" },
        { input: "2\n", output: "Even\n" },
        { input: "3\n", output: "Odd\n" },
        { input: "1\n", output: "Odd\n" },
    ],

    "FizzBuzz": [
        { input: "1\n", output: "1\n" },
        { input: "3\n", output: "1\n2\nFizz\n" },
        { input: "10\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n" },
        { input: "20\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\n" },
        { input: "30\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n" },
        { input: "6\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n" },
        { input: "15\n", output: Array.from({ length: 15 }, (_, i) => { const n = i + 1; if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return String(n); }).join("\n") + "\n" },
        { input: "10\n", output: Array.from({ length: 10 }, (_, i) => { const n = i + 1; if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return String(n); }).join("\n") + "\n" },
        { input: "2\n", output: "1\n2\n" },
        { input: "9\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\n" },
    ],

    "Two Sum": [
        { input: "3 3\n6\n", output: "0 1\n" },
        { input: "1 2 3 4 5\n9\n", output: "3 4\n" },
        { input: "0 4 3 0\n0\n", output: "0 3\n" },
        { input: "2 5 5 11\n10\n", output: "1 2\n" },
        { input: "-3 4 3 90\n0\n", output: "0 2\n" },
        { input: "1 3 4 2\n6\n", output: "2 3\n" },
        { input: "10 20 30 40\n50\n", output: "0 3\n" },
        { input: "5 75 25\n100\n", output: "1 2\n" },
        { input: "-1 -2 -3 -4 -5\n-8\n", output: "2 4\n" },
        { input: "1 5 3 8\n11\n", output: "1 3\n" },
        { input: "100 200 300\n500\n", output: "1 2\n" },
        { input: "7 2 13 11\n9\n", output: "0 1\n" },
    ],

    "Binary Search": [
        { input: "1\n1\n", output: "0\n" },
        { input: "1 3 5 7 9\n3\n", output: "1\n" },
        { input: "1 3 5 7 9\n10\n", output: "-1\n" },
        { input: "2 4 6 8 10\n6\n", output: "2\n" },
        { input: "-10 -5 0 5 10\n0\n", output: "2\n" },
        { input: "-10 -5 0 5 10\n-10\n", output: "0\n" },
        { input: "-10 -5 0 5 10\n10\n", output: "4\n" },
        { input: "1 2 3 4 5 6 7 8 9 10\n7\n", output: "6\n" },
        { input: "5\n5\n", output: "0\n" },
        { input: "1 3\n2\n", output: "-1\n" },
        { input: "0 1 2 3 4 5 6 7 8 9\n0\n", output: "0\n" },
        { input: "0 1 2 3 4 5 6 7 8 9\n9\n", output: "9\n" },
    ],

    "Palindrome Number": [
        { input: "0\n", output: "true\n" },
        { input: "10\n", output: "false\n" },
        { input: "1001\n", output: "true\n" },
        { input: "12321\n", output: "true\n" },
        { input: "12345\n", output: "false\n" },
        { input: "1221\n", output: "true\n" },
        { input: "-1\n", output: "false\n" },
        { input: "9\n", output: "true\n" },
        { input: "11\n", output: "true\n" },
        { input: "100\n", output: "false\n" },
        { input: "1000021\n", output: "false\n" },
        { input: "999\n", output: "true\n" },
        { input: "2147483647\n", output: "false\n" },
    ],

    "Longest Common Prefix": [
        { input: "1\nhello\n", output: "hello\n" },
        { input: "2\nabc\nabc\n", output: "abc\n" },
        { input: "4\ninter\ninterview\ninteract\ninter\n", output: "inter\n" },
        { input: "3\nabc\ndef\nghi\n", output: "\n" },
        { input: "2\na\nab\n", output: "a\n" },
        { input: "3\nprefix\npre\npre-order\n", output: "pre\n" },
        { input: "5\ncat\ncar\ncab\ncafe\ncap\n", output: "ca\n" },
        { input: "3\naa\na\n\n", output: "\n" },
        { input: "2\nflower\nflow\n", output: "flow\n" },
        { input: "3\ntest\ntesting\ntested\n", output: "test\n" },
        { input: "4\nreflect\nreflection\nreflex\nreflate\n", output: "refl\n" },
        { input: "2\nzoo\nzoom\n", output: "zoo\n" },
    ],

    "Palindrome String": [
        { input: "a\n", output: "true\n" },
        { input: "ab\n", output: "false\n" },
        { input: "aba\n", output: "true\n" },
        { input: "racecar\n", output: "true\n" },
        { input: "Aba\n", output: "false\n" },
        { input: "121\n", output: "true\n" },
        { input: "12321\n", output: "true\n" },
        { input: "noon\n", output: "true\n" },
        { input: "level\n", output: "true\n" },
        { input: "step on no pets\n", output: "true\n" },
        { input: "not a palindrome\n", output: "false\n" },
    ],

    "Factorial of a Number": [
        { input: "1\n", output: "1\n" },
        { input: "2\n", output: "2\n" },
        { input: "3\n", output: "6\n" },
        { input: "4\n", output: "24\n" },
        { input: "10\n", output: "3628800\n" },
        { input: "12\n", output: "479001600\n" },
        { input: "15\n", output: "1307674368000\n" },
        { input: "20\n", output: "2432902008176640000\n" },
    ],

    "Fibonacci Number": [
        { input: "1\n", output: "1\n" },
        { input: "2\n", output: "1\n" },
        { input: "3\n", output: "2\n" },
        { input: "4\n", output: "3\n" },
        { input: "5\n", output: "5\n" },
        { input: "10\n", output: "55\n" },
        { input: "20\n", output: "6765\n" },
        { input: "30\n", output: "832040\n" },
        { input: "40\n", output: "102334155\n" },
        { input: "45\n", output: "1134903170\n" },
    ],

    "Find Maximum in Array": [
        { input: "10 20 30 40 50\n", output: "50\n" },
        { input: "5 4 3 2 1\n", output: "5\n" },
        { input: "100\n", output: "100\n" },
        { input: "-1 -2 -3 -4 -5\n", output: "-1\n" },
        { input: "0 0 0\n", output: "0\n" },
        { input: "1000000000 -1000000000 0\n", output: "1000000000\n" },
        { input: "1 2 3 10 5 6\n", output: "10\n" },
    ],

    "Find Minimum in Array": [
        { input: "10 20 30 40 50\n", output: "10\n" },
        { input: "5 4 3 2 1\n", output: "1\n" },
        { input: "100\n", output: "100\n" },
        { input: "-1 -2 -3 -4 -5\n", output: "-5\n" },
        { input: "0 0 0\n", output: "0\n" },
        { input: "1000000000 -1000000000 0\n", output: "-1000000000\n" },
        { input: "1 2 3 -10 5 6\n", output: "-10\n" },
    ],

    "Count Vowels in String": [
        { input: "a\n", output: "1\n" },
        { input: "b\n", output: "0\n" },
        { input: "aeiou\n", output: "5\n" },
        { input: "AEIOU\n", output: "5\n" },
        { input: "hello world\n", output: "3\n" },
        { input: "programming is fun\n", output: "4\n" },
        { input: "bcdfg\n", output: "0\n" },
        { input: "12345\n", output: "0\n" },
        { input: " \n", output: "0\n" },
    ],

    "Check Prime Number": [
        { input: "2\n", output: "true\n" },
        { input: "3\n", output: "true\n" },
        { input: "4\n", output: "false\n" },
        { input: "5\n", output: "true\n" },
        { input: "10\n", output: "false\n" },
        { input: "13\n", output: "true\n" },
        { input: "17\n", output: "true\n" },
        { input: "19\n", output: "true\n" },
        { input: "23\n", output: "true\n" },
        { input: "100\n", output: "false\n" },
        { input: "97\n", output: "true\n" },
        { input: "1\n", output: "false\n" },
        { input: "0\n", output: "false\n" },
        { input: "-5\n", output: "false\n" },
    ],

    "Sum of Digits": [
        { input: "10\n", output: "1\n" },
        { input: "99\n", output: "18\n" },
        { input: "100\n", output: "1\n" },
        { input: "12345\n", output: "15\n" },
        { input: "0\n", output: "0\n" },
        { input: "111111111111111111\n", output: "18\n" },
        { input: "9876543210\n", output: "45\n" },
    ],

    "Calculate Power (a^b)": [
        { input: "2 0\n", output: "1\n" },
        { input: "2 1\n", output: "2\n" },
        { input: "2 10\n", output: "1024\n" },
        { input: "3 3\n", output: "27\n" },
        { input: "10 5\n", output: "100000\n" },
        { input: "0 5\n", output: "0\n" },
        { input: "1 15\n", output: "1\n" },
        { input: "15 2\n", output: "225\n" },
    ],

    "Find Second Largest in Array": [
        { input: "10 20 30 40 50\n", output: "40\n" },
        { input: "5 4 3 2 1\n", output: "4\n" },
        { input: "100 -100\n", output: "-100\n" },
        { input: "1 2 3\n", output: "2\n" },
        { input: "-5 -10 -1 0\n", output: "-1\n" },
        { input: "10 9 8 7 6 5 4 3 2 1\n", output: "9\n" },
    ],

    "Array Rotation (Left)": [
        { input: "3 1\n1 2 3\n", output: "2 3 1\n" },
        { input: "3 2\n1 2 3\n", output: "3 1 2\n" },
        { input: "3 3\n1 2 3\n", output: "1 2 3\n" },
        { input: "5 0\n10 20 30 40 50\n", output: "10 20 30 40 50\n" },
        { input: "1 0\n42\n", output: "42\n" },
        { input: "4 4\n1 2 3 4\n", output: "1 2 3 4\n" },
    ],

    "Remove Duplicates from Sorted Array": [
        { input: "1 2 3 4 5\n", output: "1 2 3 4 5\n" },
        { input: "1 1 1 1 1\n", output: "1\n" },
        { input: "1 1 2 2 3 3\n", output: "1 2 3\n" },
        { input: "-10 -10 0 10 10\n", output: "-10 0 10\n" },
        { input: "1 2 2 3 4 4 5\n", output: "1 2 3 4 5\n" },
    ],

    "Binary to Decimal Conversion": [
        { input: "0\n", output: "0\n" },
        { input: "1\n", output: "1\n" },
        { input: "10\n", output: "2\n" },
        { input: "11\n", output: "3\n" },
        { input: "100\n", output: "4\n" },
        { input: "1111\n", output: "15\n" },
        { input: "11111111\n", output: "255\n" },
        { input: "10101010\n", output: "170\n" },
        { input: "1000000000000000000000000000000\n", output: "1073741824\n" },
    ],

    "Decimal to Binary Conversion": [
        { input: "0\n", output: "0\n" },
        { input: "1\n", output: "1\n" },
        { input: "2\n", output: "10\n" },
        { input: "3\n", output: "11\n" },
        { input: "4\n", output: "100\n" },
        { input: "15\n", output: "1111\n" },
        { input: "255\n", output: "11111111\n" },
        { input: "170\n", output: "10101010\n" },
        { input: "1073741824\n", output: "1000000000000000000000000000000\n" },
    ],

    "Check Anagram": [
        { input: "a\na\n", output: "true\n" },
        { input: "a\nb\n", output: "false\n" },
        { input: "abc\ncba\n", output: "true\n" },
        { input: "anagram\nnagaram\n", output: "true\n" },
        { input: "hello\nworld\n", output: "false\n" },
        { input: "aabbcc\naabbcc\n", output: "true\n" },
        { input: "aabbcc\nabccba\n", output: "true\n" },
        { input: "abc\nab\n", output: "false\n" },
    ],

    "Find GCD of Two Numbers": [
        { input: "10 5\n", output: "5\n" },
        { input: "10 10\n", output: "10\n" },
        { input: "1 100\n", output: "1\n" },
        { input: "48 18\n", output: "6\n" },
        { input: "101 103\n", output: "1\n" },
        { input: "1000000000 500000000\n", output: "500000000\n" },
    ],

    "Find LCM of Two Numbers": [
        { input: "10 5\n", output: "10\n" },
        { input: "10 10\n", output: "10\n" },
        { input: "1 100\n", output: "100\n" },
        { input: "4 6\n", output: "12\n" },
        { input: "15 20\n", output: "60\n" },
        { input: "1000 1000\n", output: "1000\n" },
    ],

    "Count Occurrences of a Character": [
        { input: "abcabcabc\na\n", output: "3\n" },
        { input: "aaaaa\na\n", output: "5\n" },
        { input: "abc\nz\n", output: "0\n" },
        { input: "AaAaA\na\n", output: "2\n" },
        { input: " \n \n", output: "1\n" },
    ],

    "Capitalize First Letter": [
        { input: "a b c\n", output: "A B C\n" },
        { input: "  hello  world  \n", output: "  Hello  World  \n" },
        { input: "lowercase\n", output: "Lowercase\n" },
        { input: "UPPERCASE\n", output: "UPPERCASE\n" },
        { input: "123 numbers\n", output: "123 Numbers\n" },
    ],

    "Check if Array is Sorted": [
        { input: "1\n", output: "true\n" },
        { input: "1 1 1 1\n", output: "true\n" },
        { input: "5 4 3 2 1\n", output: "false\n" },
        { input: "-10 0 10\n", output: "true\n" },
        { input: "1 2 2 3\n", output: "true\n" },
        { input: "1 2 3 2 4\n", output: "false\n" },
    ],

    "Length of Longest Substring": [
        { input: "abcabcbb\n", output: "3\n" },
        { input: "bbbbb\n", output: "1\n" },
        { input: "pwwkew\n", output: "3\n" },
        { input: "\n", output: "0\n" },
        { input: " \n", output: "1\n" },
        { input: "au\n", output: "2\n" },
        { input: "dvdf\n", output: "3\n" },
        { input: "abcdefghijklmnopqrstuvwxyz\n", output: "26\n" },
    ],

    "Container With Most Water": [
        { input: "1 8 6 2 5 4 8 3 7\n", output: "49\n" },
        { input: "1 1\n", output: "1\n" },
        { input: "4 3 2 1 4\n", output: "16\n" },
        { input: "1 2 1\n", output: "2\n" },
        { input: "1 2 3 4 5 6 7 8 9 10\n", output: "25\n" },
    ],

    "3Sum": [
        { input: "-1 0 1 2 -1 -4\n", output: "-1 -1 2\n-1 0 1\n" },
        { input: "0 1 1\n", output: "\n" },
        { input: "0 0 0\n", output: "0 0 0\n" },
        { input: "-2 0 1 1 2\n", output: "-2 0 2\n-2 1 1\n" },
        { input: "0 0 0 0\n", output: "0 0 0\n" },
    ],

    "Group Anagrams": [
        { input: "eat tea tan ate nat bat\n", output: "ate eat tea\nnat tan\nbat\n" },
        { input: "\n", output: "\n\n" },
        { input: "a\n", output: "a\n" },
        { input: "abc cba bca dog god rat\n", output: "abc bca cba\ndog god\nrat\n" },
    ],

    "Merge Intervals": [
        { input: "1 3 2 6 8 10 15 18\n", output: "1 6 8 10 15 18\n" },
        { input: "1 4 4 5\n", output: "1 5\n" },
        { input: "1 10 2 3 4 5 6 7 8 9\n", output: "1 10\n" },
        { input: "1 5 6 10\n", output: "1 5 6 10\n" },
        { input: "1 4 0 2 3 5\n", output: "0 5\n" },
    ],

    "Rotate Image": [
        { input: "3\n1 2 3\n4 5 6\n7 8 9\n", output: "7 4 1\n8 5 2\n9 6 3\n" },
        { input: "2\n1 2\n3 4\n", output: "3 1\n4 2\n" },
        { input: "1\n5\n", output: "5\n" },
        { input: "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16\n", output: "13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4\n" },
    ],

    "Spiral Matrix": [
        { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n", output: "1 2 3 6 9 8 7 4 5\n" },
        { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n", output: "1 2 3 4 8 12 11 10 9 5 6 7\n" },
        { input: "1 1\n42\n", output: "42\n" },
        { input: "2 2\n1 2\n3 4\n", output: "1 2 4 3\n" },
    ],

    "Subsets": [
        { input: "1 2 3\n", output: "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3\n" },
        { input: "0\n", output: "\n0\n" },
        { input: "1 10\n", output: "\n1\n1 10\n10\n" },
    ],

    "Permutations": [
        { input: "1 2 3\n", output: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1\n" },
        { input: "0 1\n", output: "0 1\n1 0\n" },
        { input: "1\n", output: "1\n" },
    ],

    "Lowest Common Ancestor": [
        { input: "3 5 1 6 2 0 8 null null 7 4\n5\n1\n", output: "3\n" },
        { input: "3 5 1 6 2 0 8 null null 7 4\n5\n4\n", output: "5\n" },
        { input: "1 2\n1\n2\n", output: "1\n" },
        { input: "2 1 null\n2\n1\n", output: "2\n" },
    ],

    "Kth Largest Element": [
        { input: "2\n3 2 1 5 6 4\n", output: "5\n" },
        { input: "4\n3 2 3 1 2 4 5 5 6\n", output: "4\n" },
        { input: "1\n10 20 30\n", output: "30\n" },
        { input: "3\n-1 -5 0 10 5\n", output: "0\n" },
        { input: "2\n1 1 1 2 2 2\n", output: "2\n" },
    ],

    "Top K Frequent Elements": [
        { input: "2\n1 1 1 2 2 3\n", output: "1 2\n" },
        { input: "1\n1\n", output: "1\n" },
        { input: "3\n1 1 1 2 2 2 3 3 3 4 5\n", output: "1 2 3\n" },
        { input: "2\n10 10 20 20 30\n", output: "10 20\n" },
    ],

    "Search in Rotated Sorted Array": [
        { input: "0\n4 5 6 7 0 1 2\n", output: "4\n" },
        { input: "3\n4 5 6 7 0 1 2\n", output: "-1\n" },
        { input: "1\n1\n", output: "0\n" },
        { input: "0\n1\n", output: "-1\n" },
        { input: "1\n3 1\n", output: "1\n" },
        { input: "3\n1 3\n", output: "1\n" },
    ],

    "Coin Change": [
        { input: "11\n1 2 5\n", output: "3\n" },
        { input: "3\n2\n", output: "-1\n" },
        { input: "0\n1\n", output: "0\n" },
        { input: "6249\n186 419 83 408\n", output: "20\n" },
        { input: "100\n1 5 10 25\n", output: "4\n" },
    ],

    "Longest Palindromic Substring": [
        { input: "babad\n", output: "bab\n" },
        { input: "cbbd\n", output: "bb\n" },
        { input: "a\n", output: "a\n" },
        { input: "ac\n", output: "a\n" },
        { input: "racecar\n", output: "racecar\n" },
        { input: "aaaaa\n", output: "aaaaa\n" },
    ],

    "Valid Sudoku": [
        { input: "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "true\n" },
        { input: "8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "false\n" },
    ],

    "Generate Parentheses": [
        { input: "3\n", output: "((()))\n(()())\n(())()\n()(())\n()()()\n" },
        { input: "1\n", output: "()\n" },
        { input: "2\n", output: "(())\n()()\n" },
    ],

    "Product of Array Except Self": [
        { input: "1 2 3 4\n", output: "24 12 8 6\n" },
        { input: "-1 1 0 -3 3\n", output: "0 0 9 0 0\n" },
        { input: "1 1\n", output: "1 1\n" },
        { input: "0 0\n", output: "0 0\n" },
        { input: "1 2 0 4 0\n", output: "0 0 0 0 0\n" },
    ],

    "Sort Colors": [
        { input: "2 0 2 1 1 0\n", output: "0 0 1 1 2 2\n" },
        { input: "2 0 1\n", output: "0 1 2\n" },
        { input: "0\n", output: "0\n" },
        { input: "1\n", output: "1\n" },
        { input: "2\n", output: "2\n" },
        { input: "1 0 2 1 0\n", output: "0 0 1 1 2\n" },
    ],

    "Find All Anagrams in a String": [
        { input: "cbaebabacd\nabc\n", output: "0 6\n" },
        { input: "abab\nab\n", output: "0 1 2\n" },
        { input: "aaaaa\na\n", output: "0 1 2 3 4\n" },
        { input: "af\nbe\n", output: "\n" },
    ],

    "Median of Two Sorted Arrays": [
        { input: "1 3\n2\n", output: "2.0\n" },
        { input: "1 2\n3 4\n", output: "2.5\n" },
        { input: "0 0\n0 0\n", output: "0.0\n" },
        { input: "\n1\n", output: "1.0\n" },
        { input: "2\n\n", output: "2.0\n" },
        { input: "100 200 300\n1 2 3\n", output: "51.5\n" },
    ],

    "Regular Expression Matching": [
        { input: "aa\na\n", output: "false\n" },
        { input: "aa\na*\n", output: "true\n" },
        { input: "ab\n.*\n", output: "true\n" },
        { input: "aab\nc*a*b\n", output: "true\n" },
        { input: "mississippi\nmis*is*p*.\n", output: "false\n" },
    ],

    "Merge K Sorted Lists": [
        { input: "3\n1 4 5\n1 3 4\n2 6\n", output: "1 1 2 3 4 4 5 6\n" },
        { input: "0\n", output: "\n" },
        { input: "1\n\n", output: "\n" },
        { input: "2\n1 2 3\n4 5 6\n", output: "1 2 3 4 5 6\n" },
    ],

    "Trapping Rain Water": [
        { input: "0 1 0 2 1 0 1 3 2 1 2 1\n", output: "6\n" },
        { input: "4 2 0 3 2 5\n", output: "9\n" },
        { input: "1 1 1\n", output: "0\n" },
        { input: "5 4 3 2 1\n", output: "0\n" },
        { input: "2 0 2\n", output: "2\n" },
    ],

    "Edit Distance": [
        { input: "horse\nros\n", output: "3\n" },
        { input: "intention\nexecution\n", output: "5\n" },
        { input: "abc\n", output: "3\n" },
        { input: "\nabc\n", output: "3\n" },
        { input: "sea\neat\n", output: "2\n" },
    ],

    "Word Search II": [
        { input: "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain\n", output: "eat oath\n" },
        { input: "2 2\na b\nc d\nabcb\n", output: "\n" },
        { input: "3 3\na a a\na a a\na a a\na\n", output: "a\n" },
    ],

    "Sliding Window Maximum": [
        { input: "3\n1 3 -1 -3 5 3 6 7\n", output: "3 3 5 5 6 7\n" },
        { input: "1\n1\n", output: "1\n" },
        { input: "2\n1 2 3 4 5\n", output: "2 3 4 5\n" },
        { input: "4\n10 5 2 7 8 7\n", output: "10 7 8 8\n" },
    ],

    "First Missing Positive": [
        { input: "1 2 0\n", output: "3\n" },
        { input: "3 4 -1 1\n", output: "2\n" },
        { input: "7 8 9 11 12\n", output: "1\n" },
        { input: "1\n", output: "2\n" },
        { input: "2\n", output: "1\n" },
        { input: "1 2 3 4 5\n", output: "6\n" },
    ],

    "Sudoku Solver": [
        { input: "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n" },
    ],

    "N-Queens": [
        { input: "4\n", output: ". Q . .\n. . . Q\nQ . . .\n. . Q .\n\n. . Q .\nQ . . .\n. . . Q\n. Q . .\n" },
        { input: "1\n", output: "Q\n" },
        { input: "2\n", output: "\n" },
        { input: "3\n", output: "\n" },
    ],
};

// ─── Main ───────────────────────────────────────────────────────────────────
async function seedS3() {
    try {
        console.log("🚀 Starting Cloudflare R2 hidden test case upload...\n");

        // Fetch all problems from DB so we can map title → UUID
        const problems = await prisma.problem.findMany({ select: { id: true, title: true } });

        if (problems.length === 0) {
            console.error("❌ No problems found in DB. Run `npx prisma db seed` first!");
            process.exit(1);
        }

        const titleToId = Object.fromEntries(problems.map((p) => [p.title, p.id]));

        let uploaded = 0;
        let skipped = 0;

        for (const [title, cases] of Object.entries(HIDDEN_CASES)) {
            const problemId = titleToId[title];
            if (!problemId) {
                console.warn(`⚠️  Problem not found in DB: "${title}" — skipping.`);
                skipped++;
                continue;
            }

            console.log(`📤 Uploading ${cases.length} hidden cases for "${title}"...`);
            await S3Service.uploadTestCases(problemId, cases);
            uploaded++;
        }

        console.log(`\n✅ Done! Uploaded hidden cases for ${uploaded} problem(s). Skipped: ${skipped}`);
        console.log("   Hidden cases are now in Cloudflare R2 and will be used on SUBMIT.");

    } catch (err) {
        console.error("❌ Seed S3 failed:", err.message);
        if (err.name === "CredentialsProviderError" || err.code === "InvalidAccessKeyId") {
            console.error("\n⚠️  Check S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT in backend/.env");
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedS3();
