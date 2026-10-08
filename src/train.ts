//S - task
function missingNumber(nums: number[]): number {
  const n = nums.length;
  const expectedSum = (n * (n + 1)) / 2; // 0 dan n gacha bo'lgan sonlar yig'indisi
  const actualSum = nums.reduce((acc, num) => acc + num, 0); // arraydagi sonlar yig'indisi
  return expectedSum - actualSum;
}

// //R - Task
// function calculate(str: string): number {
//   const parts: string[] = str.split("+");
//   const numbers: number[] = parts.map((num) => Number(num));

//   const sum: number = numbers.reduce((a, b) => a + b, 0);

//   return sum;
// }

// // Misollar:
// console.log(calculate("1+3"));
// console.log(calculate("10+25"));
// console.log(calculate("7+8+9"));

// // P-Task
// function objectToArray<T extends Record<string, any>>(obj: T): [string, any][] {
//   return Object.entries(obj);
// }

// // Misol:
// const result = objectToArray({ a: 10, b: 20 });
// console.log(result);
// Natija: [["a", 10], ["b", 20]]

// //O - Task
// function calculateSumOfNumbers(arr: any[]): number {
//   let sum: number = 0;

//   arr.forEach((item) => {
//     if (typeof item === "number") {
//       // Oddiy son
//       sum += item;
//     } else if (typeof item === "string" && !isNaN(Number(item))) {
//       // String bo‘lsa va son ko‘rinishida bo‘lsa
//       sum += Number(item);
//     } else if (typeof item === "object" && item !== null && "son" in item) {
//       // Object ichida 'son' property bo‘lsa
//       sum += Number((item as { son: number }).son);
//     }
//     // true/false yoki boshqa qiymatlar qo‘shilmaydi
//   });

//   return sum;
// }

// // Misol:
// console.log(calculateSumOfNumbers([10, "10", { son: 10 }, true, 35]));
// // Natija: 45

// //N - Task
// function palindromCheck(str: string): boolean {
//   const reversed = str.split("").reverse().join("");
//   return str === reversed;
// }

// // Misollar:
// console.log(palindromCheck("dad")); // true
// console.log(palindromCheck("son")); // false

//M - task
// type SquareObject = {
//   number: number;
//   square: number;
// };

// function getSquareNumbers(arr: number[]): SquareObject[] {
//   return arr.map((num: number) => ({
//     number: num,
//     square: num * num,
//   }));
// }
// console.log(getSquareNumbers([1, 2, 3]));

// //L task

// function reverseSentence(str: string): string {
//   return str
//     .split(" ")
//     .map((word) => word.split("").reverse().join(""))
//     .join(" ");
// }

// console.log(reverseSentence("we like coding!"));

// console.log(reverseSentence("hello world"));

// console.log(reverseSentence("TypeScript is fun"));

// //K task

// function countVowels(str: string): number {
//   const vowels: string = "aeiouAEIOU";
//   let count: number = 0;

//   for (const char of str) {
//     if (vowels.includes(char)) {
//       count++;
//     }
//   }

//   return count;
// }

// // Misollar:
// console.log(countVowels("string"));
// console.log(countVowels("hello"));
// console.log(countVowels("TypeScript"))
