"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { id: "cpp", name: "C++", defaultCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}" },
  { id: "java", name: "Java", defaultCode: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n}" },
  { id: "javascript", name: "JavaScript", defaultCode: "console.log('Hello World!');" },
  { id: "python", name: "Python", defaultCode: "print('Hello World!')" }
];

// Dynamically import the Monaco editor with SSR disabled
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => {
    // Define the theme when the component is loaded on the client side
    if (typeof window !== "undefined") {
      window.MonacoEnvironment = {
        getWorker: function (moduleId, label) {
          if (label === 'json') {
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url));
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url));
          }
          if (label === 'typescript' || label === 'javascript') {
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url));
          }
          return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
        }
      };

      return mod.default;
    }
  }),
  { ssr: false, loading: () => <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
      <div className="text-zinc-400">Loading editor...</div>
    </div> }
);

export default function CodeEditor({ 
  code, 
  onChange, 
  onLanguageChange,
  isRunning = false,
  onRunCode,
  language: propLanguage
}) {
  const [language, setLanguage] = useState(propLanguage || "cpp");
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    // Define a custom theme
    monaco.editor.defineTheme('vs-dark-zinc', {
      base: 'vs-dark',
      
    })
  };

  const handleEditorChange = (value) => {
  if (onChange) {
    onChange(value);
  }
};

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning && isEditorReady && onRunCode) {
            onRunCode(editorRef.current.getValue());
        }}
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
    // Update code to default for the new language
    const langConfig = LANGUAGES.find(lang => lang.id === newLanguage);
    if (langConfig && onChange) {
      onChange(langConfig.defaultCode);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (propLanguage && propLanguage !== language) {
      setLanguage(propLanguage);
    }
  }, [propLanguage, language]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-zinc-800 px-4 py-2 flex justify-between items-center border-b border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-300">Editor</h3>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isRunning}
                className="bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600 hover:border-zinc-500"
              >
                {LANGUAGES.find(lang => lang.id === language)?.name || "Select Language"}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
              <DropdownMenuRadioGroup 
                value={language} 
                onValueChange={handleLanguageChange}
              >
                {LANGUAGES.map((lang) => (
                  <DropdownMenuRadioItem 
                    key={lang.id} 
                    value={lang.id}
                    className="text-zinc-200 hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    {lang.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <button
            onClick={() => onRunCode && onRunCode(code)}
            disabled={isRunning || !isEditorReady}
            className={`px-3 py-1 text-sm rounded-md cursor-pointer font-medium transition-colors ${
              isRunning || !isEditorReady
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden" onKeyDown={handleKeyDown} tabIndex={0}>
        <MonacoEditor
          height="100%"
          defaultLanguage={language}
          language={language}
          theme="vs-dark-zinc"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            padding: { top: 10 },
            readOnly: isRunning,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            contextmenu: true,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              arrowSize: 20
            },
            renderLineHighlight: 'all',
          }}
          onMount={(editor, monaco) => {
            setIsEditorReady(true);
            
            // Add custom theme
            monaco.editor.defineTheme('vs-dark-zinc', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'a78bfa' },
                { token: 'string', foreground: '34d399' },
                { token: 'number', foreground: 'f472b6' },
                { token: 'delimiter.bracket', foreground: 'e5e7eb' },
              ],
              colors: {
                'editor.background': '#18181b',
                'editor.foreground': '#f4f4f5',
                'editor.lineHighlightBackground': '#1f1f23',
                'editor.lineHighlightBorder': '#2d2d35',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#9ca3af',
                'editor.selectionBackground': '#3b82f6',
                'editor.inactiveSelectionBackground': '#3b82f640',
                'editorCursor.foreground': '#f4f4f5',
                'editorWhitespace.foreground': '#3f3f46',
                'editorIndentGuide.background': '#2d2d35',
                'editorIndentGuide.activeBackground': '#3f3f46',
                'editor.selectionHighlightBackground': '#3b82f620',
                'editor.findMatchBackground': '#f59e0b80',
                'editor.findMatchHighlightBackground': '#f59e0b40',
                'editorBracketMatch.background': '#3b82f640',
                'editorBracketMatch.border': '#3b82f6',
              },
            });
            
            // Apply the theme
            monaco.editor.setTheme('vs-dark-zinc');
            
            // Add custom keybindings
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => {
                if (onRunCode && !isRunning) {
                  onRunCode(editor.getValue());
                }
              }
            );
            
            // Focus the editor when mounted
            editor.focus();
          }}
        />
      </div>
    </div>
  );
}