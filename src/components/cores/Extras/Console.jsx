"use client";

import { Terminal } from "@/components/ui/terminal";
import { useEffect, useState } from "react";

export default function Console({ logs = [], isLoading = false }) {
  const [terminalContent, setTerminalContent] = useState("// Console is ready. Run your code to see the output here.");

  useEffect(() => {
    if (isLoading) {
      setTerminalContent("// Executing code...");
      return;
    }

    if (logs && logs.length > 0) {
      setTerminalContent(logs.join('\n'));
    } else {
      setTerminalContent("// No output to display");
    }
  }, [logs, isLoading]);

  return (
    <div className="h-full w-full bg-zinc-900 p-4">
      <Terminal className="h-full w-full bg-zinc-800 rounded-lg">
        {terminalContent}
      </Terminal>
    </div>
  );
}