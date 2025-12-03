import Link from "next/link";
import HomeCta from "@/components/HomeCta";

function AnimatedCode() {
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #fff 1.5px, transparent 1.5px), radial-gradient(circle at 40% 70%, #fff 1px, transparent 1px)'
      }} />
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 gap-3 p-4 animate-float">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white">
            <pre className="whitespace-pre-wrap leading-5">{`// AI Coach hint\n${i%2? 'Use hashmap for O(n).':'Consider edge cases.'}`}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 mb-3">Interview prep • Competitive coding</span>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Code smarter with your AI coach</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Write real code, run in a sandbox, and get instant strengths, weaknesses, and a personalized learning roadmap.
          </p>
          <HomeCta />
          <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
            <span>Python • Java • C++ • JS</span>
            <span>Judge0 sandbox</span>
            <span>Gemini feedback</span>
          </div>
        </div>
        <AnimatedCode />
      </section>

      <section className="mt-16 grid md:grid-cols-3 gap-6">
        {[
          { title: 'Practice', desc: 'Curated problems or ask AI for one.' },
          { title: 'Run & Learn', desc: 'Compile safely. See stdout/stderr/time.' },
          { title: 'Improve', desc: 'Roadmaps, resources, and next problems.' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border p-5 hover:shadow-sm transition">
            <div className="text-sm text-blue-600 font-semibold mb-1">Step {i+1}</div>
            <div className="text-lg font-semibold">{c.title}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{c.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
