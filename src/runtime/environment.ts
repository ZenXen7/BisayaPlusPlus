export class Environment {
  private variables = new Map<string, any>();

  defineVariable(name: string, value: any) {
    if (this.variables.has(name)) {
      throw new Error(`Variable '${name}' already declared.`);
    }
    this.variables.set(name, value);
  }

  setVariable(name: string, value: any) {
    if (!this.variables.has(name)) {
      throw new Error(`Variable ${name} not declared.`);
    }
    this.variables.set(name, value);
  }

  getVariable(name: string): any {
    if (!this.variables.has(name)) {
      throw new Error(`Variable ${name} not found.`);
    }
    return this.variables.get(name);
  }

  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }
}
