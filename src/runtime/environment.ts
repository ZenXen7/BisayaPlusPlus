// src/runtime/environment.ts

export class Environment {
  private variables = new Map<string, any>();

  defineVariable(name: string, value: any) {
    //declare
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' already declared.`);
    }
    this.variables.set(name, value);
  }

  setVariable(name: string, value: any) {
    //assign
    if (!this.variables.has(name)) {
      throw new Error(`Variable ${name} not declared.`);
    }
    this.variables.set(name, value);
  }

  getVariable(name: string): any {
    //get
    if (!this.variables.has(name)) {
      throw new Error(`Variable ${name} not found.`);
    }
    return this.variables.get(name);
  }

  hasVariable(name: string): boolean {
    //has
    return this.variables.has(name);
  }
}
