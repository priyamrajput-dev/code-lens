import Prism from "prismjs";

// Ensure global scope has Prism for any third-party references
if (typeof window !== "undefined") {
  (window as unknown as { Prism: typeof Prism }).Prism = Prism;
}
if (typeof globalThis !== "undefined") {
  (globalThis as unknown as { Prism: typeof Prism }).Prism = Prism;
}

// 1. TypeScript & TSX grammar extensions on top of core JavaScript
if (Prism.languages.javascript) {
  Prism.languages.typescript = Prism.languages.extend("javascript", {
    keyword:
      /\b(?:abstract|as|asserts|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|new|null|of|package|private|protected|public|readonly|return|set|static|super|switch|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield)\b/,
    builtin:
      /\b(?:string|number|boolean|any|void|unknown|never|object|symbol|bigint|Array|Record|Promise|Map|Set|Date|RegExp|Error|Function)\b/,
  });
  Prism.languages.ts = Prism.languages.typescript;
  Prism.languages.tsx = Prism.languages.typescript;
  Prism.languages.jsx = Prism.languages.javascript;
}

// 2. Python grammar
Prism.languages.python = {
  comment: { pattern: /(^|[^\\])#.*/, lookbehind: true },
  string: {
    pattern: /(?:[bruf]|ur|br|fr|rf)?(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
    greedy: true,
  },
  keyword:
    /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
  builtin:
    /\b(?:True|False|None|self|int|float|str|list|dict|set|tuple|bool|len|range|open|print)\b/,
  boolean: /\b(?:True|False)\b/,
  number:
    /(?:\b0[xX][0-9a-fA-F]+|\b0[bB][01]+|\b0[oO][0-7]+|(?:\b\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\b/,
  operator: /[-+*\/%&|^~=<>]=?|\/\/=?|\*\*=/,
  punctuation: /[{}[\];(),.:]/,
};
Prism.languages.py = Prism.languages.python;

// 3. Bash & Shell grammar
Prism.languages.bash = {
  comment: { pattern: /(^|[\s#])#.*/, lookbehind: true },
  string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true },
  variable: /\$[_a-zA-Z0-9]+|\$\{[^}]+\}/,
  keyword:
    /\b(?:if|then|else|elif|fi|for|while|in|do|done|case|esac|function|return|exit|export|source|local)\b/,
  builtin:
    /\b(?:cd|echo|ls|cat|mkdir|rm|cp|mv|touch|grep|curl|bun|npm|pnpm|yarn|git|node|npx)\b/,
  operator: /&&|\|\||>>|>|<|\||&/,
  punctuation: /[{}[\];(),.:]/,
};
Prism.languages.sh = Prism.languages.bash;
Prism.languages.zsh = Prism.languages.bash;
Prism.languages.shell = Prism.languages.bash;

// 4. JSON grammar
Prism.languages.json = {
  property: {
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
    lookbehind: true,
    greedy: true,
  },
  string: {
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
    lookbehind: true,
    greedy: true,
  },
  number: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/,
  punctuation: /[{}[\],:]/,
  operator: /:/,
  boolean: /\b(?:true|false)\b/,
  null: /\bnull\b/,
};

// 5. SQL grammar
Prism.languages.sql = {
  comment: { pattern: /(^|[^\\])(?:--.*|\/\*[\s\S]*?\*\/)/, lookbehind: true },
  string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true },
  keyword:
    /\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|CREATE|TABLE|DROP|ALTER|ADD|INDEX|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|DEFAULT|AND|OR|AS|IN|ON|SET|VALUES|INTO|CASE|WHEN|THEN|ELSE|END|UNION|ALL|DISTINCT|EXISTS|BETWEEN|LIKE|IS)\b/i,
  boolean: /\b(?:TRUE|FALSE|NULL)\b/i,
  number: /\b\d+(?:\.\d+)?\b/,
  operator: /[-+*\/%=<>]=?|!=|<>|&&|\|\|/,
  punctuation: /[();,.]/,
};

// 6. Go & Rust aliases (fallback to clike)
if (Prism.languages.clike) {
  Prism.languages.go = Prism.languages.clike;
  Prism.languages.rust = Prism.languages.clike;
  Prism.languages.rs = Prism.languages.clike;
  Prism.languages.golang = Prism.languages.clike;
  Prism.languages.diff = Prism.languages.clike;
  Prism.languages.yaml = Prism.languages.javascript;
  Prism.languages.yml = Prism.languages.javascript;
  Prism.languages.markdown = Prism.languages.markup;
  Prism.languages.md = Prism.languages.markup;
}

export default Prism;
export { Prism };
