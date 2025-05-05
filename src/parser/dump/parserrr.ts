import { Token, TokenType } from "../../lexer/tokenizer";

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
  | BlockNode
  | ExpressionStatementNode; // Add this

export interface ExpressionStatementNode {
  type: "ExpressionStatement";
  expression: ExpressionNode;
}

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
    if (this.matchKeyword("IPAKITA")) return this.parseOutput();
    if (this.matchKeyword("DAWAT")) return this.parseInput();
    if (this.matchKeyword("KUNG")) return this.parseIfStatement();
    if (this.matchKeyword("ALANG")) return this.parseForLoop();

    // Handle assignments and expressions
    if (this.match(TokenType.Identifier)) {
      const lookahead = this.peek();
      if (lookahead.type === TokenType.Symbol && lookahead.value === "=") {
        // It's an assignment
        const identifier = this.previous().value;
        this.advance(); // Consume the =
        const value = this.parseExpression();
        return {
          type: "Assignment",
          targets: [identifier],
          value,
        };
      }
      // It's just an identifier expression
      return {
        type: "ExpressionStatement",
        expression: { type: "Identifier", name: this.previous().value },
      };
    }

    // Handle other expressions
    const expr = this.parseExpression();
    return {
      type: "ExpressionStatement",
      expression: expr,
    };
  }

  private parseDeclaration(): DeclarationNode {
    const dataType = this.consume(TokenType.Keyword).value;
    if (!["NUMERO", "LETRA", "TINUOD", "TIPIK"].includes(dataType)) {
      throw new Error(`Invalid data type '${dataType}'`);
    }

    const identifiers = [];
    do {
      const id = this.consume(TokenType.Identifier).value;
      let value = undefined;
      if (this.matchSymbol("=")) {
        value = this.parseLiteralForType(dataType).value;
      }
      identifiers.push({ name: id, value });
    } while (this.matchSymbol(","));

    return { type: "Declaration", dataType, identifiers };
  }

  private parseLiteralForType(dataType: string): Token {
    const token = this.consumeLiteral();
    // Add validation here based on dataType
    return token;
  }

  private parseAssignment(firstTarget: string): AssignmentNode {
    const targets = [firstTarget];
    let value: ExpressionNode | undefined = undefined; // Explicitly mark as possibly undefined

    // Handle chained assignments (x = y = 4)
    while (this.matchSymbol("=")) {
      if (this.match(TokenType.Identifier)) {
        targets.push(this.previous().value);
      } else {
        value = this.parseExpression();
        break;
      }
    }

    // Now TypeScript knows value might be undefined here
    if (value === undefined) {
      value = this.parseExpression();
    }

    // Build the assignment tree for chained assignments
    for (let i = targets.length - 1; i > 0; i--) {
      value = {
        type: "BinaryExpression",
        operator: "=",
        left: { type: "Identifier", name: targets[i] },
        right: value,
      };
    }

    return {
      type: "Assignment",
      targets: [targets[0]],
      value: value, // Now definitely assigned
    };
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

    // Parse initializer (must be an identifier followed by =)
    const initTarget = this.consume(TokenType.Identifier).value;
    this.consumeSymbol("=");
    const initValue = this.parseExpression();
    const initializer: AssignmentNode = {
      type: "Assignment",
      targets: [initTarget],
      value: initValue,
    };

    this.consumeSymbol(",");

    // Parse condition
    const condition = this.parseExpression();
    this.consumeSymbol(",");

    // Parse increment (must be an identifier followed by operator)
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
    return { type: "For", initializer, condition, increment, body };
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
    return this.parseBinaryExpression(0);
  }

  private parseBinaryExpression(minPrecedence: number): ExpressionNode {
    const precedences: Record<string, number> = {
      UG: 2,
      O: 2,
      "==": 3,
      "<>": 3,
      "<": 3,
      ">": 3,
      "<=": 3,
      ">=": 3,
      "+": 4,
      "-": 4,
      "*": 5,
      "/": 5,
      "%": 5,
    };

    let left = this.parseUnary();
    while (true) {
      const op = this.peek().value;
      const precedence = precedences[op] || 0;
      if (precedence < minPrecedence) break;

      this.advance();
      const right = this.parseBinaryExpression(precedence + 1);
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  private parseUnary(): ExpressionNode {
    if (this.check(TokenType.Keyword) && this.peek().value === "DILI") {
      const operator = this.advance().value;
      const expression = this.parsePrimary();
      return {
        type: "UnaryExpression",
        operator,
        expression,
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek(); // Don't advance yet

    if (token.type === TokenType.Symbol) {
      if (token.value === "(") {
        this.advance(); // Consume '('
        const expr = this.parseExpression();
        this.consumeSymbol(")");
        return expr;
      }
      if (token.value === "$") {
        this.advance();
        return { type: "Literal", value: "\n" };
      }
      if (token.value === "[#]") {
        this.advance();
        return { type: "Literal", value: "#" };
      }
    }

    // For other cases, advance and handle
    const nextToken = this.advance();

    if (nextToken.type === TokenType.Number) {
      return { type: "Literal", value: parseInt(nextToken.value) };
    }

    if (
      nextToken.type === TokenType.String ||
      nextToken.type === TokenType.Boolean
    ) {
      return { type: "Literal", value: nextToken.value };
    }

    if (nextToken.type === TokenType.Character) {
      return { type: "Literal", value: nextToken.value };
    }

    if (nextToken.type === TokenType.Identifier) {
      return { type: "Identifier", name: nextToken.value };
    }

    throw this.error(`Unexpected expression token '${nextToken.value}'`);
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
    if (
      [
        TokenType.Number,
        TokenType.String,
        TokenType.Character,
        TokenType.Boolean,
      ].includes(next.type)
    ) {
      return this.advance();
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

  private error(message: string): never {
    throw new Error(`${message} at line ${this.peek().line}`);
  }
}
