# Landing Page Reference Metrics Calibration

Measured and calculated design tokens comparing the reference homepage (`docs/reference/semgrep-home.png` / `semgrep-home.html`) against PatchProof's calibrated system.

| Property | Reference Homepage (Semgrep) | PatchProof Calibrated Value | Tailwind / CSS Mapping |
|---|---|---|---|
| **Container Max-Width** | 1240px | 1240px | `max-w-[1240px] mx-auto px-4 sm:px-6` |
| **Hero H1 Font Size** | ~68px desktop, 40px mobile | 64px - 72px desktop, 42px mobile | `text-[42px] sm:text-[64px] lg:text-[72px]` |
| **Hero H1 Weights** | Line 1 regular (400), Line 2 extrabold (800) | Line 1 regular (400), Line 2 bold (700) | `font-normal` + `<strong className="font-bold">` |
| **Hero Product Deck Width** | ~1120px in outer container | 1140px inside 1240px container | `w-full max-w-[1140px] mx-auto` |
| **Hero Product Container Radius** | 24px - 32px | 24px | `rounded-[24px]` |
| **Section Vertical Padding** | ~140px desktop, ~80px mobile | 128px - 144px desktop, 72px - 88px mobile | `py-28 sm:py-36` |
| **Section H2 Font Size** | 42px - 48px | 40px - 48px | `text-[36px] sm:text-[44px]` |
| **Sub-Header Font Size** | 19px - 21px | 18px - 20px | `text-[18px] sm:text-[20px]` |
| **Body Font Size** | 16px - 17px | 16px - 17px | `text-[16px] text-text-secondary` |
| **Eyebrow Style** | 12px uppercase, tracked | 12px uppercase, tracked 0.08em | `text-[12px] uppercase font-semibold tracking-wider text-accent` |
| **Button Height (Landing)** | 48px | 48px | `h-12 px-6 rounded-[10px]` |
| **Hero Joined Email Pill** | 56px height, rounded-full | 56px height, rounded-full | `h-14 p-1.5 rounded-full` |
| **Sticky Pill Nav** | Sticky bar with 4 rounded pills | Sticky bar with 4 rounded pills | `sticky top-18 z-30 bg-surface/90 backdrop-blur` |
| **Background Alternation** | Mint -> White -> Mint -> White -> Forest | Light neutral (#fbfbfd) -> Indigo Tint (#eef0ff) -> White -> Dark (#0b0b0c) | Alternating section backgrounds |

