# 0002. Component manifests as plain data plus a Zod props schema

- Status: accepted
- Date: 2026-10-16

## Context

Five parts of the app need to know about each component: the catalog, the palette, the inspector, codegen and the `/r` registry. If each kept its own copy of a component's props, defaults or install info, the copies would drift. CLAUDE.md makes the manifest the single source of truth; this ADR records its shape.

## Decisions and the alternatives we didn't take

1. **Manifests don't import the React component.** A separate map links `"button"` to `<Button>`.
   *Alternative:* put the component in the manifest. That's simpler to wire, but every importer, including codegen (which must stay free of React), server routes and build scripts, would load React and the DOM.
   *Cost:* two files per component. A test will check that the two lists match once the component map exists.

2. **The inspector reads `z.toJSONSchema(props)`.**
   *Alternative:* walk Zod's internal classes directly. That's more flexible, but internals change between Zod versions, and JSON Schema is a public, documented format. Field labels come from `.meta({ title })`.
   *Cost:* only simple props (string, number, boolean, enum) get automatic fields at first. Arrays need a dedicated editor.

3. **Components and slots match by kind (`fits` / `accepts`), not by name.**
   *Alternative:* each slot lists the component names it allows. That's explicit, but every new component means editing every page template.
   *Cost:* kinds can drift. The list is a closed enum (`SLOT_KINDS`), so a typo fails validation.

4. **Every prop has a default.** `props.parse({})` always succeeds, so a block created by drag, click, keyboard or AI starts valid. A test enforces it for every manifest.

5. **How a manifest describes its generated code is left out for now.** It belongs to the "template vs AST codegen" ADR, and the codegen PR adds a `code` field.

## Consequences

- `defineManifest` validates each manifest when it's imported, so a broken manifest fails immediately with a message naming it.
- Rules the shape can't express (defaults, valid variants, a title on every prop, every manifest file listed) live in `src/registry/manifests.test.js` and run over every manifest automatically.
- Each component file exports its props schema (`buttonProps`), so the component can derive its prop types with `z.infer` instead of restating them.
