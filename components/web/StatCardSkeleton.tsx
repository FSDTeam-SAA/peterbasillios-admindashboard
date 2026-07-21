export function StatCardSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-4 rounded-lg bg-[#0070660D] p-6">
      <div className="h-[64px] w-[64px] flex-shrink-0 rounded-full bg-[#D9EAE8]" />
      <div className="flex-1 space-y-4 pt-1">
        <div className="h-5 w-32 rounded bg-[#D9EAE8]" />
        <div className="h-10 w-20 rounded bg-[#C6DEDB]" />
      </div>
    </div>
  );
}
