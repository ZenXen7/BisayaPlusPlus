// src/runtime/environment.ts

export class Environment {
  private variables = new Map<string, any>();

  declare(name: string, value: any) {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' already declared.`);
    }
    this.variables.set(name, value);
  }

  assign(name: string, value: any) {
    if (!this.variables.has(name)) {
      throw new Error(`Variable '${name}' not declared.`);
    }
    this.variables.set(name, value);
  }

  get(name: string): any {
    if (!this.variables.has(name)) {
      throw new Error(`Variable '${name}' not found.`);
    }
    return this.variables.get(name);
  }

  has(name: string): boolean {
    return this.variables.has(name);
  }
}
