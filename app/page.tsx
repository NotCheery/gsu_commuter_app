import MartaDebugger from '@/components/MartaDebugger';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">GSU Commute Helper</h1>
      
      {/* This is your test component running the loop */}
      <MartaDebugger />
      
    </main>
  );
}