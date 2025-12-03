"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Tips from './LearnX-Options/Tips';
import Quiz from './LearnX-Options/Quiz';
import Roadmap from './LearnX-Options/Roadmap';

export default function LearnX({ language, sourceCode }) {
  const [activeTab, setActiveTab] = useState('tips');

  return (
    <div className="h-full w-full bg-zinc-900 p-4 ">
      <div className="h-full w-full bg-zinc-800 rounded-lg overflow-auto scrollbar-thin flex flex-col">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-none bg-zinc-800 p-0 h-10 border-b border-zinc-700">
            <TabsTrigger 
              value="tips" 
              className="rounded-none h-full data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Tips
            </TabsTrigger>
            <TabsTrigger 
              value="quiz" 
              className="rounded-none h-full data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Quiz
            </TabsTrigger>
            <TabsTrigger 
              value="roadmap" 
              className="rounded-none h-full data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Roadmap
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tips" className="flex-1 overflow-auto m-0 p-0 scrollbar-thin">
            <Tips language={language} sourceCode={sourceCode} />
          </TabsContent>
          
          <TabsContent value="quiz" className="flex-1 overflow-auto m-0 p-0 scrollbar-thin">
            <Quiz language={language} />
          </TabsContent>
          
          <TabsContent value="roadmap" className="flex-1 w-full h-full m-0 p-0">
            <Roadmap language={language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}