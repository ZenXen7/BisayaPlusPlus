import { Token, TokenType } from "../lexer/tokenizer";

// === AST Types ===

export type ASTNode =
  | ProgramNode
  | DeclarationNode
  | AssignmentNode
  | OutputNode
  | InputNode
  | IfStatementNode
  | IfElseStatementNode
  | IfElseIfStatementNode
  | ForLoopNode
  | BlockNode;

export interface ProgramNode {
  type: "Program";
  body: ASTNode[];
}

export interface DeclarationNode {
  type: "Declaration";
  dataType: string;
  identifiers: { name: string; value?: any }[];
}

export interface AssignmentNode {
  type: "Assignment";
  targets: string[];
  value: ExpressionNode;
}

export interface OutputNode {
  type: "Output";
  expressions: ExpressionNode[];
}

export interface InputNode {
  type: "Input";
  identifiers: string[];
}

export interface IfStatementNode {
  type: "If";
  condition: ExpressionNode;
  thenBranch: BlockNode;
}

export interface IfElseStatementNode {
  type: "IfElse";
  condition: ExpressionNode;
  thenBranch: BlockNode;
  elseBranch: BlockNode;
}

export interface IfElseIfStatementNode {
  type: "IfElseIf";
  branches: { condition: ExpressionNode; body: BlockNode }[];
  elseBranch: BlockNode;
}

export interface ForLoopNode {
  type: "For";
  initializer: AssignmentNode;
  condition: ExpressionNode;
  increment: AssignmentNode;
  body: BlockNode;
}

export interface BlockNode {
  type: "Block";
  statements: ASTNode[];
}

export interface UnaryExpressionNode {
  type: "UnaryExpression";
  operator: string; // should be 'DILI', '+', or '-'
  expression: ExpressionNode;
}

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | UnaryExpressionNode;

export interface LiteralNode {
  type: "Literal";
  value: string | number | boolean;
}

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ExpressionNode;
  right: ExpressionNode;
}

// === Parser ===

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ProgramNode {
    const body: ASTNode[] = [];

    this.consumeKeyword("SUGOD");

    while (!this.checkKeyword("KATAPUSAN")) {
      body.push(this.parseStatement());
    }

    this.consumeKeyword("KATAPUSAN");

    return {
      type: "Program",
      body,
    };
  }

  private parseStatement(): ASTNode {
    if (this.matchKeyword("MUGNA")) return this.parseDeclaration();
    if (this.match(TokenType.Identifier)) return this.parseAssignment();
    if (this.matchKeyword("IPAKITA")) return this.parseOutput();
    if (this.matchKeyword("DAWAT")) return this.parseInput();
    if (this.matchKeyword("KUNG")) return this.parseIfStatement();
    if (this.matchKeyword("ALANG")) return this.parseForLoop();

    throw new Error(
      `Unexpected token '${this.peek().value}' at line ${
        this.peek().lineNumber
      }`
    );
  }

  private parseDeclaration(): DeclarationNode {
    const dataType = this.consume(TokenType.Keyword).value;
    const identifiers = [];

    do {
      const id = this.consume(TokenType.Identifier).value;
      let value = undefined;
      if (this.matchSymbol("=")) {
        value = this.consumeLiteral().value;
      }
      identifiers.push({ name: id, value });
    } while (this.matchSymbol(","));

    return {
      type: "Declaration",
      dataType,
      identifiers,
    };
  }

  private parseAssignment(): AssignmentNode {
    const targets = [this.previous().value];

    while (this.matchSymbol("=")) {
      if (this.match(TokenType.Identifier)) {
        targets.push(this.previous().value);
      } else {
        const value = this.parseExpression();
        return {
          type: "Assignment",
          targets,
          value,
        };
      }
    }

    throw new Error("Invalid assignment statement.");
  }

  private parseOutput(): OutputNode {
    this.consumeSymbol(":");
    const expressions: ExpressionNode[] = [];

    do {
      expressions.push(this.parseExpression());
    } while (this.matchSymbol("&"));

    return {
      type: "Output",
      expressions,
    };
  }

  private parseInput(): InputNode {
    this.consumeSymbol(":");
    const identifiers: string[] = [];

    do {
      const name = this.consume(TokenType.Identifier).value;
      identifiers.push(name);
    } while (this.matchSymbol(","));

    return {
      type: "Input",
      identifiers,
    };
  }

  private parseIfStatement(): ASTNode {
    const branches: { condition: ExpressionNode; body: BlockNode }[] = [];

    const condition = this.parseExpression();
    const thenBranch = this.parseBlock();
    branches.push({ condition, body: thenBranch });

    while (this.matchKeyword("KUNG DILI")) {
      const elifCondition = this.parseExpression();
      const elifBody = this.parseBlock();
      branches.push({ condition: elifCondition, body: elifBody });
    }

    if (this.matchKeyword("KUNG WALA")) {
      const elseBranch = this.parseBlock();

      if (branches.length === 1) {
        return {
          type: "IfElse",
          condition: branches[0].condition,
          thenBranch: branches[0].body,
          elseBranch,
        };
      }

      return {
        type: "IfElseIf",
        branches,
        elseBranch,
      };
    }

    return {
      type: "If",
      condition: branches[0].condition,
      thenBranch: branches[0].body,
    };
  }

  private parseForLoop(): ForLoopNode {
    this.consumeKeyword("SA");
    this.consumeSymbol("(");

    const initTarget = this.consume(TokenType.Identifier).value;
    this.consumeSymbol("=");
    const initValue = this.parseExpression();
    const initializer: AssignmentNode = {
      type: "Assignment",
      targets: [initTarget],
      value: initValue,
    };

    this.consumeSymbol(",");

    const condition = this.parseExpression();

    this.consumeSymbol(",");

    const incTarget = this.consume(TokenType.Identifier).value;
    const op = this.consume(TokenType.Symbol).value;
    const increment: AssignmentNode = {
      type: "Assignment",
      targets: [incTarget],
      value: {
        type: "BinaryExpression",
        operator: op === "++" ? "+" : "-",
        left: { type: "Identifier", name: incTarget },
        right: { type: "Literal", value: 1 },
      },
    };

    this.consumeSymbol(")");

    const body = this.parseBlock();

    return {
      type: "For",
      initializer,
      condition,
      increment,
      body,
    };
  }

  private parseBlock(): BlockNode {
    this.consumeKeyword("PUNDOK");
    this.consumeSymbol("{");

    const statements: ASTNode[] = [];
    while (!this.checkSymbol("}")) {
      statements.push(this.parseStatement());
    }

    this.consumeSymbol("}");

    return {
      type: "Block",
      statements,
    };
  }

  private parseExpression(): ExpressionNode {
    return this.parseBinaryExpression();
  }

  private parseBinaryExpression(): ExpressionNode {
    let left = this.parseUnary();

    while (
      (this.check(TokenType.Symbol) &&
        ["+", "-", "*", "/", "%", "<", ">", "<=", ">=", "==", "<>"].includes(
          this.peek().value
        )) ||
      (this.check(TokenType.Keyword) && ["UG", "O"].includes(this.peek().value))
    ) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseUnary(): ExpressionNode {
    // Handle DILI keyword (NOT)
    if (this.check(TokenType.Keyword) && this.peek().value === "DILI") {
      const operator = this.advance().value;
      const expression = this.parseUnary(); // recursively call parseUnary
      return {
        type: "UnaryExpression",
        operator,
        expression,
      };
    }

    // Handle unary + or -
    if (
      this.check(TokenType.Symbol) &&
      (this.peek().value === "+" || this.peek().value === "-")
    ) {
      const operator = this.advance().value;
      const expression = this.parseUnary(); // again, recursively handle nested unary
      return {
        type: "UnaryExpression",
        operator,
        expression,
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.advance();

    if (token.type === TokenType.Symbol && token.value === "(") {
      const expr = this.parseExpression();
      this.consumeSymbol(")");
      return expr;
    }

    if (token.type === TokenType.Number) {
      return { type: "Literal", value: parseInt(token.value) };
    }

    if (token.type === TokenType.String || token.type === TokenType.Boolean) {
      return { type: "Literal", value: token.value };
    }

    if (token.type === TokenType.Character) {
      return { type: "Literal", value: token.value };
    }

    if (token.type === TokenType.Identifier) {
      return { type: "Identifier", name: token.value };
    }

    if (token.type === TokenType.Symbol && token.value === "$") {
      return { type: "Literal", value: "\n" };
    }

    if (token.type === TokenType.Symbol && token.value === "[[]") {
      return { type: "Literal", value: "[" };
    }

    if (token.type === TokenType.Symbol && token.value === "[]]") {
      return { type: "Literal", value: "]" };
    }

    if (token.type === TokenType.Symbol && token.value === "[#]") {
      return { type: "Literal", value: "#" };
    }

    throw new Error(`Unexpected expression token '${token.value}'`);
  }

  // ---------- Utility Methods ----------

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchKeyword(value: string): boolean {
    if (this.check(TokenType.Keyword) && this.peek().value === value) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchSymbol(value: string): boolean {
    if (this.check(TokenType.Symbol) && this.peek().value === value) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: TokenType): Token {
    if (this.check(type)) return this.advance();
    throw new Error(
      `Expected token type ${TokenType[type]}, got '${this.peek().value}'`
    );
  }

  private consumeKeyword(value: string): void {
    if (!this.matchKeyword(value)) {
      throw new Error(
        `Expected keyword '${value}', got '${this.peek().value}'`
      );
    }
  }

  private consumeSymbol(value: string): void {
    if (!this.matchSymbol(value)) {
      throw new Error(`Expected symbol '${value}', got '${this.peek().value}'`);
    }
  }

  private consumeLiteral(): Token {
    const next = this.peek();

    // Handle custom boolean-like literals (OO, DILI)
    if (next.value === "OO" || next.value === "DILI") {
      return this.advance(); // Treat OO and DILI as valid literals
    }

    // Handle standard literals
    if (
      [
        TokenType.Number,
        TokenType.String,
        TokenType.Character,
        TokenType.Boolean,
      ].includes(next.type)
    ) {
      return this.advance(); // Standard literal types
    }

    throw new Error(`Expected literal, got '${next.value}'`);
  }

  private check(type: TokenType): boolean {
    return !this.isAtEnd() && this.peek().type === type;
  }

  private checkKeyword(value: string): boolean {
    return (
      !this.isAtEnd() &&
      this.peek().type === TokenType.Keyword &&
      this.peek().value === value
    );
  }

  private checkSymbol(value: string): boolean {
    return (
      !this.isAtEnd() &&
      this.peek().type === TokenType.Symbol &&
      this.peek().value === value
    );
  }

  private advance(): Token {
    return this.tokens[this.current++];
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.Eof;
  }
}
