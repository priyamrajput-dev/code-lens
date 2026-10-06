import { Marquee } from "@/components/motion/Marquee";
import { Terminal, Shield, GitBranch, Cpu, Code2, Layers, Binary, Box } from "lucide-react";
import { clsx } from "clsx";

interface TrustStripProps {
  className?: string;
}

const trustItems = [
  { name: "TypeScript 5.x", icon: <Terminal className="w-5 h-5" /> },
  { name: "Rust Core", icon: <Binary className="w-5 h-5" /> },
  { name: "Python 3.12", icon: <Code2 className="w-5 h-5" /> },
  { name: "Go Engine", icon: <Cpu className="w-5 h-5" /> },
  { name: "React 19", icon: <Layers className="w-5 h-5" /> },
  { name: "Node.js ESM", icon: <Box className="w-5 h-5" /> },
  { name: "Git Workflow", icon: <GitBranch className="w-5 h-5" /> },
  { name: "OWASP Top 10", icon: <Shield className="w-5 h-5" /> },
];

export function TrustStrip({ className }: TrustStripProps) {
  return (
    <div className={clsx("w-full py-8 select-none overflow-hidden", className)}>
      <p className="text-center text-caption uppercase tracking-widest text-stone font-medium mb-6">
        Trained on AST patterns across modern ecosystems
      </p>

      <Marquee speed={24} className="py-2">
        {trustItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 text-stone hover:text-ink-black transition-colors duration-200"
          >
            <span className="opacity-70">{item.icon}</span>
            <span className="font-mono text-small-ui tracking-tight font-medium">
              {item.name}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}