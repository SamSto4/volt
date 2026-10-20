import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

export default function Example() {
  return (
    <SkeletonGroup label="Loading article">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </SkeletonGroup>
  );
}
