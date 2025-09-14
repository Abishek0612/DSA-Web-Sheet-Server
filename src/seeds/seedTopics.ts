import mongoose from "mongoose";
import Topic from "../models/Topic";
import { logger } from "../utils/logger";

const sampleTopics = [
  {
    name: "Arrays",
    description:
      "Learn about array data structure, operations, and common problems including two pointers, sliding window, and prefix sum techniques.",
    icon: "🔢",
    category: "Data Structures",
    order: 1,
    estimatedTime: "2-3 weeks",
    prerequisites: ["Basic Programming"],
    tags: ["fundamental", "easy", "linear"],
    difficulty: "Beginner",
    problems: [
      {
        name: "Two Sum",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/two-sum/",
          youtube: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
          article: "https://example.com/two-sum-article",
        },
        tags: ["array", "hash-table"],
        companies: ["Google", "Amazon", "Microsoft", "Facebook"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        hints: [
          "Use a hash map to store numbers you have seen",
          "For each number, check if target - number exists in the hash map",
        ],
        order: 1,
      },
      {
        name: "Best Time to Buy and Sell Stock",
        description:
          "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit.",
        difficulty: "Easy",
        links: {
          leetcode:
            "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
          youtube: "https://www.youtube.com/watch?v=1pkOgXD63yU",
        },
        tags: ["array", "dynamic-programming"],
        companies: ["Amazon", "Microsoft", "Bloomberg"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        hints: [
          "Keep track of the minimum price seen so far",
          "Calculate profit at each step and keep track of maximum profit",
        ],
        order: 2,
      },
      {
        name: "Contains Duplicate",
        description:
          "Given an integer array nums, return true if any value appears at least twice in the array.",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/contains-duplicate/",
          youtube: "https://www.youtube.com/watch?v=3OamzN90kPg",
        },
        tags: ["array", "hash-table", "sorting"],
        companies: ["Airbnb", "Palantir"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        hints: [
          "Use a hash set to track seen elements",
          "Alternatively, sort the array and check adjacent elements",
        ],
        order: 3,
      },
    ],
  },
  {
    name: "Linked Lists",
    description:
      "Master linked list operations including traversal, insertion, deletion, and advanced techniques like cycle detection.",
    icon: "🔗",
    category: "Data Structures",
    order: 2,
    estimatedTime: "1-2 weeks",
    prerequisites: ["Arrays", "Pointers"],
    tags: ["fundamental", "medium", "linear"],
    difficulty: "Beginner",
    problems: [
      {
        name: "Reverse Linked List",
        description:
          "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/reverse-linked-list/",
          youtube: "https://www.youtube.com/watch?v=G0_I-ZF0S38",
        },
        tags: ["linked-list", "recursion"],
        companies: ["Microsoft", "Amazon", "Apple", "Google"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        hints: [
          "Use three pointers: previous, current, and next",
          "Alternatively, solve it recursively",
        ],
        order: 1,
      },
      {
        name: "Linked List Cycle",
        description:
          "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/linked-list-cycle/",
          youtube: "https://www.youtube.com/watch?v=gBTe7lFR3vc",
        },
        tags: ["linked-list", "hash-table", "two-pointers"],
        companies: ["Amazon", "Microsoft", "Bloomberg"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        hints: [
          "Use Floyd's cycle-finding algorithm (tortoise and hare)",
          "Fast pointer moves 2 steps, slow pointer moves 1 step",
        ],
        order: 2,
      },
    ],
  },
  {
    name: "Stacks and Queues",
    description:
      "Learn about stack and queue data structures, their implementations, and solve problems using LIFO and FIFO principles.",
    icon: "📚",
    category: "Data Structures",
    order: 3,
    estimatedTime: "1-2 weeks",
    prerequisites: ["Arrays", "Linked Lists"],
    tags: ["fundamental", "medium", "linear"],
    difficulty: "Beginner",
    problems: [
      {
        name: "Valid Parentheses",
        description:
          "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/valid-parentheses/",
          youtube: "https://www.youtube.com/watch?v=WTzjTskDFMg",
        },
        tags: ["string", "stack"],
        companies: ["Amazon", "Microsoft", "Google", "Facebook"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        hints: [
          "Use a stack to keep track of opening brackets",
          "When you see a closing bracket, check if it matches the most recent opening bracket",
        ],
        order: 1,
      },
    ],
  },
  {
    name: "Binary Trees",
    description:
      "Explore binary tree concepts including traversals, properties, and tree-based algorithms.",
    icon: "🌳",
    category: "Data Structures",
    order: 4,
    estimatedTime: "2-3 weeks",
    prerequisites: ["Recursion", "Stacks and Queues"],
    tags: ["advanced", "hard", "hierarchical"],
    difficulty: "Intermediate",
    problems: [
      {
        name: "Maximum Depth of Binary Tree",
        description:
          "Given the root of a binary tree, return its maximum depth.",
        difficulty: "Easy",
        links: {
          leetcode:
            "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
          youtube: "https://www.youtube.com/watch?v=hTM3phVI6YQ",
        },
        tags: [
          "tree",
          "depth-first-search",
          "breadth-first-search",
          "binary-tree",
        ],
        companies: ["Amazon", "Microsoft", "LinkedIn"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(h)",
        hints: [
          "Use recursion: depth = 1 + max(left subtree depth, right subtree depth)",
          "Base case: if node is null, return 0",
        ],
        order: 1,
      },
    ],
  },
  {
    name: "Dynamic Programming",
    description:
      "Master the art of breaking down complex problems into simpler subproblems using memoization and tabulation.",
    icon: "🎯",
    category: "Algorithms",
    order: 5,
    estimatedTime: "3-4 weeks",
    prerequisites: ["Recursion", "Arrays"],
    tags: ["advanced", "hard", "optimization"],
    difficulty: "Advanced",
    problems: [
      {
        name: "Climbing Stairs",
        description:
          "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        links: {
          leetcode: "https://leetcode.com/problems/climbing-stairs/",
          youtube: "https://www.youtube.com/watch?v=Y0lT9Fck7qI",
        },
        tags: ["math", "dynamic-programming", "memoization"],
        companies: ["Amazon", "Adobe", "Apple"],
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        hints: [
          "This is essentially the Fibonacci sequence",
          "ways(n) = ways(n-1) + ways(n-2)",
          "Base cases: ways(1) = 1, ways(2) = 2",
        ],
        order: 1,
      },
    ],
  },
];

export const seedTopics = async (): Promise<void> => {
  try {
    logger.info("Starting topic seeding...");

    const existingTopics = await Topic.find({});
    if (existingTopics.length > 0) {
      logger.info("Topics already exist, skipping seeding");
      return;
    }

    await Topic.insertMany(sampleTopics);
    logger.info(`Successfully seeded ${sampleTopics.length} topics`);
  } catch (error) {
    logger.error("Error seeding topics:", error);
    throw error;
  }
};
