# 🎨 Design Tokens: Subject Color Scheme

---

**Governing Decisions:** D-48, BL-03  
**Status:** DRAFT (Awaiting Owner Input)  
**Open Item:** **O-12** — Owner to paste the subject→colour mapping into the AGY chat from the TimeTable project.

---

## 1. Overview
In accordance with decision **D-48**, the Teacher Booking View renders available teaching blocks as muted (transparent background with border and text), and fills them with the assigned subject colour when selected, pending, or booked.

Subject colours are standardised across the MUIDS ecosystem and mirrored from the Owner's TimeTable project.

> [!IMPORTANT]
> **Zero Exposure Policy:** This document records only canonical subject names, hex color codes, and visual accessibility notes. It must never contain external Apps Script project IDs, deployment URLs, or spreadsheet IDs.

---

## 2. Subject Color Mapping Tokens

| Subject Name | Hex Color Code | Sample Preview | Notes |
|---|:---:|:---:|---|
| *(Pending O-12 input)* | *(Pending)* | *(Pending)* | *Owner to provide mapping from TimeTable project* |

---

## 3. Usage & Integration Rules
1. **Token Ingestion (BL-03):** Frontend booking grid components consume these tokens to dynamically apply border and fill styles to assigned teaching blocks.
2. **Fallback Style:** If an assigned teaching block references a subject without an explicit hex code mapping, the grid applies the fallback neutral slate token: `#64748B` (`slate-500`).
3. **Contrast & Legibility:** Text rendered over filled backgrounds must maintain WCAG 2.1 AA contrast ratio (≥ 4.5:1) against the subject color token.
