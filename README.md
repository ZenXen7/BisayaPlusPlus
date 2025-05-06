# Bisaya++ Programming Language

**Bisaya++** is a Cebuano-based high-level, strongly-typed interpreted programming language designed to teach the basics of programming to native Cebuano speakers. It features a simple syntax, familiar keywords, and clear semantics that make it accessible for beginners.

---

## 🌟 Features

- ✅ Strongly-typed and beginner-friendly
- ✅ Cebuano syntax and native keywords
- ✅ Supports arithmetic and logical operations
- ✅ Conditional and loop control structures
- ✅ Formatted output and input commands
- ✅ Easy-to-understand syntax using `SUGOD` and `KATAPUSAN` blocks

---

## 📚 Language Specification

### ➤ Data Types
- **NUMERO** – whole numbers (4 bytes)
- **TIPIK** – decimal numbers
- **LETRA** – a single character
- **TINUOD** – boolean (`"OO"` for true, `"DILI"` for false)

### ➤ Operators
- **Arithmetic:** `+`, `-`, `*`, `/`, `%`
- **Comparison:** `>`, `<`, `>=`, `<=`, `==`, `<>`
- **Logical:** `UG` (AND), `O` (OR), `DILI` (NOT)
- **Concatenation:** `&`
- **Special Tokens:** `$` (newline), `[]` (escape)

### ➤ Syntax Rules
- Program starts with `SUGOD` and ends with `KATAPUSAN`
- Variable declarations use `MUGNA`
- Output uses `IPAKITA`
- Input uses `DAWAT`
- Use `--` for comments
- Reserved words are UPPERCASE and cannot be variable names

---

## 💻 Sample Program

```bisaya
-- this is a sample program in Bisaya++
SUGOD  
MUGNA NUMERO x, y, z=5  
MUGNA LETRA a_1='n'  
MUGNA TINUOD t="OO"  
x=y=4 
a_1='c' -- this is a comment 
IPAKITA: x & t & z & $ & a_1 & [#] & "last" 
KATAPUSAN
