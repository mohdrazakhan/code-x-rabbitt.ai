import './globals.css'
import Navbar from '@/components/common/Navbar';

export default function Home() {
  return (
    <div className="h-full flex flex-col w-full">
      <Navbar />
      <main className="flex-grow">
        {/* Your main content here */}
      </main>
    </div>
  );
}
