import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";

export default function Example() {
  return (
    <SkeletonGroup label="Loading this week's numbers">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </SkeletonGroup>
  );
}
