// src/index.ts

import { tokenize } from "./lexer/tokenizer";
import { Parser } from "./parser/parser";
import { Interpreter } from "./runtime/interpreter";

const test = `
SUGOD
  MUGNA NUMERO a=5
  KUNG (a == 5)
  PUNDOK {
    IPAKITA: "YES"
  }
KATAPUSAN

`;

(async () => {
  const tokens = tokenize(test);
  const parser = new Parser(tokens);
  const ast = parser.parse();

  const interpreter = new Interpreter();
  await interpreter.run(ast);
})();

// npx ts-node src/index.ts
// to run the code
