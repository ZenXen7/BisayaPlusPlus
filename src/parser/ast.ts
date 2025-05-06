export type ASTNode = Statement | Expression;

// ================ Statements ================
export type Statement =
  | VariableDeclaration
  | OutputStatement
  | InputStatement
  | IfStatement
  | ForLoop
  | ExpressionStatement;

// Variable Declaration (MUGNA)
export interface VariableDeclaration {
  type: "VariableDeclaration";
  kind: "NUMERO" | "LETRA" | "TINUOD" | "TIPIK";
  name: string;
  value?: Expression;
}

// Output Statement (IPAKITA)
export interface OutputStatement {
  type: "OutputStatement";
  values: Expression[];
}

// Input Statement (DAWAT)
export interface InputStatement {
  type: "InputStatement";
  variables: string[];
}

// Conditional (KUNG, KUNG WALA, KUNG DILI)
export interface IfStatement {
  type: "IfStatement";
  condition: Expression;
  body: Statement[];
  elseIf?: { condition: Expression; body: Statement[] }[];
  elseBody?: Statement[];
}

// Loop (ALANG SA)
export interface ForLoop {
  type: "ForLoop";
  init: VariableDeclaration | AssignmentExpression;
  condition: Expression;
  update: AssignmentExpression;
  body: Statement[];
}

// Wrapper for expressions used as statements (e.g., `x = 5;`)
export interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}

// ================ Expressions ================
export type Expression =
  | BinaryExpression
  | UnaryExpression
  | LogicalExpression
  | Literal
  | Identifier
  | AssignmentExpression
  | GroupedExpression;

// Binary operations (+, -, *, /, etc.)
export interface BinaryExpression {
  type: "BinaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
}

// Logical operations (UG, O, DILI)
export interface LogicalExpression {
  type: "LogicalExpression";
  operator: "UG" | "O" | "DILI";
  left: Expression;
  right?: Expression; // Optional for "DILI" (unary)
}

// Unary operations (+, -)
export interface UnaryExpression {
  type: "UnaryExpression";
  operator: "+" | "-";
  argument: Expression;
}

// Literal values (numbers, strings, booleans)
export interface Literal {
  type: "Literal";
  value: number | string | boolean;
}

// Variables (e.g., `x`)
export interface Identifier {
  type: "Identifier";
  name: string;
}

// Assignments (e.g., `x = 5`)
export interface AssignmentExpression {
  type: "AssignmentExpression";
  left: Identifier;
  right: Expression;
}

// Parentheses grouping (e.g., `(x + y)`)
export interface GroupedExpression {
  type: "GroupedExpression";
  expression: Expression;
}
