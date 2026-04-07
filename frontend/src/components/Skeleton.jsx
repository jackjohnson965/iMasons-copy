/**
 * Skeleton — Reusable loading placeholder components
 *
 * Usage:
 *   <Skeleton.Line />                  — single text line
 *   <Skeleton.Line w="w-32" h="h-5" /> — custom size
 *   <Skeleton.Circle size="w-12 h-12" />
 *   <Skeleton.Card />                  — card with header + 2 lines
 *   <Skeleton.TableRow cols={5} />     — table row with N cells
 */

function Line({ w = 'w-full', h = 'h-4', className = '' }) {
  return (
    <div className={`${w} ${h} bg-white/[0.06] rounded animate-pulse ${className}`} />
  );
}

function Circle({ size = 'w-10 h-10', className = '' }) {
  return (
    <div className={`${size} bg-white/[0.06] rounded-full animate-pulse ${className}`} />
  );
}

function Card({ className = '' }) {
  return (
    <div className={`bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 space-y-3 ${className}`}>
      <Line w="w-2/5" h="h-5" />
      <Line w="w-full" h="h-3" />
      <Line w="w-3/4" h="h-3" />
    </div>
  );
}

function TableRow({ cols = 4, className = '' }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${className}`}>
      {Array.from({ length: cols }).map((_, i) => (
        <Line
          key={i}
          w={i === 0 ? 'w-10' : i === 1 ? 'w-40' : 'w-24'}
          h="h-3"
        />
      ))}
    </div>
  );
}

function PageHeader({ className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <Line w="w-24" h="h-3" />
      <Line w="w-64" h="h-8" />
      <Line w="w-48" h="h-4" />
    </div>
  );
}

function PillarGrid({ count = 4, className = '' }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 space-y-3">
          <Circle size="w-8 h-8" />
          <Line w="w-16" h="h-7" />
          <Line w="w-20" h="h-3" />
        </div>
      ))}
    </div>
  );
}

function JobCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 border-l-[3px] border-l-white/[0.06] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Line w="w-48" h="h-5" />
            <Line w="w-20" h="h-5" className="rounded-full" />
          </div>
          <div className="flex gap-4">
            <Line w="w-24" h="h-3" />
            <Line w="w-20" h="h-3" />
          </div>
          <Line w="w-full" h="h-3" />
          <Line w="w-2/3" h="h-3" />
        </div>
        <Line w="w-20" h="h-9" className="rounded-lg shrink-0" />
      </div>
    </div>
  );
}

function StudentCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-brand-dark-card border border-white/[0.06] rounded-xl p-5 border-l-[3px] border-l-white/[0.06] ${className}`}>
      <div className="flex items-start gap-3">
        <Circle size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Line w="w-36" h="h-5" />
          <Line w="w-24" h="h-3" />
          <Line w="w-full" h="h-3" />
          <div className="flex gap-2 pt-1">
            <Line w="w-14" h="h-5" className="rounded-full" />
            <Line w="w-16" h="h-5" className="rounded-full" />
            <Line w="w-12" h="h-5" className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-brand-dark-card border border-white/[0.06] rounded-xl p-6 space-y-3 ${className}`}>
      <Line w="w-3/5" h="h-5" />
      <Line w="w-full" h="h-3" />
      <Line w="w-4/5" h="h-3" />
      <Line w="w-28" h="h-4" className="mt-2" />
    </div>
  );
}

const Skeleton = {
  Line,
  Circle,
  Card,
  TableRow,
  PageHeader,
  PillarGrid,
  JobCard: JobCardSkeleton,
  StudentCard: StudentCardSkeleton,
  ResourceCard: ResourceCardSkeleton,
};

export default Skeleton;
