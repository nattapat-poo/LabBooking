# 📐 Adaptive Calendar Grid & Persistent Setup Outage Specification

**Version:** 1.2.0  
**Date:** October 10, 2026  
**Project:** Project 01: Smart Lab Booking (`Lab Oops OS`)  
**Author:** Lead Architect Nattapat Poolyam (Mek) & Antigravity  
**Status:** 🟡 Specification Active / Pending Frontend Implementation  

---

## 1. Compliance Assessment vs. PRD & Design Spec v1.1.3c

### 🔍 Gap & Compliance Analysis
| Architectural Dimension | Legacy PRD / Design Spec v1.1.3c | Newly Proposed Google Calendar Mockup | Compliance Status |
| :--- | :--- | :--- | :--- |
| **Grid Architecture** | Static Table (`<tr>` per period, uniform 6 columns $\times$ 9 rows). | **Continuous Time Canvas:** Y-axis mapped to physical clock time (`07:30–16:30`), with period blocks positioned proportionally by timestamp (`top%`, `height%`). | ⚠️ **Deviation / Evolution:** Replaces rigid table with dynamic spatial canvas. |
| **Y-Axis Time Column** | PRD Section 4.2.2 Item 4: *"A 'Period' column must list period identifiers ('HR', 'P1'...'P8') as row labels. It must not display specific times."* | **Physical Time Markers:** Displays hourly labels (`08:00`, `09:00`, `10:00`... `16:00`) on the left axis, reflecting true clock time. | ⚠️ **Deviation / Evolution:** Explicit times replace static period labels on Y-axis. |
| **Bell Schedule Variation** | Assumed identical horizontal rows across all days; times noted inside cells. | **Dynamic Daily Unrolling:** Wednesday morning meeting naturally pushes P1 down to 08:45; Thursday/Friday shortened periods and afternoon activities expand naturally. | 🌟 **Major Improvement:** Eliminates horizontal time distortion across variable days. |
| **Period 2 Grade Split** | Described as backend logic, but UI layout was unspecified or nested in one row. | **Side-by-Side Parallel Blocks:** `P2-G10` (`08:50–09:40`) and `P2-G11/12` (`09:05–09:55`) render as physically distinct, offset overlapping blocks. | 🌟 **Major Improvement:** Resolves Grade 10 vs. Grade 11/12 break overlap cleanly. |
| **Concurrent Bookings** | Single booking cell per slot; Master view used 4 sub-rows per period. | **Multi-Chip Event Stacking:** Multiple concurrent bookings (e.g., Friday P1 Bio + Gas Chemistry) sit side-by-side within the same period boundary. | 🌟 **Major Improvement:** Matches Google Calendar behavior familiar to faculty. |

> **Conclusion:** While the mockup deviates from the legacy PRD's rigid `<table>` description, it **substantially improves fidelity to MUIDS's operational reality**. This document serves as the formal specification addendum officially superseding the legacy 6x9 table layout.

---

## 2. Adaptive Continuous Time-Proportional Grid Architecture

### A. Coordinate Mapping System (Physical Time Axis)
* **Viewport Window:** `07:30` to `16:30` (540 total minutes per school day).
* **Base Resolution:** 1 hour = 60 vertical units (or percentage: $1\text{ min} \approx 0.185\%$).
* **Coordinate Formula:**
  $$\text{Top Offset (px)} = (\text{StartMinutes} - \text{DayStartMinutes}) \times \text{ScaleFactor}$$
  $$\text{Height (px)} = \text{DurationMinutes} \times \text{ScaleFactor}$$
  *(Where $\text{DayStartMinutes} = 450$ for 07:30, and $\text{ScaleFactor} \approx 1.0\text{ to }1.2\text{ px/min}$ on Desktop).*

### B. Two-Layer Canvas Model (Ghost Slots vs. Event Chips)

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 DAY COLUMN (e.g., Monday / Day A: Regular)               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔲 LAYER 1: Ghost Target Slot (Background Period Box)   │ │
│ │   • Rounded dark stroke border (`border-slate-700/60`)  │ │
│ │   • Period Label & Time: "P1, 07:50 – 08:45"            │ │
│ │   • Hover state when free: emerald ring + "+ Book" cursor│ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 🟢 LAYER 2: Foreground Event Chip (Active Booking)   │ │ │
│ │ │   • Pill/card overlay (`bg-emerald-600/90 text-white`)│ │ │
│ │ │   • Content: "P1 Biomolecules (Dr. Bala • Lab Bio 1)"│ │ │
│ │ │   • Action: Click opens View/Cancel/Postpone modal   │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

1. **Layer 1: Background "Ghost" Period Slots (Booking Targets)**
   * Every period defined in `Bell_Schedules` for that day renders as a stroked, hollow container.
   * If the logged-in teacher has a class in that period (or TALT in Master View) and the room is free, the ghost slot is **interactive and bookable**.
   * Clicking an empty ghost slot triggers `toggleSlotSelection(slotId)` (Selected Slots workflow).

2. **Layer 2: Foreground Event Chips (Active Bookings)**
   * Positioned inside or spanning the period container.
   * **Color Coding Standard:**
     * `🟢 Emerald / Green`: Confirmed Teacher Class Booking (`Booked`).
     * `🟡 Amber / Yellow`: Pending Booking awaiting TALT confirmation (`Await Confirmation`).
     * `🔵 Indigo / Cyan`: TALT Internal Lab Support task (`Booked (Lab Support)`).
     * `🟣 Purple / Violet`: Multi-section or Shared Lab activity.
     * `🔴 Rose / Red`: Lab Outage / Maintenance closure.
     * `🔒 Slate / Striped`: **Setup Lock / Apparatus Hold** *(see Section 3)*.

### C. Multi-Schedule Handling (Day A–E & Bell Variations)
* **Wednesday Shift:** The `Wed Meeting (07:30–08:25)` block renders at the top of Wednesday, with Homeroom starting at `08:25` and Period 1 at `08:45`.
* **Period 2 Parallel Split:**
  * Container splits horizontally into two 50% width columns:
    * Left half: `P2-G10` (`08:50–09:40`).
    * Right half: `P2-G11/12` (`09:05–09:55`).
* **Afternoon Activities:** On 50m/40m shortened schedules, early dismissal of academic periods leaves the lower section occupied by a prominent, distinct `Activity (13:05–16:00)` banner.

### D. Responsive Multi-Surface Strategy
* **Desktop ($\ge 1024\text{ px}$):** Full 5-column (Mon–Fri) side-by-side canvas with sticky left-side time marks (`08:00`, `09:00`... `16:00`).
* **Mobile / Tablet ($< 1024\text{ px}$):**
  * **Day-Switcher Carousel:** Sticky header with `[<] [Mon] [Tue] [Wed] [Thu] [Fri] [>]` pills.
  * Swiping or tapping a day displays that single day's vertical timeline in full width, ensuring touch targets exceed $48 \times 48\text{ px}$ without cramped text.

---

## 3. New Feature: Persistent Setup Outage ("Setup Lock" / "Apparatus Hold")

### A. Operational Background & Problem Statement
In science laboratory operations, complex experiments often require specialized apparatus, hazardous chemicals, or delicate biological preparations to remain on lab benches over multiple days or through a weekend:
* **Example:** A Grade 10 Biology class conducts an extensive *Biomolecules & Enzyme Kinetics* lab starting Monday. A makeup session or extended period is scheduled for the following Monday Period 8.
* **The Conflict:** During intermediate days and periods (e.g. Periods 1–7 of the following Monday), the lab is technically empty, but the tables are covered in glassware, hot plates, spectrophotometers, or reagents.
* **The Failure Mode:** Under legacy outage rules, creating a normal "Maintenance Outage" cancels all existing bookings in that room and sends cancellation emails to teachers. Conversely, if no outage is placed, other teachers might book Chemistry or Physics in Bio 1, requiring technicians to dismantle and re-set the equipment.

### B. Functional Requirements for "Setup Lock" (`SetupHold`)

1. **Dedicated Outage Subtype (`SetupHold`):**
   * TALT can declare an outage with `OutageType: "SetupHold"` (or `"ApparatusLock"`).
   * Distinguishable from `"Maintenance"` (physical room repair) and `"Closure"` (school holiday/sanitization).

2. **Bench Lockdown Across Intermediate Slots:**
   * Locks the specified room from `StartDate + StartPeriod` through `EndDate + EndPeriod`.
   * Completely disables booking for all **other** subjects, teachers, and incompatible lab activities during the entire hold window (including intervening unbooked periods).

3. **Email Notification Suppression Rule (Critical Security & UX):**
   * **Standard Outages:** Automatically trigger cancellation emails and purge conflicting bookings.
   * **`SetupHold` Outages:** When a TALT creates a `SetupHold` outage to protect an active or continuing experiment:
     * **DO NOT** send cancellation or disruption emails to teachers whose bookings belong to the **same experiment / subject** being held.
     * The system identifies existing bookings matching the `LinkedSubject` or `TargetTeacherId` within the window and **preserves their confirmed status without alerting them**.
     * Any third-party booking attempting to encroach on the held room is prevented at the booking interface.

4. **Visual Rendering on Adaptive Grid:**
   * Intermediate held periods (where no class is actively meeting, but the apparatus is locked) render with a distinctive **diagonal-striped or amber/slate hatched pattern**:
     `🔒 Setup Hold: Biomolecules Lab (Held for Makeup P8)`
   * Tooltip: *"Lab room is locked with active apparatus setup. No other laboratory activities permitted."*

---

## 4. Database Schema Extensions

### A. Table: `Outages` (Lab Booking Sheet)
The existing 10-column `Outages` schema is updated with 3 additional attribute columns (Columns K, L, M):

| Col | Column Name | Type | Allowed Values / Format | Description |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `OutageID` | String | `Outage_001` (PK) | Unique outage identifier |
| **B** | `LabID` | String | `lab_01` (FK: `Room.RoomID`) | Target lab room ID |
| **C** | `LabName` | String | `Bio 1`, `Chem 2` | Human-readable room name |
| **D** | `StartDate` | Date | `YYYY-MM-DD` | Hold start date |
| **E** | `EndDate` | Date | `YYYY-MM-DD` | Hold end date |
| **F** | `AllDay` | Boolean | `TRUE` / `FALSE` | Full day closure flag |
| **G** | `StartPeriod` | Enum | `HR`, `P1`–`P8` | First locked period |
| **H** | `EndPeriod` | Enum | `HR`, `P1`–`P8` | Last locked period |
| **I** | `Reason` | String | Text | Description / Experiment name |
| **J** | `Status` | Enum | `Active`, `Resolved` | Lifecycle status |
| **K** | **`OutageType`** *(New)* | Enum | `Maintenance`, `SetupHold`, `Emergency` | Classifies the outage behavior |
| **L** | **`LinkedSubject`** *(New)* | String | `Gen.Bio`, `Biomolecules` | Subject/Lab permitted under this setup |
| **M** | **`SuppressEmail`** *(New)* | Boolean | `TRUE` / `FALSE` | When `TRUE`, suppresses cancellation emails to existing matching bookings |

---

## 5. Implementation Roadmap Checklist

- [x] Document Adaptive Calendar Grid coordinate mapping and comparison.
- [x] Specify Persistent Setup Outage (`SetupHold`) business rules and email suppression logic.
- [x] Extend `Outages` table schema in documentation.
- [ ] Implement `OutageType: "SetupHold"` creation modal in TALT View (`Modal_Outage.html`).
- [ ] Add `SuppressEmail` flag evaluation in `API_TALT_Core.js` (`createLabOutage`).
- [ ] Build continuous time coordinate generator (`calculateGridCoordinates(day, period, bellType)`).
- [ ] Render background Ghost Slots and foreground Event Chips in `Grid_Calendar.html`.
