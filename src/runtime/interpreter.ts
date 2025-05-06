import {
  ASTNode,
  ProgramStatementNode,
  VariableDeclarationNode,
  VariableAssignmentNode,
  PrintStatementNode,
  InputStatementNode,
  ExpressionNode,
  UnaryExpressionNode,
  BinaryExpressionNode,
  IdentifierNode,
  LiteralNode,
  IfStatementNode,
  IfElseStatementNode,
  IfElseIfStatementNode,
  ForLoopStatementNode,
  CodeBlockNode,
} from "../parser/parser";

import { Environment } from "./environment";
import * as readline from "readline";

export class Interpreter {
  private env = new Environment();

  async run(node: ProgramStatementNode) {
    for (const statement of node.body) {
      await this.execute(statement);
    }
  }

  private async execute(node: ASTNode): Promise<any> {
    switch (node.type) {
      case "Declaration":
        return this.defineVariable(node);
      case "Assignment":
        return this.setVariable(node);
      case "Output":
        return this.output(node);
      case "Input":
        return this.input(node);
      case "If":
      case "IfElse":
      case "IfElseIf":
        return this.evaluateConditional(node);
      case "For":
        return this.evaluateLoop(node);
      case "Block":
        return this.executeBlock(node);
      default:
        throw new Error(`Unsupported AST node type: ${node.type}`);
    }
  }

  private defineVariable(node: VariableDeclarationNode) {
    for (const { name, value } of node.identifiers) {
      let evaluated =
        value !== undefined ? value : this.defaultForType(node.dataType);
      this.env.defineVariable(name, evaluated);
    }
  }

  private setVariable(node: VariableAssignmentNode) {
    const val = this.evaluateExpression(node.value);
    for (const name of node.targets) {
      this.env.setVariable(name, val);
    }
  }

  private output(node: PrintStatementNode) {
    const values = node.expressions.map((expr) =>
      this.evaluateExpression(expr)
    );
    process.stdout.write(values.join("") + "\n");
  }

  private async input(node: InputStatementNode) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = `Enter values for ${node.identifiers.join(", ")}: `;
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        const values = answer.split(",").map((s) => s.trim());
        node.identifiers.forEach((name, i) => {
          const raw = values[i];
          const parsed = /^\d+$/.test(raw) ? parseInt(raw) : raw;
          this.env.setVariable(name, parsed);
        });
        rl.close();
        resolve(true);
      });
    });
  }

  private evaluateExpression(expr: ExpressionNode): any {
    switch (expr.type) {
      case "Literal":
        return expr.value;
      case "Identifier":
        return this.env.getVariable(expr.name);
      case "UnaryExpression": {
        const value = this.evaluateExpression(expr.expression);
        switch (expr.operator) {
          case "-":
            return -value;
          case "+":
            return +value;
          case "DILI":
            return value === "OO" ? "DILI" : "OO";
        }
        break;
      }
      case "BinaryExpression": {
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);
        switch (expr.operator) {
          case "+":
            return Number(left) + Number(right);
          case "-":
            return Number(left) - Number(right);
          case "*":
            return Number(left) * Number(right);
          case "/":
            return Number(left) / Number(right);
          case "%":
            return Number(left) % Number(right);

          case "<":
            return left < right ? "OO" : "DILI";
          case ">":
            return left > right ? "OO" : "DILI";
          case "<=":
            return left <= right ? "OO" : "DILI";
          case ">=":
            return left >= right ? "OO" : "DILI";
          case "==":
            return left == right ? "OO" : "DILI";
          case "<>":
            return left != right ? "OO" : "DILI";
          case "UG":
            return left === "OO" && right === "OO" ? "OO" : "DILI";
          case "O":
            return left === "OO" || right === "OO" ? "OO" : "DILI";
        }
        break;
      }
    }
    throw new Error(`Unsupported expression: ${JSON.stringify(expr)}`);
  }

  private toNumber(value: any): number {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Expected a number, but got: ${value}`);
    }
    return num;
  }

  private async evaluateConditional(
    node: IfStatementNode | IfElseStatementNode | IfElseIfStatementNode
  ) {
    if (node.type === "If") {
      const cond = this.evaluateExpression(node.condition);
      if (cond === "OO") await this.executeBlock(node.thenBranch);
    } else if (node.type === "IfElse") {
      const cond = this.evaluateExpression(node.condition);
      await this.executeBlock(
        cond === "OO" ? node.thenBranch : node.elseBranch
      );
    } else if (node.type === "IfElseIf") {
      for (const branch of node.branches) {
        if (this.evaluateExpression(branch.condition) === "OO") {
          return this.executeBlock(branch.body);
        }
      }
      return this.executeBlock(node.elseBranch);
    }
  }

  private async evaluateLoop(node: ForLoopStatementNode) {
    this.setVariable(node.initializer);
    while (this.evaluateExpression(node.condition) === "OO") {
      await this.executeBlock(node.body);
      this.setVariable(node.increment);
    }
  }

  private async executeBlock(block: CodeBlockNode) {
    for (const stmt of block.statements) {
      await this.execute(stmt);
    }
  }

  private defaultForType(type: string): any {
    switch (type) {
      case "NUMERO":
        return 0;
      case "LETRA":
        return "";
      case "TINUOD":
        return "DILI";
      case "TIPIK":
        return 0.0;
      default:
        return null;
    }
  }
}
