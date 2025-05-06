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
  lineNumber: number;
}

const BISAYA_KEYWORDS = [
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

const OPERATORS_AND_SYMBOLS = [
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
  let currentPosition = 0;
  let lineNumber = 1;

  while (currentPosition < input.length) {
    let currentChar = input[currentPosition];

    // Handle new lineNumbers
    if (currentChar === "\n") {
      lineNumber++;
      currentPosition++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(currentChar)) {
      currentPosition++;
      continue;
    }

    // Handle comments
    if (currentChar === "-" && input[currentPosition + 1] === "-") {
      while (currentChar !== "\n" && currentPosition < input.length) {
        currentPosition++;
        currentChar = input[currentPosition];
      }
      continue;
    }

    // Handle numbers (integers and floating-point numbers)
    if (/\d/.test(currentChar)) {
      let value = "";
      // Capture integer part of the number
      while (/\d/.test(currentChar)) {
        value += currentChar;
        currentChar = input[++currentPosition];
      }

      // Check for decimal point and capture fractional part if present
      if (currentChar === ".") {
        value += currentChar;
        currentChar = input[++currentPosition];
        while (/\d/.test(currentChar)) {
          value += currentChar;
          currentChar = input[++currentPosition];
        }
      }

      // Push the token for the number
      tokens.push({ type: TokenType.Number, value, lineNumber });
      continue;
    }

    // Handle string literals
    if (currentChar === '"') {
      let value = "";
      currentChar = input[++currentPosition];
      while (currentChar !== '"' && currentPosition < input.length) {
        value += currentChar;
        currentChar = input[++currentPosition];
      }
      currentPosition++; // skip closing "
      tokens.push({ type: TokenType.String, value, lineNumber });
      continue;
    }

    // Handle character literals
    if (currentChar === "'") {
      const value = input[currentPosition + 1];
      currentPosition += 3; // skip 'x'
      tokens.push({ type: TokenType.Character, value, lineNumber });
      continue;
    }

    // Handle special escape sequences like [[] and []]
    if (input.startsWith("[[]", currentPosition)) {
      tokens.push({ type: TokenType.Symbol, value: "[[]", lineNumber });
      currentPosition += 3;
      continue;
    }

    if (input.startsWith("[]]", currentPosition)) {
      tokens.push({ type: TokenType.Symbol, value: "[]]", lineNumber });
      currentPosition += 3;
      continue;
    }

    // Handle [#] escape
    if (input.startsWith("[#]", currentPosition)) {
      tokens.push({ type: TokenType.Symbol, value: "[#]", lineNumber });
      currentPosition += 3;
      continue;
    }

    if (
      (currentChar === "+" || currentChar === "-") &&
      input[currentPosition + 1] === currentChar
    ) {
      const doubleOp = currentChar + input[currentPosition + 1];
      tokens.push({ type: TokenType.Symbol, value: doubleOp, lineNumber });
      currentPosition += 2;
      continue;
    }

    // Handle OPERATORS_AND_SYMBOLS/operators
    if (OPERATORS_AND_SYMBOLS.includes(currentChar)) {
      let value = currentChar;
      // Handle two-character operators like >=, <=, <>

      if (
        (currentChar === "<" || currentChar === ">" || currentChar === "=") &&
        input[currentPosition + 1] === "="
      ) {
        value += input[currentPosition + 1];
        currentPosition++;
      } else if (currentChar === "<" && input[currentPosition + 1] === ">") {
        value += input[currentPosition + 1];
        currentPosition++;
      }

      currentPosition++;
      tokens.push({ type: TokenType.Symbol, value, lineNumber });
      continue;
    }

    // Handle identifiers/BISAYA_KEYWORDS
    // Handle identifiers/BISAYA_KEYWORDS (with lookahead for multi-word BISAYA_KEYWORDS)
    if (/[a-zA-Z_]/.test(currentChar)) {
      let value = "";
      while (
        /[a-zA-Z0-9_]/.test(currentChar) &&
        currentPosition < input.length
      ) {
        value += currentChar;
        currentChar = input[++currentPosition];
      }

      let upperVal = value.toUpperCase();

      // Look ahead to combine with next word if it makes a valid keyword
      const savedPos = currentPosition;
      const savedlineNumber = lineNumber;

      // Skip whitespace
      while (
        /\s/.test(input[currentPosition]) &&
        currentPosition < input.length
      ) {
        if (input[currentPosition] === "\n") lineNumber++;
        currentPosition++;
      }

      let nextWord = "";
      let nextChar = input[currentPosition];
      while (/[a-zA-Z]/.test(nextChar) && currentPosition < input.length) {
        nextWord += nextChar;
        nextChar = input[++currentPosition];
      }

      const combined = `${upperVal} ${nextWord.toUpperCase()}`;
      if (BISAYA_KEYWORDS.includes(combined)) {
        upperVal = combined;
      } else {
        // If not a valid combined keyword, reset position
        currentPosition = savedPos;
        lineNumber = savedlineNumber;
      }

      if (BISAYA_KEYWORDS.includes(upperVal)) {
        tokens.push({ type: TokenType.Keyword, value: upperVal, lineNumber });
      } else if (upperVal === "OO" || upperVal === "DILI") {
        tokens.push({ type: TokenType.Boolean, value: upperVal, lineNumber });
      } else {
        tokens.push({ type: TokenType.Identifier, value: value, lineNumber });
      }

      continue;
    }

    throw new Error(
      `Unexpected character '${currentChar}' at lineNumber ${lineNumber}`
    );
  }

  tokens.push({ type: TokenType.Eof, value: "EOF", lineNumber });
  return tokens;
}
