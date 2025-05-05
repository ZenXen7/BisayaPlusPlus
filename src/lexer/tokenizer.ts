// src/lexer/tokenizer.ts

export enum TokenType {
  Keyword,
  Identifier,
  Number,
  String,
  Character,
  Boolean,
  Symbol,
  Operator,
  Comment,
  Eof,
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

const KEYWORDS = [
  "SUGOD",
  "KATAPUSAN",
  "MUGNA",
  "NUMERO",
  "LETRA",
  "TINUOD",
  "TIPIK",
  "IPAKITA",
  "DAWAT",
  "KUNG",
  "KUNG WALA",
  "KUNG DILI",
  "PUNDOK",
  "ALANG",
  "SA",
  "UG",
  "O",
  "DILI",
];

const SYMBOLS = [
  "(",
  ")",
  "{",
  "}",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  "&",
  "$",
  "[",
  "]",
  ",",
  "<",
  ">",
  ":",
  "++",
  "--",
];

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let current = 0;
  let line = 1;

  while (current < input.length) {
    let char = input[current];

    // Handle new lines
    if (char === "\n") {
      line++;
      current++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // Handle comments
    if (char === "-" && input[current + 1] === "-") {
      while (char !== "\n" && current < input.length) {
        current++;
        char = input[current];
      }
      continue;
    }

    // Handle numbers (integers and floating-point numbers)
    if (/\d/.test(char)) {
      let value = "";
      // Capture integer part of the number
      while (/\d/.test(char)) {
        value += char;
        char = input[++current];
      }

      // Check for decimal point and capture fractional part if present
      if (char === ".") {
        value += char;
        char = input[++current];
        while (/\d/.test(char)) {
          value += char;
          char = input[++current];
        }
      }

      // Push the token for the number
      tokens.push({ type: TokenType.Number, value, line });
      continue;
    }

    // Handle string literals
    if (char === '"') {
      let value = "";
      char = input[++current];
      while (char !== '"' && current < input.length) {
        value += char;
        char = input[++current];
      }
      current++; // skip closing "
      tokens.push({ type: TokenType.String, value, line });
      continue;
    }

    // Handle character literals
    if (char === "'") {
      const value = input[current + 1];
      current += 3; // skip 'x'
      tokens.push({ type: TokenType.Character, value, line });
      continue;
    }

    // Handle special escape sequences like [[] and []]
    if (input.startsWith("[[]", current)) {
      tokens.push({ type: TokenType.Symbol, value: "[[]", line });
      current += 3;
      continue;
    }

    if (input.startsWith("[]]", current)) {
      tokens.push({ type: TokenType.Symbol, value: "[]]", line });
      current += 3;
      continue;
    }

    // Handle [#] escape
    if (input.startsWith("[#]", current)) {
      tokens.push({ type: TokenType.Symbol, value: "[#]", line });
      current += 3;
      continue;
    }

    if ((char === "+" || char === "-") && input[current + 1] === char) {
      const doubleOp = char + input[current + 1];
      tokens.push({ type: TokenType.Symbol, value: doubleOp, line });
      current += 2;
      continue;
    }

    // Handle symbols/operators
    if (SYMBOLS.includes(char)) {
      let value = char;
      // Handle two-character operators like >=, <=, <>

      if (
        (char === "<" || char === ">" || char === "=") &&
        input[current + 1] === "="
      ) {
        value += input[current + 1];
        current++;
      } else if (char === "<" && input[current + 1] === ">") {
        value += input[current + 1];
        current++;
      }

      current++;
      tokens.push({ type: TokenType.Symbol, value, line });
      continue;
    }

    // Handle identifiers/keywords
    // Handle identifiers/keywords (with lookahead for multi-word keywords)
    if (/[a-zA-Z_]/.test(char)) {
      let value = "";
      while (/[a-zA-Z0-9_]/.test(char) && current < input.length) {
        value += char;
        char = input[++current];
      }

      let upperVal = value.toUpperCase();

      // Look ahead to combine with next word if it makes a valid keyword
      const savedPos = current;
      const savedLine = line;

      // Skip whitespace
      while (/\s/.test(input[current]) && current < input.length) {
        if (input[current] === "\n") line++;
        current++;
      }

      let nextWord = "";
      let nextChar = input[current];
      while (/[a-zA-Z]/.test(nextChar) && current < input.length) {
        nextWord += nextChar;
        nextChar = input[++current];
      }

      const combined = `${upperVal} ${nextWord.toUpperCase()}`;
      if (KEYWORDS.includes(combined)) {
        upperVal = combined;
      } else {
        // If not a valid combined keyword, reset position
        current = savedPos;
        line = savedLine;
      }

      if (KEYWORDS.includes(upperVal)) {
        tokens.push({ type: TokenType.Keyword, value: upperVal, line });
      } else if (upperVal === "OO" || upperVal === "DILI") {
        tokens.push({ type: TokenType.Boolean, value: upperVal, line });
      } else {
        tokens.push({ type: TokenType.Identifier, value: value, line });
      }

      continue;
    }

    throw new Error(`Unexpected character '${char}' at line ${line}`);
  }

  tokens.push({ type: TokenType.Eof, value: "EOF", line });
  return tokens;
}
