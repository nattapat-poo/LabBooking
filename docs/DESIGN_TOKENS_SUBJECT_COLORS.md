# 🎨 Design Tokens: Subject Color Scheme

---

**Governing Decisions:** D-48, BL-03  
**Status:** POPULATED (Source: TimeTable Project Mapping confirmed by Owner 2026-10-27)  
**Open Item:** **O-12** — **RESOLVED**

---

## 1. Overview
In accordance with decision **D-48**, the Teacher Booking View renders available teaching blocks as muted (transparent background with border and text), and fills them with the assigned subject colour when selected, pending, or booked.

Subject colours are standardised across the MUIDS ecosystem and mirrored from the Owner's TimeTable project.

> [!IMPORTANT]
> **Zero Exposure Policy:** This document records only canonical subject names, hex color codes, and visual accessibility notes. It contains zero external Apps Script project IDs, deployment URLs, or spreadsheet IDs.

---

## 2. Subject Color Mapping Tokens

| Category | Subject (Short Title) | Hex Code | Text colour (YIQ ≥ 135 → dark) | Notes |
|---|---|:---:|:---:|---|
| Biology | AP Bio | `#38761d` | `white #ffffff` | full title: see Master DB `Subjects.CourseTitle` |
| Biology | Gen.Bio | `#b6d7a8` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Biology | Anatomy | `#00ffff` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Biology | SAS | `#6aa84f` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Chemistry | AP Chem | `#1155cc` | `white #ffffff` | full title: see Master DB `Subjects.CourseTitle` |
| Chemistry | Gen.Chem | `#6d9eeb` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Chemistry | Found.Chem | `#cfe2f3` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Physics | AP Physics | `#666666` | `white #ffffff` | full title: see Master DB `Subjects.CourseTitle` |
| Physics | Gen.Physics | `#d9d9d9` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Physics | Found.Physics | `#f3f3f3` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` (see Note b) |
| Interdisciplinary | Envi | `#00ff00` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Interdisciplinary | Food | `#ffff00` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Interdisciplinary | Engineer | `#d5a6bd` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Interdisciplinary | Int.Sci | `#ea9999` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Health / Sports | Sport Sci | `#ffd966` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Health / Sports | Health 10 | `#ffe599` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Health / Sports | Health 12 | `#ffe599` | `dark #0f172a` | full title: see Master DB `Subjects.CourseTitle` |
| Advisory & Common | Homeroom | `#b4a7d6` | `dark #0f172a` | Non-teaching block |
| Advisory & Common | Homeroom (2nd) | `#d9d2e9` | `dark #0f172a` | Non-teaching block |
| Advisory & Common | Lunch Duty (`LD*`) | `#f59e0b` | `dark #0f172a` | Non-teaching block |
| Advisory & Common | Study Hall | `#475569` | `white #ffffff` | Non-teaching block (see Note a) |
| Advisory & Common | Wellbeing | `#f3f3f3` | `dark #0f172a` | Non-teaching block (see Note b) |

---

## 3. Usage & Integration Rules

1. **Resolution & Matching:** The booking grid resolves a colour token by **exact, normalised match** (trim, case-insensitive) between the block's `Index.Subject` and the canonical short title in Column B of Master DB `Subjects`. Substring or keyword matching is strictly forbidden to prevent accidental misattribution.
2. **Fallback Tokens:**
   - **Empty / blank subject:** `#64748b` (Slate 500).
   - **Unmapped subject:** `#6366f1` (Indigo 500).
3. **Dynamic Text Contrast (YIQ Rule):**
   - Text color rendered over a filled background is computed dynamically using the YIQ luminance formula:
     $$\text{YIQ} = \frac{(R \times 299) + (G \times 587) + (B \times 114)}{1000}$$
   - When $\text{YIQ} \ge 135$, render dark text (`#0f172a`).
   - When $\text{YIQ} < 135$, render light text (`#ffffff`).
   - *Accessibility Verification:* All token pairings must be verified against WCAG 2.1 AA contrast ratio ($\ge 4.5:1$) during **BL-03** implementation, and any necessary token adjustments documented.
4. **Note a (Study Hall Token):** The TimeTable project radar table mentions `#f3f3f3` for Study Hall, but its active pattern logic evaluates to `#475569` (slate-600) matching visual screenshots. This document standardises on `#475569`.
5. **Note b (Shared Light Neutral Token):** `Found.Physics` and `Wellbeing` both resolve to `#f3f3f3`. This collision is operationally benign because non-teaching blocks such as `Wellbeing` are blank in the teacher booking view.
