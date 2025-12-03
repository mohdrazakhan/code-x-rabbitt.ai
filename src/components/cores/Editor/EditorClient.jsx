// Update EditorClient.jsx
"use client";

import { useState } from "react";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import MonacoEditor from "../Extras/Monaco";
import LearnX from "../Extras/LearnX";
import Console from "../Extras/Console";
import {apiService} from "@/lib/apiService";

export default function EditorClient() {
  const [code, setCode] = useState("#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}");
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [language, setLanguage] = useState("cpp");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      // Clear previous logs
      setConsoleLogs([]);
      
      // Call the API service to compile and run the code
      const result = await apiService.compileCode({
        language,
        sourceCode: code,
        stdin: '' // Empty stdin for now
      });
      
      // Process Judge0 response
      const output = [];
      
      if (result.stdout) {
        output.push(result.stdout);
      }
      
      if (result.stderr) {
        output.push('STDERR:');
        output.push(result.stderr);
      }
      
      if (result.compile_output) {
        output.push('Compilation Output:');
        output.push(result.compile_output);
      }
      
      if (result.status && result.status.description) {
        output.push(`Status: ${result.status.description}`);
      }
      
      // Display the output
      if (output.length > 0) {
        setConsoleLogs(output);
      } else {
        setConsoleLogs(['Code executed successfully with no output']);
      }
    } catch (error) {
      console.error('Run error:', error);
      const errorOutput = [`Error: ${error.message}`];
      if (error.details) {
        errorOutput.push('Details:', JSON.stringify(error.details, null, 2));
      }
      setConsoleLogs(errorOutput);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen w-full bg-zinc-900 text-zinc-100 flex flex-col">
      {/* Top Bar with Run Button */}
      {/* <div className="h-16 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between px-4">
        <h2 className="text-lg font-medium text-zinc-300">Code X Editor</h2>
        {/* <button
          onClick={handleRun}
          className="px-6 py-2 rounded-md bg-blue-500 text-white cursor-pointer font-medium hover:bg-blue-400 transition-colors"
        >
          Run
        </button> */}
      {/* </div> */}
      
      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
                <h2 className="text-sm font-medium text-zinc-300">Code X</h2>
              </div>
              <div className="flex-1">
                <MonacoEditor 
                  code={code} 
                  onChange={setCode}
                  onLanguageChange={(lang) => setLanguage(lang)}
                  onRunCode={handleRun}
                  isRunning={isRunning}
                  language={language}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-zinc-800 hover:bg-zinc-700 transition-colors" withHandle />

          {/* Preview/Output Panel */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col border-l border-zinc-800">
                  <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
                    <h2 className="text-sm font-medium text-zinc-300">Learn</h2>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <LearnX language={language} sourceCode={code} />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-1 bg-zinc-800 hover:bg-zinc-700 transition-colors" withHandle />

              <ResizablePanel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col border-l border-zinc-800">
                  <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
                    <h2 className="text-sm font-medium text-zinc-300">Console</h2>
                  </div>
                  <div className="flex-1 overflow-hidden h-full">
                    <Console logs={consoleLogs} isLoading={isRunning} />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}