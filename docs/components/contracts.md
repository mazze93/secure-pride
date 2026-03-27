# Frozen component API contracts

**Purpose:** Prevent sneaky API drift. These components are treated as *frozen contracts*.

**Hard rule:** Changing props/components? You must:

- Update this doc with the new contract
- Add a BEFORE/AFTER snippet in the PR description

## `BlogCard`
Source: `securepride-landing-bundle/site/src/components/blog/BlogCard.astro`

### Props
- `entry: CollectionEntry<'blog'>`

### Contract
- Reads `entry.data` fields: `title`, `description`, `pubDate`, `image`, `imageAlt`, `tags`
- Links to `/blog/${entry.slug}`

## `PostMeta`
Source: `securepride-landing-bundle/site/src/components/blog/PostMeta.astro`

### Props
- `pubDate: Date`
- `author?: string`
- `tags?: string[]`

### Contract
- Default `author = 'Secure Pride'`
- Formats date using `toLocaleDateString('en-US')`

## `Triptych`
Source: `securepride-landing-bundle/site/src/components/blog/Triptych.astro`

### Props
- `panels: Array<{ src: string; alt: string; caption?: string }>`
- `label?: string`

### Contract
- Must receive **exactly 3 panels**; throws if `panels.length !== 3`

---

## Definition of done
- [ ] Contract updates made here
- [ ] PR description includes BEFORE/AFTER snippet
- [ ] Any consumer breakages are called out explicitly
