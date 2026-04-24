# MokJang Design System

모던 & 미니멀 청년부 커뮤니티 플랫폼. Cornflower blue as the single hero color,
buttery yellow as the warm accent, Pretendard-led bilingual (ko/en) type, and a
generous 4-pt spacing rhythm. Sourced from the Claude Design handoff bundle and
mirrored here for runtime consumers (`constants/theme.ts`,
`components/ui/gluestack-ui-provider/config.ts`, `tailwind.config.js`).

## Tokens

### Primary — cornflower blue

| Step | Hex | Role |
| --- | --- | --- |
| 50 | `#F5F8FF` | Softest tint |
| 100 | `#EBF2FF` | Primary surface tint, pill backgrounds |
| 200 | `#D6E3FF` | Hovered tint |
| 300 | `#A9C7FA` | Illustrations, gradient start |
| 400 | `#6FA4F5` | Gradient end |
| 500 | `#467CFA` | Hero, CTAs, active tab, links |
| 600 | `#3566E0` | Hover on primary |
| 700 | `#2A5BD9` | Pressed, tag text on tint |
| 800 | `#1E44A8` | Deep accents |
| 900 | `#14307A` | Darkest |

### Secondary — signal yellow

| Step | Hex | Role |
| --- | --- | --- |
| 50 | `#FFFBE0` | Softest tint |
| 100 | `#FFF5B8` | Highlight chip fill |
| 200 | `#FFEE82` | Hovered tint |
| 300 | `#FFE44D` | Accent background |
| 400 | `#FFDB29` | Warning tint |
| 500 | `#FFD109` | Warm accent (attendance, highlights) |
| 600 | `#E6BC00` | Pressed |
| 700 | `#B89600` | Tag text on yellow tint |
| 800 | `#8C7200` | Deep yellow |

### Foreground (text)

| Token | Hex | Role |
| --- | --- | --- |
| `fg-1` | `#182236` | Primary text, headlines |
| `fg-2` | `#8A94A6` | Secondary text, meta |
| `fg-3` | `#C4CAD4` | Tertiary, disabled label |
| `fg-disabled` | `#E0E3E8` | Disabled backgrounds |
| `fg-on-primary` | `#FFFFFF` | Text on primary fills |

### Background / surface

| Token | Hex | Role |
| --- | --- | --- |
| `bg-0` | `#FFFFFF` | Cards, sheets |
| `bg-1` | `#F7F8FA` | App background |
| `bg-2` | `#F5F6F8` | Input fill, neutral chip |
| `bg-3` | `#EEF0F4` | Inset row |

### Semantic

| Token | Hex | Role |
| --- | --- | --- |
| `success-500` | `#4CAF50` | Answered prayers, attending RSVP |
| `warning-500` | `#FFB020` | Urgent prayer |
| `error-500` | `#FF5252` | Destructive |
| `info-500` | `#467CFA` | Informational (alias for primary-500) |

### Dark mode

- `bg-0` → `#151922` (cards)
- `bg-1` → `#0B0F1A` (canvas)
- `bg-2` → `#1C2130` (input fill)
- `fg-1` → `#ECEDEE`, `fg-2` → `#9BA1A6`, `fg-3` → `#6B7280`
- Primary stays `#467CFA` (slight luminance boost on dark surfaces is handled by Gluestack).

---

## Typography

- **Display & UI — Pretendard Variable** (`assets/fonts/PretendardVariable.ttf`, weights 45–920) with system-ui (SF Pro on iOS) leading, Noto Sans KR as a Google Fonts fallback for older Android devices.
- **Fallback stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Pretendard Variable', Pretendard, 'Noto Sans KR', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
- **Weights used:** 400 / 500 / 600 / 700. No Light, no Black.
- **Tracking:** headings `-0.5`, body `0`, ALL-CAPS tags `+0.04em`.

### Type scale

| Token | Size / LH | Weight | Tracking |
| --- | --- | --- | --- |
| `display` | 32 / 40 | 700 | -0.6 |
| `h1` | 26 / 34 | 700 | -0.5 |
| `h2` | 22 / 30 | 700 | -0.5 |
| `h3` | 18 / 26 | 600 | -0.3 |
| `body` | 16 / 24 | 400 | 0 |
| `body-sm` | 14 / 20 | 400 | 0 |
| `caption` | 12 / 16 | 500 | 0 |
| `overline` | 10 / 14 | 700 | 0.6 (ALL CAPS) |

---

## Spacing (4-pt scale)

`xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 40`

- Screen horizontal padding: `16` (`md`).
- Card inner padding: `20`.
- Vertical rhythm between sections: `24`.

## Corner radii

| Token | Value | Used on |
| --- | --- | --- |
| `sm` | `4` | Inline tags, chips |
| `md` | `8` | Small buttons, fields |
| `lg` | `12` | Buttons, inputs |
| `xl` | `16` | Cards, sheets |
| `2xl` | `20` | Feature cards, modals |
| `pill` | `9999` | Badges, avatars, pill buttons |

Never mix two radii on the same element. A card is `16`; its inner tag is `pill`.

## Shadows / elevation

Three soft, blue-neutral shadows — no sharp drop-shadows.

- **`card`** — `0 4px 20px rgba(0, 0, 0, 0.05)` — default card / tile.
- **`floating`** — `0 8px 30px rgba(70, 124, 250, 0.30)` — FAB halo in primary.
- **`navigation`** — `0 -4px 20px rgba(0, 0, 0, 0.03)` — inverted shadow above the bottom tab bar.

Borders replace shadows for list-row dividers: `1px` `rgba(0,0,0,0.06)` bottom border.

## Motion

- `fast 150ms` (hover/press), `base 220ms` (sheet/modal enter), `slow 320ms` (screen transitions).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` for almost everything. Bottom sheets use
  `@gorhom/bottom-sheet` defaults (stiffness ~200, damping ~20).
- Entrances: fade + 8px rise. No bounces, no overshoots, no parallax.

---

## Iconography

- **Lucide** (`lucide-react-native`) — stroke 1.5–2px, rounded caps. Sizes: `20` in list rows, `24` in headers, `16` in badges.
- **SF Symbols** via `expo-symbols` + the local `IconSymbol` wrapper — used on the bottom tab bar (`house.fill`, `person.2.fill`, `book.fill`, `person.fill`) so iOS feels native.
- **No emoji-as-icons** in UI chrome. The only emoji in existing copy are `👤` and `📍` inside meeting-host meta — leave those as-is.
- **Logos:** `assets/images/logo-light.png` on light, `assets/images/logo-dark.png` on dark. `icon.png` is reserved for stores / splash.

---

## Layout rules

- **Reference device:** 390×844 (iPhone 14). 16pt side padding. Safe-area insets respected at top and bottom.
- **Fixed elements:** bottom tab bar 80pt, top header 52pt collapsed / 96pt with large title. FAB floats bottom-right, 24pt inset from the tab bar.
- **Single-column** with cards spanning `100% - 32px`.
- **Density:** comfortable, not compact — err toward fewer items per screen and generous empty states.

## Card anatomy

- White fill (`bg-0`), radius `16`, padding `20`, `card` shadow.
- Title 16/22 Semibold, meta 12/16 `fg-2`.
- Category badges: top-right, pill-shaped, 10–11px ALL CAPS.
- Avatars (when present): top-left, 40×40 circle.

---

## Voice & tone

- **Warm, calm, sincere.** Never salesy, never "!!!" stacks, never emoji-as-personality.
- **Second person, informal.** The app addresses the user directly: "Be the first to share a prayer request."
- **Bilingual by design.** Every surface must work in ko + en. Korean is natural young-adult register (`기도제목`, `목장`, `공지사항`). English is relaxed American ("Mark as Answered", "Sign in with Google").
- **Reverent where it matters.** Prayer, Bible, and worship surfaces use direct, respectful language.

## Casing

- **Sentence case** for most UI — buttons, headings, menu items.
- **ALL CAPS sparingly** — reserved for category tags (10–11px, +0.04em tracking).
- **Title Case** for proper nouns and product areas — "Prayer Board", "Pastoral Diary", "VCHUNG Feed", "MokJang".
