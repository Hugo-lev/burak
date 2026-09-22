//L task

function reverseSentence(str: string): string {
  return str
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
}

console.log(reverseSentence("we like coding!"));

console.log(reverseSentence("hello world"));

console.log(reverseSentence("TypeScript is fun"));

//K task

function countVowels(str: string): number {
  const vowels: string = "aeiouAEIOU";
  let count: number = 0;

  for (const char of str) {
    if (vowels.includes(char)) {
      count++;
    }
  }

  return count;
}

// Misollar:
console.log(countVowels("string"));
console.log(countVowels("hello"));
console.log(countVowels("TypeScript"));
