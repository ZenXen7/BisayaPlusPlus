import { tokenize } from "../lexer/tokenizer";
import { Parser } from "../parser/parser";
import { Interpreter } from "../runtime/interpreter";

function captureOutput(callback: () => Promise<void>): Promise<string> {
  return new Promise(async (resolve) => {
    const originalWrite = process.stdout.write;
    let output = "";
    (process.stdout.write as any) = (chunk: string) => {
      output += chunk;
    };

    try {
      await callback();
    } finally {
      process.stdout.write = originalWrite;
    }

    resolve(output.trim());
  });
}

describe("Interpreter", () => {
  const runProgram = async (program: string): Promise<string> => {
    const tokens = tokenize(program);
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter();
    const output = await captureOutput(async () => {
      await interpreter.run(ast);
    });
    return output.trim();
  };

  it("should handle variable declarations, reassignment, and output", async () => {
    const program = `
SUGOD  
    MUGNA NUMERO x, y, z=5  
    MUGNA LETRA a_1='n'  
    MUGNA TINUOD t="OO"  
    x=y=4 
    a_1='c' -- this is a comment 
    IPAKITA: x & t & z & $ & a_1 & [#] & "last" 
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("4OO5\nc#last");
  });

  it("should evaluate arithmetic expressions correctly", async () => {
    const program = `
SUGOD 
    MUGNA NUMERO xyz, abc=100 
    xyz= ((abc *5)/10 + 10) * -1 
    IPAKITA: [[] & xyz & []] 
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("[-60]");
  });

  it("should evaluate boolean expressions with logical and relational operators", async () => {
    const program = `
SUGOD 
MUGNA NUMERO a=100, b=200, c=300  
MUGNA TINUOD d="DILI"  
d = (a < b UG c <> 200) 
IPAKITA: d 
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("OO");
  });

  it("should evaluate logical AND between two booleans", async () => {
    const program = `
SUGOD
  MUGNA TINUOD x = "OO", y = "DILI"
  IPAKITA: x UG y
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("DILI");
  });

  it("should handle if (KUNG) condition that is true", async () => {
    const program = `
SUGOD
  MUGNA NUMERO a=5
  KUNG (a == 5)
  PUNDOK {
    IPAKITA: "YES"
  }
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("YES");
  });

  it("should handle if-else (KUNG-WALA) condition", async () => {
    const program = `
SUGOD
  MUGNA NUMERO a = 10
  KUNG (a < 5)
  PUNDOK {
    IPAKITA: "small"
  }
  KUNG WALA
  PUNDOK {
    IPAKITA: "big"
  }
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("big");
  });

  it("should handle for loop (ALANG SA)", async () => {
    const program = `
SUGOD
  MUGNA NUMERO i = 0
  ALANG SA (i = 1, i <= 3, i++)
  PUNDOK {
    IPAKITA: i
  }
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("1\n2\n3");
  });

  it("should evaluate all arithmetic operations", async () => {
    const program = `
SUGOD
MUGNA NUMERO a=5, b=3
IPAKITA: a + b & $ & a - b & $ & a * b & $ & a / b
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("8\n2\n15\n1.6666666666666667");
  });

  it("should evaluate boolean AND and OR", async () => {
    const program = `
SUGOD
MUGNA TINUOD x = OO, y = DILI
IPAKITA: x UG y & $ & x O y
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("DILI\nOO");
  });

  it("should evaluate all comparison operators", async () => {
    const program = `
SUGOD
MUGNA NUMERO m=10, n=20
IPAKITA: m < n & $ & m > n & $ & m == n & $ & m <> n
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("OO\nDILI\nDILI\nOO");
  });

  it("should evaluate NOT operator", async () => {
    const program = `
SUGOD
MUGNA TINUOD a = OO, b = DILI
IPAKITA: DILI a & $ & DILI b
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("DILI\nOO");
  });

  it("should compute with floating point variables (TIPIK)", async () => {
    const program = `
SUGOD
MUGNA TIPIK pi = 3.14, r = 2.0
IPAKITA: pi * r * r
KATAPUSAN
    `;
    const output = await runProgram(program);
    expect(output).toBe("12.56");
  });
});
