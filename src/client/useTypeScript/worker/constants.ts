import ts from 'typescript';

export const compilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  lib: ['dom', 'es2022'],

  // Disable warnings around "Any type".
  noImplicitAny: false,

  // Disable warnings around "Implicit any in parameter".
  noImplicitThis: false,

  // Allow JavaScript files to be processed
  allowJs: true,

  // Disable type checking for JavaScript files
  // checkJs: false,

  // Skip type checking of declaration files
  skipLibCheck: true,

  // Support React JSX
  jsx: ts.JsxEmit.React,
};

// Be less aggressive for non-TS files,
// e.g. files that end in .js or .jsx.
// if (!isTS(fileName)) {
// This code is for errors like:
// "Binding element 'data' implicitly has an 'any' type."
const LINT_ERROR_CODE_ANY = 7031;

// This code is for errors like:
// "Parameter 'selection' implicitly has an 'any' type.""
const LINT_ERROR_CODE_ANY_PARAM = 7006;

// This code is for errors like:
// "Cannot find module 'd3' or its corresponding type declarations."
const LINT_ERROR_CODE_IMPORT = 2307;

// This code is for errors like:
// "Variable 'mic' implicitly has type 'any' in some locations where its type cannot be determined."
const LINT_ERROR_CODE_ANY_TYPE = 7034;

// "Element implicitly has an 'any' type because expression
// of type '"test"' can't be used to index type '{}'."
const LINT_ERROR_CODE_ANY_TYPE_KEYS = 7053;

// "Property 'id' does not exist on type { ... }"
// Happens on objects with dynamic keys.
// Not valid in TypeScript, but common in JavaScript.
const LINT_ERROR_CODE_NON_EXISTENT_PROPERTY = 2339;

// "Type 'Set<unknown>' can only be iterated through when using the '--downlevelIteration'
// flag or with a '--target' of 'es2015' or higher."
const LINT_ERROR_CODE_ITERATED_THROUGH = 2802;

// Argument of type '{ Month: string; High: number; Temp: number; Low: number; }'
// is not assignable to parameter of type 'never'.
const LINT_ERROR_CODE_ASSIGNABLE_TO_NEVER = 2345;

// Cannot find name 'd3'.
export const LINT_ERROR_CODE_CANNOT_FIND_NAME = 2304;

// Type '{}' is missing the following properties from type '{ indx:
//Ignore specific TypeScript warning on object reassignment
const LINT_ERROR_CODE_OBJ_REASSINGMENT = 2739;

// Type 'any' is not assignable to type 'never'.
const LINT_ERROR_CODE_ANY_NOT_ASSIGNABLE_TO_NEVER = 2322;

// This code is for errors like:
// "Object is of type 'unknown'."
const LINT_ERROR_CODE_UNKNOWN = 18046;
const LINT_ERROR_CODE_UNKNOWN_SYMBOL_ITERATOR = 2488;

export const excludedErrorCodes = new Set([
  LINT_ERROR_CODE_ANY,
  LINT_ERROR_CODE_IMPORT,
  LINT_ERROR_CODE_ANY_PARAM,
  LINT_ERROR_CODE_ANY_TYPE,
  LINT_ERROR_CODE_ANY_TYPE_KEYS,
  LINT_ERROR_CODE_NON_EXISTENT_PROPERTY,
  LINT_ERROR_CODE_ITERATED_THROUGH,
  LINT_ERROR_CODE_ASSIGNABLE_TO_NEVER,
  LINT_ERROR_CODE_OBJ_REASSINGMENT,
  LINT_ERROR_CODE_ANY_NOT_ASSIGNABLE_TO_NEVER,
  LINT_ERROR_CODE_UNKNOWN,
  LINT_ERROR_CODE_UNKNOWN_symboliterator,

]);
