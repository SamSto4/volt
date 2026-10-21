import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShowcaseCard } from "./showcase";

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Alan Turing"];

/**
 * Labels, statuses and people. Every status says its state in words.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function BadgesCard({ className } = {}) {
  return (
    <ShowcaseCard
      className={className}
      id="badges"
      title="Badges, status and avatars"
      context="Lists · Teams"
      note="Status never relies on color: each has a word and an icon."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Beta</Badge>
        <Badge>Draft</Badge>
        <Badge variant="success">Published</Badge>
        <Badge variant="danger">Failed</Badge>
      </div>
      <div className="flex items-center gap-4">
        {/* Overlapping avatars, each named by the person's name (its alt text).
            The ring in the card's color keeps their edges apart. */}
        <ul aria-label="Editors" className="flex -space-x-2">
          {PEOPLE.map((name) => (
            <li key={name} className="rounded-full ring-2 ring-background">
              <Avatar name={name} />
            </li>
          ))}
        </ul>
        <p className="type-small text-muted-foreground">3 people can edit this page</p>
      </div>
    </ShowcaseCard>
  );
}
