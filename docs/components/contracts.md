# Frozen Component API Contracts

**Purpose:** Prevent sneaky API drift. These components are treated as *frozen contracts*.

**Hard rule:** Changing props or component behavior? You must:

- Update this doc with the new contract
- Add a BEFORE/AFTER snippet in the PR description
- Call out any consumer breakages explicitly

---

## `BlogCard`

**Source:** `site/src/components/blog/BlogCard.astro`  
**Usage context:** Renders a single blog post preview card. Used in grid/list layouts on the blog index page.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `entry` | `CollectionEntry<'blog'>` | Yes | Full Astro content collection entry for a blog post |

### Destructured fields from `entry.data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Post title, rendered in `<h2>` |
| `description` | `string` | Yes | Short summary shown below title |
| `pubDate` | `Date` | Yes | Publication date, formatted as `MMM D, YYYY` |
| `image` | `string` | No | URL of hero image (optional) |
| `imageAlt` | `string` | No | Alt text for hero image |
| `tags` | `string[]` | No | Array of tag strings rendered as `<TagPill>` components |

### Example usage

```astro
---
import BlogCard from '@/components/blog/BlogCard.astro';
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
---
{posts.map((entry) => <BlogCard entry={entry} />)}
```

### Constraints

- Accepts exactly one prop: `entry` (the full `CollectionEntry<'blog'>` object)
- The internal href is always `/blog/${entry.slug}` — do not add a `href` prop
- Image is rendered at `width=640 height=360` with `loading="lazy"` and `decoding="async"`
- Date is always formatted with `toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`

### Allowed variations

- `image` and `imageAlt` are optional; the image block is conditionally rendered
- `tags` is optional; the tag list is conditionally rendered when `tags.length > 0`

### Public CSS classes (styling contract)

- `.blog-card` — root `<article>` element
- `.blog-card__image` — hero image
- `.blog-card__body` — content container
- `.blog-card__tags` — tag list `<ul>`
- `.blog-card__title` — post title `<h2>`
- `.blog-card__description` — description `<p>`
- `.blog-card__date` — formatted date `<time>`

---

## `PostMeta`

**Source:** `site/src/components/blog/PostMeta.astro`  
**Usage context:** Displays author byline, publication date, and tags on a full blog post page.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `pubDate` | `Date` | Yes | — | Publication date of the post |
| `author` | `string` | No | `'Secure Pride'` | Author display name |
| `tags` | `string[]` | No | `[]` | Array of tag strings |

### Example usage

```astro
---
import PostMeta from '@/components/blog/PostMeta.astro';
---
<PostMeta
  pubDate={new Date('2026-01-15')}
  author="Mazze"
  tags={['privacy', 'security']}
/>
```

### Constraints

- `pubDate` is required; all other props are optional
- Date is always formatted with `toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })`
- Default author falls back to `'Secure Pride'` when omitted
- Tags are rendered via `<TagPill tag={tag} />` with `tag={true}` attribute

### Allowed variations

- `author` can be any string; omit to use the default
- `tags` array can be empty or omitted; tag list is conditionally rendered

### Public CSS classes (styling contract)

- `.post-meta` — root container
- `.post-meta__byline` — author + date row
- `.post-meta__author` — author name `<span>`
- `.post-meta__sep` — separator character (aria-hidden)
- `.post-meta__date` — formatted date `<time>`
- `.post-meta__tags` — tag list `<ul>`

---

## `Triptych`

**Source:** `site/src/components/blog/Triptych.astro`  
**Usage context:** Renders a three-panel image sequence (figure grid) within a blog post body.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `panels` | `Array<{ src: string; alt: string; caption?: string }>` | Yes | Exactly 3 panel objects |
| `label` | `string` | No | Accessible label for the `<figure>` (defaults to `'Three-panel image sequence'`) |

### Panel object shape

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `src` | `string` | Yes | Image URL |
| `alt` | `string` | Yes | Alt text for the image |
| `caption` | `string` | No | Optional caption rendered in `<figcaption>` |

### Example usage

```astro
---
import Triptych from '@/components/blog/Triptych.astro';
---
<Triptych
  panels={[
    { src: '/img/a.jpg', alt: 'First panel', caption: 'Caption one' },
    { src: '/img/b.jpg', alt: 'Second panel' },
    { src: '/img/c.jpg', alt: 'Third panel', caption: 'Caption three' },
  ]}
  label="Photo series: before and after"
/>
```

### Constraints

- **Must receive exactly 3 panels.** Passing any other count throws a runtime error: `Triptych requires exactly 3 panels; received N.`
- Images are rendered with `loading="lazy"` and `decoding="async"`
- Layout is a 3-column CSS grid on desktop, collapses to 1 column at `max-width: 640px`
- Images use `aspect-ratio: 3/4` and `object-fit: cover`

### Allowed variations

- `caption` is optional per panel; `<figcaption>` is only rendered when caption is present
- `label` is optional; falls back to `'Three-panel image sequence'`

### Public CSS classes (styling contract)

- `.triptych` — root `<figure>` element
- `.triptych__panel` — individual panel `<div>`
- `.triptych__panel img` — panel image
- `.triptych__panel figcaption` — optional panel caption
