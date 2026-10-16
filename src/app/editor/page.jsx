import { Editor } from "@/editor/editor";

/** @type {import("next").Metadata} */
export const metadata = {
  title: "Editor · Volt",
  description: "Drop real components into a real page, then copy the exact code.",
};

export default function EditorPage() {
  return (
    <>
      {/* The editor's own controls carry the page; this heading names it for
          screen-reader users navigating by heading. */}
      <h1 className="sr-only">Page editor</h1>
      <Editor />
    </>
  );
}
