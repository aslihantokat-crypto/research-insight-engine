import SearchClient from "./search-client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <SearchClient />
      </div>
    </main>
  );
}
