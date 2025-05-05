// import { Token, TokenType } from "../lexer/tokenizer";
// import {
//   ASTNode,
//   Statement,
//   Expression,
//   VariableDeclaration,
//   OutputStatement,
//   InputStatement,
//   IfStatement,
//   ForLoop,
//   ExpressionStatement,
//   BinaryExpression,
//   LogicalExpression,
//   UnaryExpression,
//   Literal,
//   Identifier,
//   AssignmentExpression,
//   GroupedExpression,
// } from "./ast";

// class Parser {
//   private tokens: Token[];
//   private currentTokenIndex: number = 0;

//   constructor(tokens: Token[]) {
//     this.tokens = tokens;
//   }

//   private currentToken(): Token {
//     return this.tokens[this.currentTokenIndex];
//   }

//   private nextToken(): Token {
//     this.currentTokenIndex++;
//     return this.currentToken();
//   }

//   private expect(type: TokenType, value?: string): Token {
//     const token = this.currentToken();
//     if (token.type !== type || (value && token.value !== value)) {
//       throw new Error(
//         `Expected ${TokenType[type]}${
//           value ? ` with value ${value}` : ""
//         }, got ${TokenType[token.type]} with value ${token.value}`
//       );
//     }
//     this.nextToken();
//     return token;
//   }

//   public parseProgram(): ASTNode[] {
//     const program: ASTNode[] = [];
//     this.expect(TokenType.Keyword, "SUGOD");

//     while (this.currentToken().value !== "KATAPUSAN") {
//       const statement = this.parseStatement();
//       program.push(statement);
//     }

//     this.expect(TokenType.Keyword, "KATAPUSAN");
//     return program;
//   }

//   private parseStatement(): Statement {
//     const token = this.currentToken();

//     switch (token.value) {
//       case "MUGNA":
//         return this.parseVariableDeclaration();
//       case "IPAKITA":
//         return this.parseOutputStatement();
//       case "DAWAT":
//         return this.parseInputStatement();
//       case "KUNG":
//         return this.parseIfStatement();
//       case "ALANG":
//         return this.parseForLoop();
//       default:
//         return this.parseExpressionStatement();
//     }
//   }

//   private parseExpressionStatement(): ExpressionStatement {
//     const expression = this.parseExpression();
//     return { type: "ExpressionStatement", expression };
//   }

//   private parseBlock(): Statement[] {
//     this.expect(TokenType.Symbol, "{");
//     const body: Statement[] = [];

//     while (this.currentToken().value !== "}") {
//       body.push(this.parseStatement());
//     }

//     this.expect(TokenType.Symbol, "}");
//     return body;
//   }

//   private parseVariableDeclaration(): VariableDeclaration {
//     this.expect(TokenType.Keyword, "MUGNA");
//     const kind = this.expect(TokenType.Keyword).value as
//       | "NUMERO"
//       | "LETRA"
//       | "TINUOD"
//       | "TIPIK";
//     const name = this.expect(TokenType.Identifier).value;
//     let value: Expression | undefined;

//     if (this.currentToken().value === "=") {
//       this.nextToken(); // Skip '='
//       value = this.parseExpression();
//     }

//     return { type: "VariableDeclaration", kind, name, value };
//   }

//   private parseOutputStatement(): OutputStatement {
//     this.expect(TokenType.Keyword, "IPAKITA");
//     this.expect(TokenType.Symbol, ":");

//     const values: Expression[] = [];
//     while (
//       this.currentToken().type !== TokenType.Symbol ||
//       (this.currentToken().value !== ";" && this.currentToken().value !== "}")
//     ) {
//       values.push(this.parseExpression());
//       if (this.currentToken().value === "&") {
//         this.nextToken(); // Skip '&'
//       }
//     }

//     return { type: "OutputStatement", values };
//   }

//   private parseInputStatement(): InputStatement {
//     this.expect(TokenType.Keyword, "DAWAT");
//     this.expect(TokenType.Symbol, ":");

//     const variables: string[] = [];
//     do {
//       variables.push(this.expect(TokenType.Identifier).value);
//       if (this.currentToken().value !== ",") break;
//       this.nextToken(); // Skip comma
//     } while (true);

//     return { type: "InputStatement", variables };
//   }

//   private parseIfStatement(): IfStatement {
//     this.expect(TokenType.Keyword, "KUNG");
//     this.expect(TokenType.Symbol, "(");
//     const condition = this.parseExpression();
//     this.expect(TokenType.Symbol, ")");

//     const body = this.parseBlock();
//     let elseIf: IfStatement["elseIf"] = [];
//     let elseBody: Statement[] | undefined;

//     if (
//       this.currentToken().value === "KUNG" &&
//       this.tokens[this.currentTokenIndex + 1]?.value === "DILI"
//     ) {
//       this.nextToken(); // Skip KUNG
//       this.nextToken(); // Skip DILI
//       this.expect(TokenType.Symbol, "(");
//       const elseIfCondition = this.parseExpression();
//       this.expect(TokenType.Symbol, ")");
//       elseIf.push({
//         condition: elseIfCondition,
//         body: this.parseBlock(),
//       });
//     }

//     if (
//       this.currentToken().value === "KUNG" &&
//       this.tokens[this.currentTokenIndex + 1]?.value === "WALA"
//     ) {
//       this.nextToken(); // Skip KUNG
//       this.nextToken(); // Skip WALA
//       elseBody = this.parseBlock();
//     }

//     return { type: "IfStatement", condition, body, elseIf, elseBody };
//   }

//   private parseForLoop(): ForLoop {
//     this.expect(TokenType.Keyword, "ALANG");
//     this.expect(TokenType.Keyword, "SA");
//     this.expect(TokenType.Symbol, "(");

//     // Parse initialization (either variable declaration or assignment)
//     let init: VariableDeclaration | AssignmentExpression;
//     if (this.currentToken().value === "MUGNA") {
//       init = this.parseVariableDeclaration();
//     } else {
//       init = this.parseAssignmentExpression();
//     }

//     this.expect(TokenType.Symbol, ",");
//     const condition = this.parseExpression();
//     this.expect(TokenType.Symbol, ",");
//     const update = this.parseAssignmentExpression();
//     this.expect(TokenType.Symbol, ")");

//     const body = this.parseBlock();
//     return { type: "ForLoop", init, condition, update, body };
//   }

//   private parseExpression(): Expression {
//     return this.parseAssignmentExpression();
//   }

//   private parseAssignmentExpression(): Expression {
//     const left = this.parseLogicalExpression();

//     if (this.currentToken().value === "=") {
//       this.nextToken();
//       const right = this.parseAssignmentExpression();
//       return {
//         type: "AssignmentExpression",
//         operator: "=",
//         left,
//         right,
//       };
//     }

//     return left;
//   }

//   private parseLogicalExpression(): Expression {
//     let left = this.parseEqualityExpression();

//     while (
//       this.currentToken().value === "UG" ||
//       this.currentToken().value === "O"
//     ) {
//       const operator = this.nextToken().value as "UG" | "O";
//       const right = this.parseEqualityExpression();
//       left = { type: "LogicalExpression", operator, left, right };
//     }

//     if (this.currentToken().value === "DILI") {
//       const operator = this.nextToken().value as "DILI";
//       const argument = this.parseEqualityExpression();
//       left = { type: "UnaryExpression", operator, argument };
//     }

//     return left;
//   }

//   private parseEqualityExpression(): Expression {
//     let left = this.parseRelationalExpression();

//     while (
//       this.currentToken().value === "==" ||
//       this.currentToken().value === "<>"
//     ) {
//       const operator = this.nextToken().value;
//       const right = this.parseRelationalExpression();
//       left = { type: "BinaryExpression", operator, left, right };
//     }

//     return left;
//   }

//   private parseRelationalExpression(): Expression {
//     let left = this.parseAdditiveExpression();

//     while (
//       this.currentToken().value === ">" ||
//       this.currentToken().value === "<" ||
//       this.currentToken().value === ">=" ||
//       this.currentToken().value === "<="
//     ) {
//       const operator = this.nextToken().value;
//       const right = this.parseAdditiveExpression();
//       left = { type: "BinaryExpression", operator, left, right };
//     }

//     return left;
//   }

//   private parseAdditiveExpression(): Expression {
//     let left = this.parseMultiplicativeExpression();

//     while (
//       this.currentToken().value === "+" ||
//       this.currentToken().value === "-"
//     ) {
//       const operator = this.nextToken().value;
//       const right = this.parseMultiplicativeExpression();
//       left = { type: "BinaryExpression", operator, left, right };
//     }

//     return left;
//   }

//   private parseMultiplicativeExpression(): Expression {
//     let left = this.parsePrimaryExpression();

//     while (
//       this.currentToken().value === "*" ||
//       this.currentToken().value === "/" ||
//       this.currentToken().value === "%"
//     ) {
//       const operator = this.nextToken().value;
//       const right = this.parsePrimaryExpression();
//       left = { type: "BinaryExpression", operator, left, right };
//     }

//     return left;
//   }

//   private parsePrimaryExpression(): Expression {
//     const token = this.currentToken();

//     switch (token.type) {
//       case TokenType.Number:
//         this.nextToken();
//         return { type: "Literal", value: Number(token.value) };
//       case TokenType.String:
//         this.nextToken();
//         return { type: "Literal", value: token.value };
//       case TokenType.Boolean:
//         this.nextToken();
//         return { type: "Literal", value: token.value === "OO" };
//       case TokenType.Identifier:
//         this.nextToken();
//         return { type: "Identifier", name: token.value };
//       case TokenType.Symbol:
//         if (token.value === "(") {
//           this.nextToken();
//           const expr = this.parseExpression();
//           this.expect(TokenType.Symbol, ")");
//           return { type: "GroupedExpression", expression: expr };
//         }
//         break;
//     }

//     throw new Error(`Unexpected token: ${token.value} at line ${token.line}`);
//   }
// }
