/**
 * Reusable skeleton placeholders with shimmer. Use while content is loading.
 */

const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

export function FeedItemSkeleton() {
  return (
    <div className="premium-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[85%]" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function EventCardSkeleton({ compact = false }) {
  if (compact) {
    return (
      <div className="premium-card flex gap-4 p-4">
        <Skeleton className="w-24 h-24 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-5 w-[75%]" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }
  return (
    <div className="premium-card overflow-hidden mb-6">
      <Skeleton className="h-52 w-full" />
      <div className="p-4 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-8 w-[80%]" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function MicroMeetCardSkeleton() {
  return (
    <div className="min-w-[300px] premium-card p-6 mr-4 space-y-4">
      <Skeleton className="h-6 w-32 rounded-full" />
      <Skeleton className="h-7 w-[80%]" />
      <Skeleton className="h-3 w-24" />
      <div className="flex justify-between items-end pt-4">
        <div className="flex -space-x-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-3 w-14 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
}

/** Horizontal strip of video thumb placeholders (e.g. Video Wall row) */
export function VideoWallRowSkeleton({ count = 4 }) {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-[140px] shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

/** Home tab: header + video row + section title + micro-meets + events */
export function HomeSkeleton() {
  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto pb-32 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
      </div>
      <VideoWallRowSkeleton count={4} />
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-8">
        <MicroMeetCardSkeleton />
        <MicroMeetCardSkeleton />
        <MicroMeetCardSkeleton />
      </div>
      <div>
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Hub tab: feed column + tribes sidebar */
export function HubSkeleton() {
  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto pb-32">
      <div className="mb-10 space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-4 w-24 mb-4" />
          <FeedItemSkeleton />
          <FeedItemSkeleton />
          <FeedItemSkeleton />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-4 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-[18px] shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
            <Skeleton className="h-12 w-full rounded-[20px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Explore tab: header + filters + event grid */
export function ExploreSkeleton() {
  return (
    <div className="p-5 md:p-10 max-w-7xl mx-auto pb-32">
      <div className="mb-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0">
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-28 shrink-0 rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </div>
  );
}

/** Profile tab: avatar, name, stats, cards */
export function ProfileSkeleton() {
  return (
    <div className="p-5 md:p-10 max-w-4xl mx-auto pb-32 space-y-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="text-center md:text-left">
          <Skeleton className="w-32 h-32 rounded-[32px] mx-auto md:mx-0 mb-4" />
          <Skeleton className="h-8 w-40 mx-auto md:mx-0 mb-2" />
          <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
        </div>
        <Skeleton className="w-28 h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Skeleton className="col-span-2 md:col-span-1 md:row-span-2 h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
}

export default Skeleton;
