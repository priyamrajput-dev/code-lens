// 1. Initialize Prism globally first
import Prism from "./prism-init";

// 2. Load grammar components in correct dependency order
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

export default Prism;
export { Prism };
