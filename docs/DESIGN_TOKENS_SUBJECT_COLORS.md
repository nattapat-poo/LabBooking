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

| Category | Subject (Short Title) | Hex Code | Preview | Notes |
|---|---|:---:|:---:|---|
| Biology | AP Bio | `#38761d` | <span style="background-color:#38761d;color:#ffffff;padding:2px 8px;border-radius:4px;">#38761d</span> | Advanced Placement Biology |
| Biology | Gen.Bio | `#b6d7a8` | <span style="background-color:#b6d7a8;color:#0f172a;padding:2px 8px;border-radius:4px;">#b6d7a8</span> | General Biology |
| Biology | Anatomy | `#00ffff` | <span style="background-color:#00ffff;color:#0f172a;padding:2px 8px;border-radius:4px;">#00ffff</span> | Anatomy & Physiology |
| Biology | SAS | `#6aa84f` | <span style="background-color:#6aa84f;color:#ffffff;padding:2px 8px;border-radius:4px;">#6aa84f</span> | Senior Applied Science (Bio) |
| Chemistry | AP Chem | `#1155cc` | <span style="background-color:#1155cc;color:#ffffff;padding:2px 8px;border-radius:4px;">#1155cc</span> | Advanced Placement Chemistry |
| Chemistry | Gen.Chem | `#6d9eeb` | <span style="background-color:#6d9eeb;color:#0f172a;padding:2px 8px;border-radius:4px;">#6d9eeb</span> | General Chemistry |
| Chemistry | Found.Chem | `#cfe2f3` | <span style="background-color:#cfe2f3;color:#0f172a;padding:2px 8px;border-radius:4px;">#cfe2f3</span> | Foundation Chemistry |
| Physics | AP Physics | `#666666` | <span style="background-color:#666666;color:#ffffff;padding:2px 8px;border-radius:4px;">#666666</span> | Advanced Placement Physics |
| Physics | Gen.Physics | `#d9d9d9` | <span style="background-color:#d9d9d9;color:#0f172a;padding:2px 8px;border-radius:4px;">#d9d9d9</span> | General Physics |
| Physics | Found.Physics | `#f3f3f3` | <span style="background-color:#f3f3f3;color:#0f172a;padding:2px 8px;border-radius:4px;">#f3f3f3</span> | Foundation Physics (see Note b) |
| Interdisciplinary | Envi | `#00ff00` | <span style="background-color:#00ff00;color:#0f172a;padding:2px 8px;border-radius:4px;">#00ff00</span> | Environmental Science |
| Interdisciplinary | Food | `#ffff00` | <span style="background-color:#ffff00;color:#0f172a;padding:2px 8px;border-radius:4px;">#ffff00</span> | Food Science / Nutrition |
| Interdisciplinary | Engineer | `#d5a6bd` | <span style="background-color:#d5a6bd;color:#0f172a;padding:2px 8px;border-radius:4px;">#d5a6bd</span> | Engineering |
| Interdisciplinary | Int.Sci | `#ea9999` | <span style="background-color:#ea9999;color:#0f172a;padding:2px 8px;border-radius:4px;">#ea9999</span> | Integrated Science |
| Health / Sports | Sport Sci | `#ffd966` | <span style="background-color:#ffd966;color:#0f172a;padding:2px 8px;border-radius:4px;">#ffd966</span> | Sports Science |
| Health / Sports | Health 10 | `#ffe599` | <span style="background-color:#ffe599;color:#0f172a;padding:2px 8px;border-radius:4px;">#ffe599</span> | Health Education Grade 10 |
| Health / Sports | Health 12 | `#ffe599` | <span style="background-color:#ffe599;color:#0f172a;padding:2px 8px;border-radius:4px;">#ffe599</span> | Health Education Grade 12 |
| Advisory & Common | Homeroom | `#b4a7d6` | <span style="background-color:#b4a7d6;color:#0f172a;padding:2px 8px;border-radius:4px;">#b4a7d6</span> | Non-teaching block |
| Advisory & Common | Homeroom (2nd) | `#d9d2e9` | <span style="background-color:#d9d2e9;color:#0f172a;padding:2px 8px;border-radius:4px;">#d9d2e9</span> | Non-teaching block |
| Advisory & Common | Lunch Duty (`LD*`) | `#f59e0b` | <span style="background-color:#f59e0b;color:#ffffff;padding:2px 8px;border-radius:4px;">#f59e0b</span> | Non-teaching duty |
| Advisory & Common | Study Hall | `#475569` | <span style="background-color:#475569;color:#ffffff;padding:2px 8px;border-radius:4px;">#475569</span> | Non-teaching block (see Note a) |
| Advisory & Common | Wellbeing | `#f3f3f3` | <span style="background-color:#f3f3f3;color:#0f172a;padding:2px 8px;border-radius:4px;">#f3f3f3</span> | Non-teaching block (see Note b) |

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
