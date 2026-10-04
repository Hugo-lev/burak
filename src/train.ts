//Q-Task
function hasProperty(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
console.log(hasProperty({ name: "BMW", model: "M3" }, "model"));
console.log(hasProperty({ name: "BMW", model: "M3" }, "year"));
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
// console.log(countVowels("TypeScript"));
