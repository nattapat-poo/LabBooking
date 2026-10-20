> ⚠️ Partly superseded by [PRD_AMENDMENT_v1.4.0b.md](./PRD_AMENDMENT_v1.4.0b.md). Where they conflict, the amendment wins.

# **Design Specification**

This Design Specification serves as the definitive blueprint for the MUIDS Lab Booking App v1.1.3c, acting as the critical architectural bridge between the functional mandates of the PRD and the final code implementation. We aren’t just making things look "pretty"—though the Mahidol Blue theme is non-negotiable—we are defining the spatial hierarchy, interactive states, and Tailwind CSS patterns that ensure every pixel serves a purpose. By outlining objectives such as the safety-first Proxy Mode and the high-efficiency **Selected Slots** container, this document provides the exact "Code-Wireframes" and modular instructions needed to build a consistent, accessible, and high-performance interface. Essentially, it is the guardrail that keeps our UI from descending into chaos, ensuring that whether a user is a teacher booking a lab or a TALT managing a batch, the experience is seamless, intentional, and perfectly aligned with our modular 1:1 Mirror Promotion Protocol.

**Table of Contents**

[1\. Foundation & Global Shell (Shared Logic)](#1.-foundation-&-global-shell-\(shared-logic\))

[1.1 Core Principles (PRD Section 4.4)](#1.1-core-principles-\(prd-section-4.4\))

[1.1.1 Clarity: High-contrast status colors](#1.1.1-clarity:-high-contrast-status-colors)

[1.1.2 Efficiency: Batching logic (Selection Cart)](#1.1.2-efficiency:-batching-logic-\(selected-slots-container\))

[1.1.3 Consistency: The 8px Tailwind grid](#1.1.3-consistency:-the-8px-tailwind-grid)

[1.1.4 Feedback: System Thinking](#1.1.4-feedback:-system-thinking)

[1.1.5 Safety (Critical): The "Acting As" Proxy Banner (Bright Yellow/Orange).](#1.1.5-safety-\(critical\):-the-"acting-as"-proxy-banner-\(bright-yellow/orange\).)

[1.1.6 Accessibility: Icon \+ Color dual-coding](#1.1.6-accessibility:-icon-+-color-dual-coding)

[1.1.7 Multi-Platform Adaptability: Universal Access](#1.1.7-multi-platform-adaptability:-universal-access)

[1.2 Global Navigation (Index.html & JS\_Header.html):](#1.2-global-navigation-\(index.html-&-js_header.html\):)

[1.2.1 Header: Logo, User Identity, and Role Switcher.](#1.2.1-header:-logo,-user-identity,-and-role-switcher.)

[1.2.2 The Proxy Banner: The specific bright yellow/orange banner that appears when a TALT is "Acting As" a teacher.](#1.2.2-the-proxy-banner:-the-specific-bright-yellow/orange-banner-that-appears-when-a-talt-is-"acting-as"-a-teacher.)

[1.2.3 Timeline Controls (Navigation Bar)](#1.2.3-timeline-controls-\(navigation-bar\))

[1.2.4 Manual Revalidation Button (JS\_Header.html)](#1.2.4-manual-revalidation-button-\(js_header.html\))

[1.2.4.1 UI Layout & Positioning](#1.2.4.1-ui-layout-&-positioning)

[1.2.4.2 Interaction & Feedback Behavior](#1.2.4.2-interaction-&-feedback-behavior)

[1.3 Design Assets](#1.3-design-assets)

[1.3.1 Primary Source: Google Slides link](#1.3.1-primary-source:-google-slides-link)

[1.3.2 Tailwind Config: Custom theme colors (Mahidol Blue, Status Red/Green/Amber)](#1.3.2-tailwind-config:-custom-theme-colors-\(mahidol-blue,-status-red/green/amber\))

[1.4 Responsive Layout Strategy](#1.4-responsive-layout-strategy)

[1.4.1 Breakpoint Definitions (Mobile, Tablet, Desktop)](#1.4.1-breakpoint-definitions-\(mobile,-tablet,-desktop\))

[1.4.2 The "Mobile-Smart" Grid Logic: Horizontal Overflow logic](#1.4.2-the-"mobile-smart"-grid-logic:-horizontal-overflow-logic)

[1.4.3 Code-Wireframe: Responsive Containers](#1.4.3-code-wireframe:-responsive-containers)

[1.5 1.5 Guest Landing & Unauthorized State Layout (UI\_Unauthorized.html)](#1.5-guest-landing-&-unauthorized-state-layout-\(ui_unauthorized.html\))

[1.5.1 Structural Layout & Visual Elements](#1.5.1-structural-layout-&-visual-elements)

[1.5.2 Content & Typography](#1.5.2-content-&-typography)

[2\. Teacher Module: "My Timeline" (JS\_TeacherView.html)](#2.-teacher-module:-"my-timeline"-\(js_teacherview.html\))

[2.1 The Timeline Grid](#2.1-the-timeline-grid)

[2.1.1 Cell States: Available](#2.1.1-cell-states:-available)

[2.1.2 Code-Wireframe: Grid Interaction](#2.1.2-code-wireframe:-grid-interaction)

[2.1.3 Responsive Behavior (Mobile-Smart Logic)](#2.1.3-responsive-behavior-\(mobile-smart-logic\))

[2.2 The Selection Cart (Modal\_Cart.html)](#2.2-the-selected-slots-panel-\(modal_selectedslots.html\))

[2.2.1 Spatial Hierarchy: Fixed bottom-floating bar](#2.2.1-spatial-hierarchy:-fixed-bottom-floating-bar)

[2.2.2 Interaction: "Code-Wireframe"](#2.2.2-interaction:-"code-wireframe")

[2.2.3 Responsiveness: Mobile UI](#2.2.3-responsiveness:-mobile-ui)

[2.3 Booking Flow](#2.3-booking-flow)

[2.3.1 The Multi-Slot Modal](#2.3.1-the-multi-slot-modal)

[2.3.2 Quick-Book Templates](#2.3.2-quick-book-templates)

[3\. TALT Module: "Master Dashboard" (JS\_TaltView.html)](#3.-talt-module:-"master-dashboard"-\(js_taltview.html\))

[3.1 The Master Grid](#3.1-the-master-grid)

[3.1.1 Visual Complexity: Multi-Lab/TALT Management](#3.1.1-visual-complexity:-multi-lab/talt-management)

[3.1.2 Conflict UI: Visual Flagging of Overlaps](#3.1.2-conflict-ui:-visual-flagging-of-overlaps)

[3.2 The Batch Manager (Modal\_BatchAction.html)](#3.2-the-batch-workspace-\(modal_batchaction.html\))

[3.2.1 Staging Area: The Review Workspace](#3.2.1-staging-area:-the-review-workspace)

[3.2.2 Action Logic: Bulk & Individual Controls](#3.2.2-action-logic:-bulk-&-individual-controls)

[3.3 Lab Outage Manager:](#3.3-lab-outage-manager:)

[3.3.1 UI State: "Blocking" specific days/times for maintenance.](#3.3.1-ui-state:-"blocking"-specific-days/times-for-maintenance.)

[3.3.2 Outage Form Logic](#3.3.2-outage-form-logic)

[3.4 TALT Workload Stats Modal (Modal\_Workload.html)](#3.4-talt-workload-stats-modal-\(modal_workload.html\))

[3.4.1 Trigger & Context](#3.4.1-trigger-&-context)

[3.4.2 UI Layout & Content](#3.4.2-ui-layout-&-content)

[3.4.3 Dynamic Progress Bar Logic](#3.4.3-dynamic-progress-bar-logic)

[3.5 Interactive Template Configuration Control Panel (Modal\_EmailEditor.html)](#3.5-interactive-template-configuration-control-panel-\(modal_emaileditor.html\))

[3.5.1 Security & Component Context Checks](#3.5.1-security-&-component-context-checks)

[3.5.2 Disabled Fallback UI (Anti-Tamper)](#3.5.2-disabled-fallback-ui-\(anti-tamper\))

[3.5.3 Active Layout UI (Authorized Admin View)](#3.5.3-active-layout-ui-\(authorized-admin-view\))

[4\. Feedback & System States (Global Utilities)](#4.-feedback-&-system-states-\(global-utilities\))

[4.1 Loading & Shimmer (JS\_Utilities.html)](#4.1-loading-&-shimmer-\(js_utilities.html\))

[4.1.1 Tailwind animate-pulse for initial data fetching](#4.1.1-tailwind-animate-pulse-for-initial-data-fetching)

[4.2 The "Toast" Notification System](#4.2-the-"toast"-notification-system)

[4.2.1 Component Architecture & Logic](#4.2.1-component-architecture-&-logic)

[4.3 The Onboarding Overlay](#4.3-the-onboarding-overlay)

[4.3.1 The "Spotlight" Mechanism](#4.3.1-the-"spotlight"-mechanism)

[4.3.2 Walkthrough Sequence](#4.3.2-walkthrough-sequence)

[4.3.3 Logic & Persistence](#4.3.3-logic-&-persistence)

[4.4 Cross-Browser & OS Verification:](#4.4-cross-browser-&-os-verification:)

[4.4.1 Target Environment Matrix](#4.4.1-target-environment-matrix)

[4.4.2 The "Strict Compatibility" Checklist](#4.4.2-the-"strict-compatibility"-checklist)

[4.4.3 Performance Thresholds](#4.4.3-performance-thresholds)

[5\. Component Library (Tailwind Specs)](#5.-component-library-\(tailwind-specs\))

[5.1 Buttons](#5.1-buttons)

[5.1.1 Button Grouping & Layout](#5.1.1-button-grouping-&-layout)

[5.2 Inputs & Selectors](#5.2-inputs-&-selectors)

[5.2.1 Input State Matrix](#5.2.1-input-state-matrix)

[5.2.2 Specific Element Variations](#5.2.2-specific-element-variations)

[5.3 Cards & Modals](#5.3-cards-&-modals)

[5.3.1 Structural Specifications](#5.3.1-structural-specifications)

[5.4 Iconography Standard (Lucide Mapping)](#5.4-iconography-standard-\(lucide-mapping\))

[5.4.1 Global Icon Map](#5.4.1-global-icon-map)

[5.4.2 Icon Styling & Sizing](#5.4.2-icon-styling-&-sizing)

[5.5 Responsive Grid Patterns](#5.5-responsive-grid-patterns)

[5.5.1 The "Mobile-Smart" Calendar Grid](#5.5.1-the-"mobile-smart"-calendar-grid)

[5.5.2 Selection Cart Positioning](#5.5.2-selected-slots-panel-positioning)

[5.5.3 Modal & Form Scaling](#5.5.3-modal-&-form-scaling)

[5.5.4 Claude-Ready Instruction Set (Responsiveness)](#5.5.4-claude-ready-instruction-set-\(responsiveness\))

[6\. Engineering Standards & Protocol](#6.-engineering-standards-&-protocol)

[6.1 From PRD Section 15.8: File Header Protocol](#6.1-from-prd-section-15.8:-file-header-protocol)

[6.2 Application Rules](#6.2-application-rules)

[6.3 Component Implementation Strategy (PRD 15.3)](#6.3-component-implementation-strategy-\(prd-15.3\))

[6.4 Compiled Engineering Directives (The "Claude" Cheat Sheet)](#6.4-compiled-engineering-directives-\(the-"claude"-cheat-sheet\))

[6.4.1 Backend & Data Logic](#6.4.1-backend-&-data-logic)

[6.4.2 Frontend & CSS Architecture](#6.4.2-frontend-&-css-architecture)

[6.4.3 Interaction & Accessibility](#6.4.3-interaction-&-accessibility)

[6.4.4 Security & Permissions](#6.4.4-security-&-permissions)

[6.4.5 Supplemental Engineering Directives](#6.4.5-supplemental-engineering-directives)

# **1\. Foundation & Global Shell (Shared Logic)** {#1.-foundation-&-global-shell-(shared-logic)}

## **1.1 Core Principles (PRD Section 4.4)** {#1.1-core-principles-(prd-section-4.4)}

This section outlines the foundational philosophy governing the user interface and experience of the MUIDS Lab Booking App v1.1.3. These principles ensure that the application is not only visually cohesive but also functionally robust, prioritizing the reduction of cognitive load for teachers and the prevention of administrative errors for TALTs. Every component described in this document must be audited against these **seven criteria** before implementation by the Lead Engineer.  

### **1.1.1 Clarity:** High-contrast status colors {#1.1.1-clarity:-high-contrast-status-colors}

* **Definition:** The interface must prioritize the unambiguous presentation of information, ensuring users never have to guess the status of a lab or the result of an action.  
* **Visual Application:** Use high-contrast text and distinct status labels (e.g., "Available" vs. "Booked"). Avoid purely decorative elements that do not contribute to the user's current task.  
* **Tailwind Context:** Use `font-bold` for status indicators and `text-gray-500` for secondary information to create a clear typographic hierarchy.

### **1.1.2 Efficiency:** Batching logic (Selected Slots Container) {#1.1.2-efficiency:-batching-logic-(selected-slots-container)}

* **Definition:** User flows are streamlined to minimize the number of clicks and data entry points required for common tasks.  
* **Visual Application:** The Selected Slots container allows teachers to batch multiple periods into a single request, and the Batch Management Workspace allows TALTs to process multiple sessions with a single commit.  
* **Tailwind Context:** Implement floating action bars (`fixed bottom-0`) for the selected slots panel to keep primary actions accessible without scrolling.

### **1.1.3 Consistency:** The 8px Tailwind grid {#1.1.3-consistency:-the-8px-tailwind-grid}

* **Definition:** UI components, typography, color schemes, and interaction patterns remain uniform across all modules.  
* **Visual Application:** Strictly follow the 8px grid system for spacing and the **Mahidol Blue (\#003366)** theme for all primary interactive elements.  
* **Tailwind Context:** Utilize standard spacing classes (e.g., `p-2`, `m-4`, `gap-8`) and custom theme colors defined in the `tailwind.config.js`.

### **1.1.4 Feedback:** System Thinking {#1.1.4-feedback:-system-thinking}

* **Definition:** The system must provide immediate visual confirmation for every user interaction, effectively communicating the application's processing state.  
* **Visual Application:** Use **Skeleton Grids** with a shimmer effect during data fetching and Pulse animations or spinners during booking submissions.  
* **Tailwind Context:** Apply `animate-pulse` for loading states and transition classes (e.g., `transition-all duration-200`) for button hover/active states.

### **1.1.5 Safety (Critical):** The "Acting As" Proxy Banner (Bright Yellow/Orange). {#1.1.5-safety-(critical):-the-"acting-as"-proxy-banner-(bright-yellow/orange).}

* **Definition:** Critical administrative actions, specifically booking on behalf of teachers, must be shielded by high-visibility warnings to prevent TALTs from accidentally booking for themselves.  
* **Visual Application:** A mandatory, persistent **"Acting As" banner (Bright Yellow/Orange)** must appear at the top of the viewport whenever a TALT is in Proxy Mode.  
* **Tailwind Context:** `bg-yellow-400 text-black font-bold py-2 text-center sticky top-0 z-50`.

### **1.1.6 Accessibility:** Icon \+ Color dual-coding {#1.1.6-accessibility:-icon-+-color-dual-coding}

* **Definition:** Information must be accessible to all users by using at least two visual cues to communicate state, ensuring color is not the only source of meaning.  
* **Visual Application:** Reservation statuses must use both **Colors** (Green/Yellow/Red) and **Icons** (Checkmark/Clock/X-Mark).  
* **Tailwind Context:** Combine color classes (e.g., `text-green-600`) with icon components (e.g., Lucide or Heroicons) in every status cell.

### **1.1.7 Multi-Platform Adaptability:** Universal Access {#1.1.7-multi-platform-adaptability:-universal-access}

* **Definition:** The UI must adjust its spatial hierarchy based on the viewport size without losing functional parity across macOS, Windows, iOS, and Android.  
* **Visual Application:** The Lab Grid utilizes horizontal overflow scrolling on mobile to maintain legibility, while modals transition to full-screen overlays for better touch targets.  
* **Tailwind Context:** Use "Mobile-First" classes. Unprefixed classes define the mobile look, while `md:` and `lg:` prefixes layer on desktop optimizations (e.g., `w-full md:w-auto`).  
* **Browser Support:** Verified for Chromium (Chrome, Edge), WebKit (Safari), and Gecko (Firefox).

## **1.2 Global Navigation (`Index.html` & `JS_Header.html`):** {#1.2-global-navigation-(index.html-&-js_header.html):}

The Global Navigation serves as the persistent command center of the application, providing users with constant orientation and control regardless of their current view. This section defines the structural "Shell" of the app, ensuring that identity management, role-switching, and temporal navigation (week-to-week) are intuitive and accessible. Critically, this layer hosts the system's primary safety mechanism—the Proxy Banner—which anchors the user’s awareness when performing administrative actions on behalf of others. By standardizing these elements in `Index.html` and `JS_Header.html`, we maintain a unified experience across the Teacher and TALT modules. 

### **1.2.1 Header: Logo, User Identity, and Role Switcher.** {#1.2.1-header:-logo,-user-identity,-and-role-switcher.}

* **Spatial Hierarchy:** Fixed to the extreme top of the viewport (`top-0`). Horizontal flex layout with branding on the left and user controls on the right.  
* **Tailwind Context:** `h-16 w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 z-40`.  
* **Code-Wireframe:**

| Component | State: Default | State: Interaction |
| ----- | ----- | ----- |
| **Logo/App Name** | text-muids-blue font-bold text-xl | N/A (Static) |
| **Role Switcher** | bg-gray-100 text-sm px-3 py-1 rounded | hover:bg-gray-200 (Dropdown toggle) |
| **User Profile** | flex items-center gap-2 | Shows email/logout on click |

### **1.2.2 The Proxy Banner: The specific bright yellow/orange banner that appears when a TALT is "Acting As" a teacher.** {#1.2.2-the-proxy-banner:-the-specific-bright-yellow/orange-banner-that-appears-when-a-talt-is-"acting-as"-a-teacher.}

* **Spatial Hierarchy:** Sticky element positioned immediately below the main header. It must push all other content down to remain visible at all times.  
* **Tailwind Context:** `sticky top-16 w-full bg-amber-400 text-black py-2 px-4 shadow-md z-30 flex items-center justify-center gap-3`.  
* **Design Instruction:** Use a "Warning" triangle icon (Lucide `AlertTriangle`). The text must explicitly state: "PROXY MODE: You are currently acting as \[Teacher Name\]".  
* **Code-Wireframe:**

| UI State | Tailwind Classes | Logic |
| ----- | ----- | ----- |
| **Hidden (Normal)** | hidden | activeProxy \=== null |
| **Visible (Active)** | flex animate-slide-down | activeProxy \!== null |

### **1.2.3 Timeline Controls (Navigation Bar)** {#1.2.3-timeline-controls-(navigation-bar)}

The Timeline Controls serve as the temporal anchor of the application, allowing users to move through the school year while maintaining awareness of MUIDS-specific scheduling logic. Beyond simple date navigation, this section integrates the **DayType (A-E Cycle)** and **BellType (Schedule Variation)** data directly from the `Calendar` sheet. This ensures that teachers and TALTs are immediately aware of the instructional context (e.g., "Is it a Wednesday shortened schedule?") before interacting with the grid. 

* **Spatial Hierarchy:** Positioned in a sub-header bar. It utilizes a three-column distribution:  
  * **Left:** Week Navigation Group.  
  * **Center:** **The Scheduling Stack** (Date, DayType, and BellType in a vertical flex column).  
  * **Right:** View Toggle (Teacher only) / Proxy Indicator.  
* **Tailwind Context:** `flex flex-col md:flex-row items-center justify-between p-4 bg-slate-50 border-b border-gray-100 gap-4`.   
* **The Scheduling Stack (Center Column)**

The center area is organized into a vertical stack to maximize clarity without cluttering horizontal space:

1. **Row 1: Date Display** – Primary information. `text-lg font-bold text-gray-800`.  
2. **Row 2: DayType Badge** – The A-E Cycle. Uses a subtle background to distinguish the cycle. `text-sm font-medium px-2 py-0.5 rounded bg-blue-100 text-muids-blue`.  
3. **Row 3: BellType Label** – The specific schedule timing. `text-xs uppercase tracking-wide text-gray-500`.  
* **Code-Wireframe:**

| Component | UI Element | Tailwind / Visual Spec | Data Source |
| ----- | ----- | ----- | ----- |
| **Week Nav** | Button Group | flex shadow-sm rounded-md overflow-hidden border | System Logic |
| **Date Display** | "May 12 \- 18" | text-lg font-bold leading-tight | Calendar\!Date |
| **DayType** | "Day A" | bg-muids-blue/10 text-muids-blue px-2 rounded-full | Calendar\!DayType |
| **BellType** | "Regular Schedule" | italic text-gray-400 font-mono text-\[10px\] | Calendar\!BellType |
| **View Toggle** | Switch/Pill | bg-gray-200 p-1 rounded-lg flex gap-1 | User Session |

* **Interaction States & Responsive Logic**

| State | Action | Visual Feedback |
| ----- | ----- | ----- |
| **Desktop View** | Spread Layout | Navigation on left, Stack in center, Toggle on right. |
| **Mobile View** | Stacked Layout | Navigation moves to top; Scheduling Stack and Toggle stack vertically. |
| **Loading** | Shimmer | The DayType and BellType labels show a gray animate-pulse bar until data is fetched. |
| **Holiday/Closed** | DayType Override | If DayType is "Holiday", the badge color changes to bg-red-100 text-red-600. |

### **1.2.4 Manual Revalidation Button (`JS_Header.html`)** {#1.2.4-manual-revalidation-button-(js_header.html)}

The Manual Revalidation button acts as a user-triggered "Force Sync." It allows Teachers and TALTs to ensure their timeline reflects the absolute latest data from the Google Sheet, bypassing any local caching if they suspect a desync (e.g., a colleague just told them they booked a lab, but it hasn't appeared yet).

#### **1.2.4.1 UI Layout & Positioning** {#1.2.4.1-ui-layout-&-positioning}

* **Placement:** Located in the top-right corner of the Global Header, immediately adjacent to the User's Profile Name/Avatar.  
* **Icon:** A "Rotate" or "Refresh" icon (e.g., Lucide `RefreshCw` or Heroicon `arrow-path`).  
* **Tailwind Context:** `text-slate-400 hover:text-muids-blue transition-colors cursor-pointer p-2 rounded-full hover:bg-slate-50`.

#### **1.2.4.2 Interaction & Feedback Behavior** {#1.2.4.2-interaction-&-feedback-behavior}

To adhere to the **Feedback (1.1.4)** principle, the button must visually communicate when the revalidation is actively processing.

| State | Visual Behavior (Tailwind) | Action / Logic |
| ----- | ----- | ----- |
| **Resting** | text-slate-400 | Waits for click. |
| **Hover** | text-muids-blue | Indicates interactivity. |
| **Processing** | animate-spin text-muids-blue pointer-events-none | On click, triggers triggerManualRevalidation(). The icon spins continuously while the network request is active. |
| **Completion** | Returns to resting state. | Triggers a Success Toast: "Timeline Synced." |

Claude-Ready Spec: Revalidation Directive  
> **File:** `JS_Header.html` / `JS_Utilities.html`  
> **Instruction:** "Add the Refresh icon next to the user profile. Attach an `onclick` listener that calls `triggerManualRevalidation()`. Immediately upon click, add the `animate-spin` class to the icon's SVG element. Remove the `animate-spin` class only when the `google.script.run` success or failure handler returns. If the fetch fails, trigger an Error Toast."

## **1.3 Design Assets** {#1.3-design-assets}

This section defines the technical and visual standards that ensure the application’s "look and feel" remains consistent with the MUIDS identity. It establishes the Google Slides document as the single source of truth for UI layouts and provides the specific Tailwind CSS color configurations required to implement the brand’s palette across all modules. By centralizing these assets, we prevent "style creep" and ensure that the Engineer can rely on a fixed set of design tokens to build a cohesive interface that aligns with school branding and accessibility requirements. 

### **1.3.1 Primary Source: Google Slides link** {#1.3.1-primary-source:-google-slides-link}

* **The Definitive Source:** While this document provides the logic and code-wireframes, the **Google Slides Design Spec** is the visual authority. All spatial measurements, padding, and specific component alignments not explicitly detailed here should be derived from the Slides.  
* **Link to Google Slides:** [https\://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc\_3lUmaRRo/edit?usp=sharing](https://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc_3lUmaRRo/edit?usp=sharing)  
* **Usage Protocol:** When the Engineer is tasked with building a new UI component (e.g., the "Booking Form"), they must cross-reference the layout in the Slides with the functional rules in this document to ensure 100% fidelity.

### **1.3.2 Tailwind Config: Custom theme colors (Mahidol Blue, Status Red/Green/Amber)** {#1.3.2-tailwind-config:-custom-theme-colors-(mahidol-blue,-status-red/green/amber)}

To ensure consistency, the application uses a custom Tailwind theme configuration. These color tokens must be used exclusively to maintain the **Mahidol Blue** identity and the "Dual-Coding" status system.

| Color Name | Hex Code | Usage |
| ----- | ----- | ----- |
| **MUIDS Blue** | \#003366 | Primary branding, Headers, Primary Buttons, Active Toggles. |
| **MUIDS Blue Light** | \#E6EBF0 | Backgrounds for selected cells, secondary highlights. |
| **Status: Pending** | \#F59E0B | (Amber-500) Pending approvals, Warning banners. |
| **Status: Booked** | \#10B981 | (Emerald-500) Confirmed bookings, Success toasts. |
| **Status: Denied** | \#EF4444 | (Red-500) Denied requests, Error states, Lab Outages. |
| **Neutral: Border** | \#E5E7EB | (Gray-200) Grid lines and UI dividers. |

**Tailwind Implementation Spec:**

```js
// Example for tailwind.config.js
theme: {
  extend: {
    colors: {
      'muids-blue': '#003366',
      'muids-blue-light': '#E6EBF0',
      'status-pending': '#F59E0B',
      'status-booked': '#10B981',
      'status-denied': '#EF4444',
    }
  }
}
```

## **1.4 Responsive Layout Strategy** {#1.4-responsive-layout-strategy}

The Responsive Layout Strategy ensures that the MUIDS Lab Booking App provides a seamless, high-performance experience across all devices. By adopting a **"Mobile-First"** approach, we design for the most constrained environment (the smartphone) first, and then layer on complexity for larger screens. This strategy guarantees functional parity; a teacher can book a lab just as easily on an iPhone 15 using Safari as they can on a Windows workstation using Chrome. This section provides the specific breakpoints and logic used to adapt the spatial hierarchy dynamically. 

### **1.4.1 Breakpoint Definitions (Mobile, Tablet, Desktop)** {#1.4.1-breakpoint-definitions-(mobile,-tablet,-desktop)}

We utilize Tailwind’s standard breakpoint system to trigger layout shifts. In "Mobile-First" development, styles applied without a prefix target mobile devices, while `md:` and `lg:` prefixes define behavior for larger viewports. 

| Screen Size | Breakpoint | Tailwind Prefix | Layout Strategy | Navigation Style |
| ----- | ----- | ----- | ----- | ----- |
| **Mobile** | **`< 768px`** | **`(default)`** | **Stacked/Scrollable:** Forms occupy full width; grid cells become larger for finger-tap targets. | **Bottom Nav:** Primary actions move to a bottom-floating bar (Thumb Zone). |
| **Tablet** | **`768px - 1024px`** | **`md:`** | **Condensed:** Sidebar collapses to icons; the grid uses horizontal scrolling for timeline. | **Icon-Sidebar:** Compact navigation to maximize horizontal workspace. |
| **Desktop** | **`> 1024px`** | **`lg:`** | **Full Canvas:** Side-by-side layouts, multi-column grid, and hover-triggered tooltips.  | **Fixed Sidebar:** Permanent navigation with visible text labels. |

### **1.4.2 The "Mobile-Smart" Grid Logic:** Horizontal Overflow logic {#1.4.2-the-"mobile-smart"-grid-logic:-horizontal-overflow-logic}

Because the Lab Timeline consists of 8+ periods per day, forced-fitting this onto a vertical mobile screen would result in unreadable, tiny cells. To solve this, we implement **Horizontal Overflow Logic.** 

* **The Technique:** The grid is contained within a parent wrapper that allows horizontal swiping (`overflow-x-auto`), while the grid itself maintains a minimum legible width.  
  **Spatial Hierarchy:** The "Time Labels" or "Lab Names" column should ideally be **Sticky** (`sticky left-0`) so they remain visible while the user scrolls through the periods.  
  **Tailwind Context:**  
* **Wrapper:** `overflow-x-auto scrollbar-hide` (to keep the swipe smooth).  
* **Grid:** `min-w-[800px] lg:min-w-full`. (This forces the grid to be at least 800px wide on mobile to prevent squishing, but allows it to span the full screen on desktop).

### **1.4.3 Code-Wireframe: Responsive Containers** {#1.4.3-code-wireframe:-responsive-containers}

| Component | Mobile State (default) | Desktop State (lg:) |
| ----- | ----- | ----- |
| **Main Container** | flex-col px-2 | flex-row px-8 |
| **Booking Modal** | fixed inset-0 h-full w-full | rounded-xl max-w-lg shadow-2xl |
| **Lab Grid Cell** | h-16 text-base (Tap-friendly) | h-12 text-sm |
| **Input Fields** | text-base (Prevents iOS zoom) | text-sm |

## **1.5 Guest Landing & Unauthorized State Layout (`UI_Unauthorized.html`)** {#1.5-guest-landing-&-unauthorized-state-layout-(ui_unauthorized.html)}

### **1.5.1 Structural Layout & Visual Elements** {#1.5.1-structural-layout-&-visual-elements}

The unauthorized state relies on a focused, single-card layout to eliminate distractions and guide the user toward a resolution.

* **Shell Structure:** A full-screen flex container to perfectly center the message.  
  * *Tailwind Context:* `h-screen w-screen bg-slate-50 flex items-center justify-center p-4`  
* **The Content Card:** A focused, elevated container.  
  * *Tailwind Context:* `bg-white rounded-xl shadow-xl max-w-md w-full p-8 border border-slate-200 text-center`

### **1.5.2 Content & Typography** {#1.5.2-content-&-typography}

* **Header Icon:** A high-visibility shield or alert icon (e.g., Lucide `ShieldAlert`) to quickly communicate a permissions issue.  
  * *Tailwind Context:* `text-amber-500 bg-amber-50 p-4 rounded-full inline-block mb-4`  
* **Main Heading:** Clear, non-punitive language.  
  * *Tailwind Context:* `text-2xl font-bold text-slate-900 mb-2` (Text: "Access Required")  
* **Context Text (Dynamic):** It is critical that the user knows *why* they are blocked. This block must dynamically inject the user's active session email.  
  * *Tailwind Context:* `text-sm text-slate-600 mb-6`  
  * *Dynamic Logic:* "Your current account (**\${userEmail}**) does not have permission to access the Lab Booking System."  
* **Call to Action (CTA):** A clear path to resolve the issue.  
  * *Tailwind Context:* `w-full py-3 bg-muids-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition`  
  * *Action:* A `<a href="mailto:talt.muids@mahidol.ac.th">` link pointing directly to the system administrator's inbox.

  # **2\. Teacher Module: "My Timeline" (`JS_TeacherView.html`)** {#2.-teacher-module:-"my-timeline"-(js_teacherview.html)}

The Teacher Module is the primary functional interface for MUIDS Science faculty members, designed to transform the complex task of lab coordination into a high-speed, visual workflow. At its core, this module provides a personalized "Timeline" view that filters out administrative noise, allowing teachers to focus exclusively on their own schedule and the real-time availability of resources. The UX objective here is **Frictionless Booking**: by utilizing a familiar grid-based calendar and a semi-automated selection process, teachers can secure multiple lab periods for an entire week in under sixty seconds. This module adheres strictly to the **1:1 Mirror Promotion Protocol**, ensuring that all teacher-specific logic is encapsulated within `JS_TeacherView.html` for easy deployment and testing. 

## **2.1 The Timeline Grid** {#2.1-the-timeline-grid}

The Timeline Grid is the heartbeat of the teacher experience. It is a highly interactive, 8-period per day calendar that dynamically reflects the state of the Google Sheet database. Each "Cell" in the grid is not just a data point but a functional button that initiates the booking journey. 

### **2.1.1 Cell States: Available** {#2.1.1-cell-states:-available}

To satisfy the **Dual-Coding (Accessibility)** requirement, every cell state is defined by a specific combination of Tailwind colors and Lucide icons.

| State | Purpose | Visual Spec (Tailwind) | Icon (Lucide) |
| ----- | ----- | ----- | ----- |
| **Available** | Empty slot ready for booking. | `bg-white hover:bg-blue-50 border-dashed border-gray-200` | `Plus` (on hover) |
| **Selected** | Slot currently in the Selected Slots staging area. | `bg-muids-blue text-white ring-2 ring-offset-1 ring-muids-blue` | CheckCircle |
| **Pending** | Booking submitted, awaiting TALT. | `bg-amber-100 text-amber-700 border-amber-200` | Clock |
| **Booked (Self)** | Confirmed slot owned by user. | `bg-emerald-100 text-emerald-800 border-emerald-300` | CalendarCheck |
| **Booked (Other)** | Lab occupied by another teacher. | `bg-gray-100 text-gray-400 cursor-not-allowed` | Lock |
| **N/A (TALT)** | Lab blocked for maintenance. | `bg-slate-200 text-slate-500 diagonal-lines` | Slash |

### **2.1.2 Code-Wireframe: Grid Interaction** {#2.1.2-code-wireframe:-grid-interaction}

| Interaction | Before (Static State) | After (Action State) |
| ----- | ----- | ----- |
| **Hover (Empty Cell)** | Subtle border. | Cell brightens; `+` icon appears; cursor becomes `pointer`. |
| **Click (Available)** | `state: available` | `state: selected`; Selected Slots panel (2.2) animates into view. |
| **Click (Selected)** | `state: selected` | Reverts to `available`; removed from Selected Slots. |
| **Hover (Booked)** | Shows "Subject \- Room" | Shows "Click to View Details" (Tooltip). |

### **2.1.3 Responsive Behavior (Mobile-Smart Logic)** {#2.1.3-responsive-behavior-(mobile-smart-logic)}

* **Touch Targets:** On mobile viewports, the grid container activates `overflow-x-auto`. Each cell height increases to `h-20` to ensure a generous "tap zone" for fingers.  
* **Sticky Labels:** The far-left column (Period 1-8 labels) remains **fixed** (`sticky left-0 bg-white z-10`) as the teacher swipes horizontally through the days of the week.

## **2.2 The Selected Slots Panel (Modal\_SelectedSlots.html)** {#2.2-the-selected-slots-panel-(modal_selectedslots.html)}

The Selected Slots panel is the "staging area" for the Teacher’s booking workflow. It solves the problem of repetitive data entry by allowing teachers to highlight multiple slots across different days or labs and then group them into a single submission. This component follows the Efficiency and Feedback principles by remaining invisible until needed and providing a clear, real-time summary of the user's intent. Because this is a shared utility for teachers, it is encapsulated in `Modal_SelectedSlots.html`.  

### **2.2.1 Spatial Hierarchy:** Fixed bottom-floating bar {#2.2.1-spatial-hierarchy:-fixed-bottom-floating-bar}

* **Desktop:** A floating, horizontal bar or "pill" centered at the bottom of the screen. It should have a high `z-index` to float above the grid.  
* **Mobile:** A full-width bar docked at the bottom of the viewport (`bottom-0`), ensuring the "Confirm" button is within the natural thumb-reach zone.  
* **Tailwind Context:** `fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-gray-200 rounded-2xl z-50 p-4 transition-all duration-300`.

### **2.2.2 Interaction:** "Code-Wireframe" {#2.2.2-interaction:-"code-wireframe"}

The Selected Slots panel exists in two primary states: Hidden (when 0 slots are selected) and Active (when 1+ slots are selected). It uses a "Slide-Up" animation to enter the screen.

| State | Logic Condition | UI Element / Tailwind |
| ----- | ----- | ----- |
| **Hidden** | `selectedSlots.length === 0` | `opacity-0 translate-y-10 pointer-events-none` |
| **Active** | `selectedSlots.length > 0` | `opacity-100 translate-y-0 animate-slide-up` |
| **Counter** | Real-time Integer | `bg-muids-blue text-white rounded-full px-2 text-xs` |
| **Action Button** | "Submit Batch (\[X\] Slots)" | `bg-muids-blue hover:scale-105 active:scale-95 transition-transform` |

**Interaction Flow:**

1. User clicks an "Available" cell in the grid.  
2. The cell turns **Mahidol Blue** (Selected).  
3. The Selected Slots panel slides up from the bottom.  
4. User can click "Clear" to reset or "Submit Batch" to open the Multi-Slot Modal (2.3)..

### **2.2.3 Responsiveness:** Mobile UI {#2.2.3-responsiveness:-mobile-ui}

To ensure the Selected Slots panel is usable on smaller screens (iPhone/Android), the layout shifts from a spacious horizontal bar to a compact, vertical-friendly bar. 

* **Mobile Transformation:**  
  * **Width:** Changes from `max-w-2xl` to `w-full`.  
  * **Border Radius:** Becomes `rounded-t-3xl rounded-b-none` to "anchor" it to the bottom edge.  
  * **Layout:** Moves from `flex-row` (Desktop) to a more condensed `flex-col` or justified `flex-row` depending on the number of slots selected.  
* **Tailwind Context:** `bottom-0 md:bottom-6 rounded-none md:rounded-2xl`.

## **2.3 Booking Flow** {#2.3-booking-flow}

The Booking Flow is the final step of the teacher’s primary journey. It transitions from the "browsing" state (the grid) and "collecting" state (the selected slots panel) into the "commitment" state. This flow uses a central modal interface to capture the necessary metadata for the reservation. To minimize cognitive load, the form is designed to handle multiple slots simultaneously, ensuring that a teacher booking Periods 1-3 for a specific lab only has to fill out the form once. 

### **2.3.1 The Multi-Slot Modal** {#2.3.1-the-multi-slot-modal}

* **Spatial Hierarchy:** A centered overlay modal with a backdrop blur. On mobile, it expands to a full-screen "drawer" to ensure the keyboard doesn't obscure input fields.  
* **Tailwind Context:** `fixed inset-0 flex items-center justify-center z-[60] p-4 md:p-0`; Modal box: `bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden`.  
* **Components:**  
  1. **Header:** Displays "New Booking" and a summary of selected slots (e.g., "3 Slots Selected").  
  2. **Form Fields:** \* **Subject Name:** (Required) Text input.  
     * **Room/Lab Choice:** Dropdown (pre-filled if a specific lab was selected in the grid).  
     * **Equipment/Special Requests:** Textarea for technician notes.  
  3. **Footer:** "Cancel" (Ghost button) and "Submit Batch" (Primary Mahidol Blue button).  
* **Code-Wireframe: Booking Modal:**

| Element | Mobile State | Desktop State | Interaction / Logic |
| ----- | ----- | ----- | ----- |
| **Container** | `h-full rounded-none` | `max-h-[90vh] rounded-2xl` | `animate-fade-in` |
| **Slot Summary** | Vertical list of dates | Horizontal scrollable tags | Shows exactly what is being booked. |
| **Confirm Button** | Full-width at bottom | Right-aligned in footer | Triggers `API_Write.gs` \+ Spinner. |
| **Error Feedback** | Red ring on empty fields | Shake animation on button | Prevents submission if `Subject` is empty. |

### **2.3.2 Quick-Book Templates** {#2.3.2-quick-book-templates}

To maximize **Efficiency (1.1.2)**, the modal includes a "Quick-Book" dropdown. This allows teachers to save and reload their most common booking configurations (e.g., "Biology Grade 10 \- Day B Pattern").

* **Visual Application:** A small "Star" or "Bookmark" icon next to the Subject field.  
* **UI Behavior:** \* Clicking the icon opens a list of "Recent/Saved" configurations.  
  * Selecting a template auto-populates the Subject, Lab, and Equipment fields instantly.  
* **Tailwind Context:** `bg-slate-50 border-l-4 border-muids-blue p-2 mb-4 text-sm cursor-pointer hover:bg-slate-100`.  
* **Interaction States: The "Commit" Sequence**

| Phase | UI Behavior | Visual Feedback |
| ----- | ----- | ----- |
| **Submission** | Button transitions to "Processing..." | `cursor-not-allowed` \+ Spinner icon. |
| **Success** | Modal closes; Grid updates. | **Success Toast** (4.2.1) "Batch Submitted Successfully\!" |
| **Failure** | Modal stays open; Error message. | **Error Toast** (4.2.1) "Lab already taken." |

---

# **3\. TALT Module: "Master Dashboard" (`JS_TaltView.html`)** {#3.-talt-module:-"master-dashboard"-(js_taltview.html)}

The TALT Module is the administrative engine of the application, designed to provide "God-mode" oversight of the entire MUIDS lab ecosystem. While the Teacher Module is optimized for personal scheduling, the TALT Dashboard is built for **Conflict Resolution** and **High-Volume Processing**. It must present a high-density data environment that allows a technician to oversee multiple labs, identify scheduling overlaps, and manage technician assignments at a glance. Following the **1:1 Mirror Promotion Protocol**, this module consolidates all administrative logic within `JS_TaltView.html`, ensuring that advanced management features are decoupled from the teacher experience. 

## **3.1 The Master Grid** {#3.1-the-master-grid}

The Master Grid represents a significant shift in spatial hierarchy compared to the teacher view. Instead of focusing on a single calendar, it aggregates all lab facilities and technician duties into a unified multi-column view.

### **3.1.1 Visual Complexity:** Multi-Lab/TALT Management {#3.1.1-visual-complexity:-multi-lab/talt-management}

* **Primary Container:** Fixed-header interactive grid structure (`Grid_Calendar.html`).   
* **X-Axis (Horizontal Column Headers):** Represents the chronological progression of the school week (Monday through Friday). Each day column header contains a 4-tier vertical stack:   
  * **Weekday Name:** (e.g., `Mon`, `Tue`, `Wed`)  
  * **Calendar Date:** (e.g., `Aug 10/2026`)  
  * **DayType Badge:** (e.g., `Day A`, `Day B`, `Day C`)  
  * **BellType Indicator:** (e.g., `Regular`, `Wed`, `Shortened 45min`, `Shortened 50min`)  
* **Y-Axis (Vertical Row Headers):** Lists periods or lab spaces depending on the active view state.   
* **Sticky Positioning:** The top X-axis header row is pinned using `sticky top-0 z-30 bg-slate-100` to remain visible while scrolling through vertical period/lab rows. 

Code-Wireframe (Header State Breakdown) 

| Header Sub-Element | Visual Target | Tailwind CSS Specification | Dynamic Data Binding Source |
| :---- | :---- | :---- | :---- |
| **X-Axis Cell Container** | Sticky top column header card | sticky top-0 z-30 flex flex-col items-center justify-center p-2 bg-slate-50 border-b-2 border-r border-slate-200 min-w-\[140px\] select-none | Calendar.gs → getCalendarData |
| **Weekday & Date** | Bold primary text line | text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1 | Calendar\!A:A (Mon, Aug 10/2026) |
| **DayType Badge** | High-visibility pill badge | mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-\[11px\] font-semibold bg-muids-blue/10 text-muids-blue border border-muids-blue/20 | Calendar\!B:B (DayType) |
| **BellType Badge** | Compact status indicator | mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded text-\[10px\] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 | Calendar\!F:F (BellType) |

UI States: Before vs. After Interaction 

| Interaction Trigger | State Before Interaction | State After Interaction | Applied Tailwind / Micro-Interaction |
| :---- | :---- | :---- | :---- |
| **Hover Header Cell** | Default background (bg-slate-50) | Subtle highlight (bg-slate-100) | transition-colors duration-150 hover:bg-slate-100 |
| **Shortened Schedule** | Standard BellType badge (bg-amber-50) | Warning highlight for non-regular days | bg-rose-50 text-rose-700 border-rose-200 animate-pulse-once |
| **Active Date Column** | Standard border styling | Highlighted border/accent indicator for current day | border-t-4 border-t-muids-blue bg-blue-50/30 |

### **3.1.2 Conflict UI:** Visual Flagging of Overlaps {#3.1.2-conflict-ui:-visual-flagging-of-overlaps}

The Master Grid serves as an early-warning system. It must clearly distinguish between a standard booking and a conflict that requires administrative intervention.

| State | Visual Application (Tailwind) | Logic / Trigger |
| ----- | ----- | ----- |
| **Normal Booking** | `bg-emerald-50 text-emerald-700` | Single confirmed reservation. |
| **Pending Request** | `bg-amber-50 text-amber-700` | Teacher has submitted but not yet approved. |
| **Conflict State** | `bg-red-100 text-red-700 border-2 border-red-500 animate-pulse` | **Critical:** Two or more teachers have requested the same slot. |
| **Outage Block** | `bg-slate-700 text-white opacity-50 diagonal-lines` | Lab is closed for maintenance/cleaning. |

**Code-Wireframe: Master Grid Cells**

| Interaction | Visual Change | Logic |
| ----- | ----- | ----- |
| **Click Conflict** | Modal opens highlighting all parties involved. | Triggers Batch Workspace (3.2)  |
| **Right Click** | Context Menu: "Quick Approve" or "Reject". | Rapid administrative action. |
| **Cell Hover** | Tooltip: Teacher Name \+ Subject \+ TALT Assigned. | Detailed metadata without clicking. |

## **3.2 The Batch Workspace (Modal\_BatchAction.html)** {#3.2-the-batch-workspace-(modal_batchaction.html)}

The Batch Workspace is the central high-speed processing unit for TALT administrators. It bridges the gap between identifying pending requests on the Master Grid and committing those changes to the database. By consolidating multiple, disparate booking requests into a single "Staging Area," the Batch Workspace allows TALTs to perform bulk approvals or denials in seconds. This component is the primary tool for maintaining the Efficiency (1.1.2) principle, ensuring that administrators spent less time on data entry and more time on lab preparation. 

### **3.2.1 Staging Area: The Review Workspace** {#3.2.1-staging-area:-the-review-workspace}

The Staging Area provides a clean, tabular summary of all selected slots before they are committed. It strips away the visual noise of the calendar grid to focus entirely on the metadata required for approval.

* **Spatial Hierarchy:** A large, centered modal overlay. On desktop, it utilizes a wide-screen format to display data columns side-by-side. On mobile, it transitions to a vertically-scrolling list of "cards."  
* **Data Columns:** Date, Period, Teacher Name, Subject, Lab Name, and Technician Note.  
* **Tailwind Context:** `w-full max-w-4xl bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden`. The table body uses `max-h-[60vh] overflow-y-auto` to handle large batches without expanding the modal past the viewport limits.

### **3.2.2 Action Logic: Bulk & Individual Controls** {#3.2.2-action-logic:-bulk-&-individual-controls}

The power of the Batch Workspace lies in its dual-layered action logic. TALTs can set a "Global Intent" while still maintaining the "Granular Control" required for complex scheduling.

* **Global Actions (The Header):** A "Master Toggle" that allows the user to set the entire batch to "Approve" or "Decline" with one click.  
* **Individual Overrides:** Each row features a dedicated toggle or segmented control (Approve | Decline | Skip). This is essential for scenarios where four slots are fine, but one has a conflict.  
* **The Commit Button:** A high-visibility button that displays the final tally (e.g., "Commit 5 Approvals, 1 Denial").  
* **Code-Wireframe:** Batch Workspace Logic

| Element | Visual State | Tailwind / Visual Spec | Logic |
| ----- | ----- | ----- | ----- |
| **Global Toggle** | Segmented Switch | `bg-slate-200 p-1 rounded-md flex` | Sets `allRows.status` |
| **Request Row** | Alternating stripes | `odd:bg-white even:bg-slate-50` | Individual data display |
| **Status Badge** | Color-coded pill | `bg-emerald-100 (App) / bg-red-100 (Dec)` | Visual state of specific row |
| **Commit Action** | Primary Button | `bg-muids-blue hover:bg-blue-800 w-full md:w-auto` | Triggers `API_TALT.gs` |

* **Interaction States: The Approval Sequence**

| State | Action | Visual Feedback |
| ----- | ----- | ----- |
| **Selection** | Toggling a row to "Decline" | Row background shifts to a subtle red tint; icon changes to `X`. |
| **Processing** | Clicking "Commit" | Modal shows a "Processing Batch..." overlay with a progress bar. |
| **Completion** | API success | Modal closes; Master Grid (3.1) updates instantly; Success Toast appears. |
| **Error** | Network Timeout | Conflict rows are highlighted in red; specific error message appears per row. |

## **3.3 Lab Outage Manager:** {#3.3-lab-outage-manager:}

The Lab Outage Manager is the system’s "Safety Valve," allowing TALTs to preemptively take lab facilities "offline." Whether for deep cleaning, equipment repair, or school-wide events, this tool ensures that the digital booking system reflects the physical reality of lab availability. When an outage is set, it creates a "Hard Block" in the database, instantly removing those slots from the Teacher’s "Available" pool. This prevents the administrative nightmare of having to cancel teacher bookings after they have already been made. 

### **3.3.1 UI State: "Blocking" specific days/times for maintenance.** {#3.3.1-ui-state:-"blocking"-specific-days/times-for-maintenance.}

An "Outage" state must be visually distinct from a "Booked" state to prevent TALTs and Teachers from assuming a lab is simply occupied by another class. 

*  **Visual Application:** Uses a dark, high-contrast aesthetic with a diagonal pattern to signify "Do Not Enter."  
* **Tailwind Context:** `bg-slate-700 bg-opacity-90 text-slate-100 diagonal-lines cursor-not-allowed`.  
* **Design Instruction:** The text label within the cell should change to "CLOSED" or "MAINTENANCE" in all-caps, bold font.  
* **Code-Wireframe: Outage Interaction**

| Interaction Phase | UI Element | Tailwind / Visual Spec | Action / Logic |
| ----- | ----- | ----- | ----- |
| **Activation** | "Maintenance Mode" Toggle | `bg-red-600 when Active` | Enables "Click-to-Block" on Master Grid. |
| **Selection** | Dragging over slots | `border-2 border-red-500 bg-red-50/20` | Highlights target slots for outage. |
| **Active Outage** | Slashed Cell | `bg-slate-800 text-white opacity-70` | Prevents teacher selection in `TeacherView`. |
| **Removal** | Trash/Delete Icon | `hover:text-red-500 transition-colors` | Triggers `talt_deleteOutage()` in `API_TALT.gs`. |

### **3.3.2 Outage Form Logic** {#3.3.2-outage-form-logic}

When a TALT clicks to create an outage, a simplified modal appears to capture the reason.

* **Fields:**  
  1. **Reason:** (e.g., "Chemical Inventory," "AC Repair").  
  2. **Scope:** Single Period vs. Full Day vs. Date Range.  
* **Safety Check:** If a TALT attempts to block a slot that **already has a booking**, the UI must show a "Conflict Warning" modal asking if they want to automatically "Decline & Notify" the affected teacher.  
* **Responsive Behavior**  
* **Mobile View:** On small screens, the "Maintenance Mode" toggle moves to the top of the Master Dashboard. Outage cells remain visible but are simplified to a simple gray "X" to save space on the horizontal-scroll grid.

## **3.4 TALT Workload Stats Modal (`Modal_Workload.html`)** {#3.4-talt-workload-stats-modal-(modal_workload.html)}

The Workload Stats Modal is a read-only data visualization tool designed to prevent TALT burnout and ensure lab safety compliance. It acts as a "Validation Bridge" between the TALT's current assignments and the organizational limits defined in the backend.

### **3.4.1 Trigger & Context** {#3.4.1-trigger-&-context}

* **Trigger:** A small info icon (Lucide `Info`) or a "Stats" button positioned immediately to the right of the **TALT Assignment Dropdown** in the Master Grid.  
* **UX Goal:** Provide a "Quick Look" at capacity without forcing the TALT to leave the current booking workflow.

### **3.4.2 UI Layout & Content** {#3.4.2-ui-layout-&-content}

* **Structure:** A centered, fixed modal with a specialized width of `max-w-[500px]`.  
* **Style:** `bg-white rounded-lg shadow-2xl p-8`.  
* **Content Grid:** A 1-column vertical stack for mobile, scaling to a 2-column grid for desktop.

| Stat Metric | Logic / Limit | Visual Indicator (Tailwind) |
| ----- | ----- | ----- |
| **Daily Sessions** | Current vs. **6 Max** | Horizontal Progress Bar. |
| **Consecutive** | Current vs. **3 Max** | Horizontal Progress Bar. |
| **Weekly Total** | Aggregated Count | Simple Badge: `bg-slate-100 text-slate-700`. |

### **3.4.3 Dynamic Progress Bar Logic** {#3.4.3-dynamic-progress-bar-logic}

The progress bars must communicate "Pressure" through color shifts based on the percentage of the limit reached.

* **Standard (\<80%):** `bg-blue-600` (MUIDS Blue).  
* **Warning (\>80%):** `bg-amber-500` (Signals that the TALT is near their limit).  
* **Critical (100%):** `bg-red-600` (Limit reached).  
* **Tailwind Context:** `w-full bg-gray-200 h-4 rounded-full overflow-hidden`. The inner bar uses `transition-all duration-500`.  
* **Claude-Ready Spec: Workload Directive:**  
  * **File:** `Modal_Workload.html` / `JS_TaltView.html`  
  * **Instruction:** "When the Info icon is clicked, the app must call `talt_getWorkloadStats(taltName)`. The modal should render three `div` bars. Use a template literal to inject the width percentage: `style="width: ${percentage}%"`. If `percentage >= 80`, swap the class `bg-blue-600` for `bg-amber-500`."

## **3.5 Interactive Template Configuration Control Panel (`Modal_EmailEditor.html`)** {#3.5-interactive-template-configuration-control-panel-(modal_emaileditor.html)}

This component serves as the layout wrapper and text editing interface for the system's email notification templates (e.g., "Booking Confirmed," "Booking Denied"). It allows high-level administrators to safely manipulate the system's outgoing communication strings without needing to edit the backend code.

### **3.5.1 Security & Component Context Checks** {#3.5.1-security-&-component-context-checks}

Because modifying system-wide templates is a highly privileged action, this modal has strict client-side rendering rules in addition to backend validation.

* **Initialization Check:** Upon rendering, the component must verify the global `Can_Edit_Config` state (pulled from `JS_Core.html`).

### **3.5.2 Disabled Fallback UI (Anti-Tamper)** {#3.5.2-disabled-fallback-ui-(anti-tamper)}

To maintain the Security & Permissions (6.4.4) protocol, the UI must gracefully handle unauthorized access.

* **Logic:** If a standard TALT or user forces this component to display through DOM modification (e.g., changing CSS `display: none` to `block` in the browser console), the UI must instantly lock itself down.  
* **Visual State:** All text areas, inputs, and the "Save" button must receive the `disabled` property attribute.  
* **Tailwind Context:** `bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200`.

### **3.5.3 Active Layout UI (Authorized Admin View)** {#3.5.3-active-layout-ui-(authorized-admin-view)}

When loaded by an authorized admin, the layout provides a clean, predictable text editing environment optimized for code/variable manipulation.

* **Typography:** Editable text fields must utilize monospace typography to make managing string placeholders (like `{teacher_name}` or `{lab_room}`) predictable and visually distinct from standard text.  
* **Tailwind Context:** `font-mono text-sm border-slate-300 rounded-md focus:border-muids-blue focus:ring-2 focus:ring-muids-blue/20 w-full min-h-[200px] resize-y p-3`.  
* **Action Footer:** A sticky bottom border with a primary "Save Changes" button (`w-full sm:w-auto`).

---

# **4\. Feedback & System States (Global Utilities)** {#4.-feedback-&-system-states-(global-utilities)}

This section details the critical "connective tissue" of the user interface—the visual signals that inform users about the system's background processes. In a web application powered by Google Sheets, network latency is an inherent factor. By implementing a robust feedback architecture, we transform potential moments of user uncertainty into clear, "system thinking" states. These utilities, primarily housed in `JS_Utilities.html`, ensure that every click results in an immediate visual response, whether it’s a skeleton loader during data initialization or a toast notification confirming a successful transaction. This layer is essential for maintaining the **Feedback (1.1.4)** and **Consistency (1.1.3)** principles across both Teacher and TALT modules. 

## **4.1 Loading & Shimmer (`JS_Utilities.html`)** {#4.1-loading-&-shimmer-(js_utilities.html)}

The "Shimmer" (or Skeleton) effect is our primary defense against perceived lag. Instead of showing a blank screen or a generic spinning wheel, we present a pulsing, low-fidelity version of the UI that mimics the eventual data layout. This reduces "Layout Shift" and provides a smoother psychological transition for the user. 

### **4.1.1 Tailwind `animate-pulse` for initial data fetching** {#4.1.1-tailwind-animate-pulse-for-initial-data-fetching}

*  **Definition:** A visual placeholder that occupies the exact space of the incoming content, pulsing in opacity to signal that the system is actively working.  
* **Visual Application:** Used primarily for the **Timeline Grid** cells and **Header Metadata** (like the A-E DayType) during the initial `google.script.run` call.  
* **Tailwind Context:** `bg-slate-200 animate-pulse rounded-md`.  
* **Code-Wireframe: Shimmer States**

| Element | Static Placeholder (Tailwind) | Logic / Trigger |
| ----- | ----- | ----- |
| **Grid Cell** | `h-full w-full bg-slate-100 animate-pulse` | isLoading \=== true |
| **DayType/BellType** | `h-4 w-24 bg-slate-200 rounded-full` | Prevents text "jumping" after load. |
| **Selected Slots Panel** | `h-12 w-48 bg-slate-50 border-dashed` | Used during batch processing. |
| **Modal Content** | `space-y-3 with multiple gray bars` | Used when fetching specific booking details. |

* **Interaction Flow:**  
  1. **Init:** User opens the app.  
  2. **State 1:** The `Index.html` renders the basic shell. `JS_Utilities` injects shimmer placeholders into the `#main-content` div.  
  3. **State 2:** `API_Read.gs` returns data.  
  4. **Transition:** Shimmer elements fade out (`opacity-0`) while real data elements fade in (`opacity-100`) using a `duration-300` transition.

## **4.2 The "Toast" Notification System** {#4.2-the-"toast"-notification-system}

The "Toast" system provides non-intrusive, transient feedback for background operations. Unlike modals, which interrupt the user's flow, toasts appear at the periphery of the interface to confirm actions or warn of errors. To ensure the system meets the **Clarity (1.1.1)** and **Feedback (1.1.4)** principles, these notifications must be color-coded and provide enough time for the user to read the message while offering an immediate manual exit. 

### **4.2.1 Component Architecture & Logic** {#4.2.1-component-architecture-&-logic}

* **Spatial Hierarchy:** \* **Desktop:** Fixed to the **top-right** of the viewport (`top-4 right-4`).  
  * **Mobile:** Transitions to the **top-center** (`top-4 left-1/2 -translate-x-1/2`) to ensure visibility without obstructing bottom navigation bars.  
* **Dismissal Logic:** \* **Auto-Dismiss:** Notifications persist for **5 seconds (5000ms)** before automatically fading out.  
  * **Manual Closure:** Every toast must feature a prominent **"X" (Close)** icon in the top-right corner for immediate manual dismissal.  
* **Tailwind Context:** `fixed flex items-center w-full max-w-xs p-4 rounded-lg shadow-xl z-[100] transition-all duration-500 transform ease-in-out`.  
* **Code-Wireframe: Toast Varieties**

| Type | Tailwind Spec (Background & Text) | Icon (Lucide) | Context / Trigger |
| ----- | ----- | ----- | ----- |
| **Success** | `bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500` | `CheckCircle` | "Batch Confirmed", "Batch Approved" |
| **Error** | `bg-red-50 text-red-800 border-l-4 border-red-500` | `AlertOctagon` | "Conflict Detected,", "Network Timeout" |
| **Warning** | `bg-amber-50 text-amber-800 border-l-4 border-amber-500` | `AlertTriangle` | "Partial Batch Processed", "Proxy Mode Active" |

* **Interaction Details**

| Element | Visual Style | Interaction |
| ----- | ----- | ----- |
| **The "X" Button** | `text-gray-400 hover:text-gray-900 ml-auto` | Click: Triggers immediate `remove()` from DOM. |
| **Entrance** | `animate-slide-in-right` | Slides 100% from the right edge into position. |
| **Exit** | `opacity-0 scale-95` | Smooth fade and slight shrink upon dismissal. |
| **Stacking** | `space-y-2` | If multiple toasts trigger, they stack vertically with 8px gaps. |

* **Claude-Ready Spec: Toast Utilities**  
  * **File:** `JS_Utilities.html`  
  * **Instructions:** "Create a `showToast(message, type)` function. It should inject a DIV into a `toast-container`. Use a `setTimeout` of 5000ms for auto-removal. Ensure the 'X' button is a `<button>` element with an `aria-label='Close'`. The background must use `backdrop-blur` if displayed over the grid." 

## **4.3 The Onboarding Overlay** {#4.3-the-onboarding-overlay}

The Onboarding Overlay is the "concierge" for first-time users. Since this app introduces a new booking paradigm (the A-E cycle and the Selected Slots panel), we can't assume every teacher will immediately understand the workflow. This component provides a high-level, three-step walkthrough that highlights key interface elements. It follows the **Clarity (1.1.1)** principle by ensuring that "User Friction" is eliminated within the first 30 seconds of their first session.

### **4.3.1 The "Spotlight" Mechanism** {#4.3.1-the-"spotlight"-mechanism}

The onboarding doesn't just show a static message; it uses a **Spotlight Effect** to dim the rest of the UI and draw focus to specific components (e.g., the DayType indicator or the Selected Slots panel).

* **Spatial Hierarchy:** A centered modal for the welcome message, followed by localized "Tooltips" that point to specific UI elements.  
* **Tailwind Context:** \* **Backdrop:** `fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]`.  
* **Spotlight Ring:** `ring-[9999px] ring-slate-900/60 transition-all duration-500`.

### **4.3.2 Walkthrough Sequence** {#4.3.2-walkthrough-sequence}

| Step | Target Element | Message / Guidance | Action |
| ----- | ----- | ----- | ----- |
| **1: Welcome** | Screen Center | "Welcome to the new Lab Booking App. Let’s get you oriented." | Button: "Start Tour" |
| **2: The Cycle** | Header (Section 1.2.3) | "Check here for the **Day A-E Cycle** and special **Bell Schedules**." | Button: "Next" |
| **3: Selection** | The Grid (Section 2.1) | "Click multiple slots to build your booking list. They'll appear in your Selected Slots below." | Button: "Got it\!" |

### **4.3.3 Logic & Persistence**  {#4.3.3-logic-&-persistence}

* **Trigger:** The overlay triggers automatically if the `hasCompletedTutorial` flag is `true` in the `Users` sheet.  
* **Dismissal:** Users can click "Skip Tour" at any time. Clicking "Finish" or "Skip" sends a quick update to the server (`API_Write.gs`) to set `hasCompletedTutorial` to `false`, ensuring they never see the tour again.  
* **Visual Spec (The Modal):**  
  * **Header:** `text-2xl font-bold text-muids-blue`.  
  * **Illustration:** A simple SVG icon of a lab flask or a calendar.  
  * **Progress Dots:** `flex justify-center gap-2 mt-4` using `h-2 w-2 rounded-full`.  
* **Code-Wireframe: Onboarding UI**

| Element | Mobile State | Desktop State |
| ----- | ----- | ----- |
| **Modal Size** | `w-[90%] max-w-xs` | `max-w-md` |
| **Buttons** | Full-width Stacked | Inline Right-Aligned |
| **Spotlight** | Full-row highlight | Circular highlight |

## **4.4 Cross-Browser & OS Verification:** {#4.4-cross-browser-&-os-verification:}

This section defines the "Definition of Done" regarding compatibility. Given that MUIDS faculty and staff utilize a diverse range of personal and school-issued devices, the application must maintain layout integrity and functional parity across all major platforms. The Engineer is responsible for verifying that modern CSS features (like `backdrop-blur` and `sticky` positioning) degrade gracefully or function correctly on the following targets. 

### **4.4.1 Target Environment Matrix** {#4.4.1-target-environment-matrix}

| OS | Primary Browser | Key Focus Area |
| ----- | ----- | ----- |
| **Windows 11** | Chrome / Edge | Hover states, scrollbar aesthetics, and performance on low-spec laptops. |
| **macOS** | Safari | `backdrop-blur` rendering and standard system font scaling. |
| **iOS (iPhone)** | Safari | **The 16px Zoom Rule:** Inputs must not trigger auto-zoom. Bottom Nav "Thumb Zone" check. |
| **Android** | Chrome | Responsive grid overflow handling and keyboard-overlay behavior. |
| **iPadOS** | Safari | Tablet-view layout (Section 1.4.1) and "Tap-vs-Hover" logic. |

### **4.4.2 The "Strict Compatibility" Checklist** {#4.4.2-the-"strict-compatibility"-checklist}

1. **Input Zoom Prevention:** All text inputs must be at least `text-base` (16px) on mobile to prevent iOS Safari from forced-zooming, which breaks the fixed header layout.  
2. **Sticky Header Reliability:** Verify that the **Proxy Banner** (1.2.2) and **Sticky Lab Column** (3.1.1) do not "jitter" or disappear during fast scrolling on mobile browsers.  
3. **Safe Areas:** Ensure the Selected Slots panel (2.2) respects the "Home Bar" area on bezel-less iPhones (using `pb-safe` or equivalent padding).  
4. **Iframe Sandboxing:** Since GAS runs in a sandbox, verify that all external assets (Lucide Icons, Tailwind CDN, Google Fonts) load correctly without being blocked by strict browser "Enhanced Tracking Protection."

### **4.4.3 Performance Thresholds** {#4.4.3-performance-thresholds}

* **Initial Load:** The "Shimmer" (4.1) should appear within **1.5 seconds** of the URL being opened.  
* **Interaction Latency:** Toast notifications (4.2) and Modal transitions must maintain a steady **60fps** animation speed, even on older 2020-era iPads.

---

# **5\. Component Library (Tailwind Specs)** {#5.-component-library-(tailwind-specs)}

The Component Library is the "Lego Kit" for the application. By standardizing these atomic elements, we ensure that the Engineer doesn't reinvent the wheel for every new feature. This section provides the exact Tailwind CSS recipes for the interface’s most common interactive elements. This approach guarantees **Consistency (1.1.3)** and allows for rapid global styling updates—if we decide to change the "Danger Red" shade, we update it here, and every "Delete" button in the app follows suit. 

## **5.1 Buttons** {#5.1-buttons}

Buttons are the primary drivers of action. To maintain a professional and accessible UI, all buttons must adhere to a minimum height of **h-10 (40px)** to ensure they are easy to tap on mobile devices. All buttons should include a subtle transition (`transition-all duration-200`) to provide tactile feedback.

| Type | Tailwind Classes | Usage Context |
| ----- | ----- | ----- |
| **Primary** | `bg-muids-blue text-white hover:bg-blue-800 shadow-md active:scale-95` | Confirming a booking, Submitting a batch, "Next" in onboarding. |
| **Secondary** | `border-2 border-muids-blue text-muids-blue hover:bg-blue-50` | "Select Slot," "View Details," "Clear Selection." |
| **Danger** | `bg-status-denied text-white hover:bg-red-700 active:bg-red-800` | "Decline Request," "Delete Outage," "Cancel Booking." |
| **Ghost** | `text-gray-500 hover:bg-gray-100 hover:text-gray-700` | "Skip Tour," "Close Modal," "Back." |

**Interactive States (Universal)**

| State | CSS / Tailwind Behavior | Visual Signal |
| ----- | ----- | ----- |
| **Hover** | `hover:brightness-110` | The button subtly lightens or shifts color. |
| **Active/Click** | `active:scale-[0.98]` | The button "depresses" slightly to confirm the click. |
| **Disabled** | `opacity-50 cursor-not-allowed` | Grayed out when a form is incomplete or processing. |
| **Loading** | `relative text-transparent` | A spinner icon is centered while the text is hidden. |

### **5.1.1 Button Grouping & Layout** {#5.1.1-button-grouping-&-layout}

When multiple buttons appear together (e.g., in a Modal footer), they must follow a consistent spatial logic:

* **Desktop:** Grouped to the bottom-right. The **Primary** action is always the furthest to the right.  
* **Mobile:** Stacked vertically or spread 50/50. The **Primary** action must be at the top or the right-most side for thumb accessibility.  
* **Gap:** Standardized at `gap-3` (12px).  
* **Code-Wireframe: Action Footer**

```html
<div class="flex flex-col-reverse md:flex-row justify-end gap-3 p-4 border-t">
  <button class="btn-ghost">Cancel</button>
  <button class="btn-primary">Submit Batch</button>
</div>
```

## **5.2 Inputs & Selectors** {#5.2-inputs-&-selectors}

Input fields are where data entry happens, meaning they are the highest-friction points in the application. To minimize errors and cognitive load, our inputs must clearly communicate their current state (e.g., "Am I typing here?", "Did I do something wrong?"). We rely heavily on Tailwind's `ring` utility to provide highly visible, accessible focus indicators that align with the MUIDS brand.

### **5.2.1 Input State Matrix** {#5.2.1-input-state-matrix}

All form elements (Text Inputs, Dropdowns, Date Pickers) share a common baseline style to ensure vertical rhythm and visual consistency. The most critical aspect is the transition between the "Default," "Focused," and "Error" states.

| State | Visual Application & Tailwind Classes | UX Purpose |
| ----- | ----- | ----- |
| **Default** | `bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900` | Clean, standard resting state. |
| **Focused** | `outline-none border-muids-blue ring-2 ring-muids-blue/20` | User has clicked in. The blue glow signals active editing mode. |
| **Error** | `border-red-500 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20` | Validation failed. Red border and glow draw immediate attention. |
| **Disabled** | `bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed` | Uneditable fields (e.g., auto-filled TALT names). |

### **5.2.2 Specific Element Variations** {#5.2.2-specific-element-variations}

While they share states, different input types require slight structural tweaks:

* **Text Inputs (e.g., Subject Name):** Must use `text-base` (16px) on mobile viewports (`sm:text-sm`) to prevent iOS Safari from automatically zooming the page when the field is tapped.  
* **Select Dropdowns (e.g., Lab Room Choice):** Uses standard input styling but includes a custom dropdown arrow icon (Lucide `ChevronDown`) to replace the ugly default browser styling. `appearance-none pr-8 bg-no-repeat bg-[right_0.5rem_center]`.  
* **Textareas (e.g., Technician Notes):** Must have a minimum height (`min-h-[100px]`) and restrict resizing to vertical only (`resize-y`) so the user doesn't break the form layout by dragging it too wide.  
* **Code-Wireframe: Form Validation Example**

Here is how an input behaves dynamically during the Booking Flow (Section 2.3):

| User Action | Data State | UI Response | Associated Helper Text |
| ----- | ----- | ----- | ----- |
| *Views Form* | `subject` is empty | **Default State** | None |
| *Clicks Input* | `subject` is focused | **Focus State** (Blue Ring) | None |
| *Clicks "Submit" (Empty)* | `subject` fails validation | **Error State** (Red Ring) | `text-sm text-red-600`: "Subject is required." |
| *Types "Biology"* | `subject` is valid | Reverts to **Focus State** | Helper text disappears. |

## **5.3 Cards & Modals** {#5.3-cards-&-modals}

Cards and Modals represent the "containers" of our application. While the Grid provides the broad context, these elements house the specific details and interactive forms. To maintain a modern, "App-like" feel that distinguishes the interface from a standard spreadsheet, we utilize soft shadows, generous border radii, and background blurs. This section ensures that the structural depth of the UI remains consistent, whether a teacher is looking at a single booking or a TALT is managing a massive batch. 

### **5.3.1 Structural Specifications** {#5.3.1-structural-specifications}

| Component | Tailwind Classes | Design Intent |
| ----- | ----- | ----- |
| **Standard Card** | `bg-white rounded-xl shadow-sm border border-gray-100` | Used for individual booking details or sidebar widgets. |
| **Interactive Card** | `hover:shadow-md transition-shadow cursor-pointer` | Used when a card acts as a button (e.g., Template selection). |
| **Modal Container** | `bg-white rounded-2xl shadow-2xl overflow-hidden` | The "Stage" for all major forms and workflows. |
| **Backdrop Overlay** | `bg-slate-900/40 backdrop-blur-sm` | Dims the background to focus user attention on the modal. |

## **5.4 Iconography Standard (Lucide Mapping)** {#5.4-iconography-standard-(lucide-mapping)}

Per the PRD, we have standardized on the **Lucide** icon library. Icons are not decorative; they are functional signals that support our **Dual-Coding (1.1.1)** accessibility goal. By mapping specific icons to specific system states, we ensure that a user can understand the status of a lab slot without needing to read the text label. 

### **5.4.1 Global Icon Map** {#5.4.1-global-icon-map}

The Engineer should use these specific Lucide icons to maintain visual consistency across the Teacher and TALT modules.

| Category | Icon Name | Usage Context |
| :---- | :---- | :---- |
| **Actions** | `Plus` | Add a slot to the Selected Slots panel. |
| **Actions** | `X` | Close a modal or dismiss a toast. |
| **Navigation** | `ChevronLeft / Right` | Move between weeks in the timeline. |
| **Navigation** | `ChevronDown` | Custom dropdown indicator for lab selection. |
| **Status: Success** | `CheckCircle` | Confirmed bookings or successful API calls. |
| **Status: Pending** | `Clock` | Bookings awaiting TALT approval. |
| **Status: Conflict** | `AlertOctagon` | Double-bookings or system errors. |
| **Status: Warning** | `AlertTriangle` | Proxy mode or lab maintenance alerts. |
| **Roles** | `User / ShieldCheck` | Teacher profile vs. TALT/Admin status. |

### **5.4.2 Icon Styling & Sizing** {#5.4.2-icon-styling-&-sizing}

To prevent "Visual Noise," icons must be sized consistently relative to their surrounding text and container.

* **Standard UI Icon:** `w-5 h-5` (20px). Used in buttons and nav bars.  
* **Inline/Badge Icon:** `w-4 h-4` (16px). Used inside small status pills (e.g., "Day A").  
* **Feature/Hero Icon:** `w-8 h-8` (32px). Used in the center of the Onboarding Overlay (4.3).  
* **Color Logic:** Icons should inherit the text color of their parent element (e.g., `text-emerald-600` for a success badge) to ensure they remain cohesive with the state's color coding.

## **5.5 Responsive Grid Patterns** {#5.5-responsive-grid-patterns}

This section defines the structural logic that allows the application to scale from a 27-inch desktop monitor to a 6-inch smartphone screen. We follow a **Mobile-First** philosophy: styles are written for mobile by default and "unlocked" for larger screens using Tailwind breakpoints (`md:`, `lg:`). 

### **5.5.1 The "Mobile-Smart" Calendar Grid** {#5.5.1-the-"mobile-smart"-calendar-grid}

The 8-period school day is too wide for vertical mobile screens. Instead of shrinking the cells (which makes them unreadable), we force a minimum readable width and enable horizontal swiping. 

* **Logic:** The grid container allows horizontal overflow, while the "Lab Name" or "Date" column remains sticky so the user never loses context.  
* **Tailwind Context:** `overflow-x-auto snap-x`; **Grid:** `grid grid-cols-8 min-w-[800px] md:min-w-0`.  
* **UX Goal:** "Swipe to see the afternoon."

### **5.5.2 Selected Slots Panel Positioning** {#5.5.2-selected-slots-panel-positioning}

The Selected Slots panel must adapt to the "Thumb Zone"—the area of a phone screen most easily reached during one-handed use. 

* **Mobile: Becomes a full-width "Dock" at the very bottom.**  
  * `fixed bottom-0 left-0 w-full rounded-t-2xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]`  
* **Desktop: Becomes a floating "Pill" centered or right-aligned.**  
  * `md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-md md:rounded-full`

### **5.5.3 Modal & Form Scaling** {#5.5.3-modal-&-form-scaling}

To handle the "Software Keyboard" on mobile (which often covers 50% of the screen), modals must transition from centered boxes to full-screen overlays. 

* **Mobile:** `fixed inset-0 h-full w-full rounded-none` (Full-screen "Drawer" mode).  
* **Desktop:** `h-auto max-h-[90vh] w-[500px] rounded-2xl` (Floating modal).  
* **The 16px Rule:** All inputs on mobile must be `text-[16px]` to prevent the "iOS Safari Zoom" glitch that breaks fixed-positioning.

### **5.5.4 Claude-Ready Instruction Set (Responsiveness)** {#5.5.4-claude-ready-instruction-set-(responsiveness)}

1. **Target Files:** `Index.html`, `Modal_SelectedSlots.html`, `JS_Utilities.html`  
2. **Engineering Directive:** \> 1\. **Hit Targets:** Every clickable cell or button must maintain a minimum hit area of **44x44px** on mobile (`min-h-[44px]`) to accommodate touch interactions.  
3. **Overflow:** Wrap the `Timeline_Grid` in a container with `overflow-x-auto` and `webkit-overflow-scrolling: touch`.  
4. **Dynamic Spanning:** In the TALT Master View, use `grid-cols-[120px_1fr]` on mobile but `grid-cols-[200px_1fr]` on desktop to balance lab name visibility.  
5. **Z-Index Stack:** Ensure the following order: Grid (0) \< Selected Slots panel (50) \< Modals (60) \< Toasts (100). 

# **6\. Engineering Standards & Protocol** {#6.-engineering-standards-&-protocol}

This section defines the mandatory coding standards and file management rules required to maintain the **1:1 Mirror Promotion Protocol**. Every file in the system, whether `.gs` or `.html`, must be self-documenting to prevent logic drift during AI-assisted updates. 

## **6.1 From PRD Section 15.8: File Header Protocol** {#6.1-from-prd-section-15.8:-file-header-protocol}

Every generated file **must** begin with a standardized comment block. This metadata allows for rapid cross-referencing between the code and the PRD/Design Spec.

**Standardized Header Template:**

```js
/**
 * FILE: [FileName.ext]
 * PURPOSE: [Direct reference to the PRD module it serves]
 * DESIGN SPEC REF: [e.g., Section 2.2 / 5.5]
 * VERSION: [X.X.X]
 * LAST MODIFIED: [Date]
 * * PROTOCOL: 1:1 Mirror Promotion (PRD 17.2)
 * AUTHOR: Gemini (Engineering Mode)
 */
```

## **6.2 Application Rules** {#6.2-application-rules}

1. **Placement:** This header must be the very first lines of the file. No code or global variables should precede it.  
2. **HTML Files:** For `.html` files (which include our JS modules), the header must be wrapped in standard HTML comments: \`\`.  
3. **GS Files:** For `.gs` backend files, use the JSDoc style `/ ... */` as shown above.  
4. **Updates:** Every time Claude modifies a file, the **Version** number must be incremented (e.g., 1.0.1 to 1.0.2) and the **Last Modified** date updated.  
   1. For minor changes, apply the alphabet suffix (eg., 1.0.1a, to 1.0.1b)

## **6.3 Component Implementation Strategy (PRD 15.3)** {#6.3-component-implementation-strategy-(prd-15.3)}

To maintain the **Backend/Frontend Modularization** defined in your updated PRD, the Engineer must follow this assembly logic:

* **Logic Isolation:** Do not put UI styling in `.gs` files. All Tailwind classes and HTML structures stay in `.html` files.  
* **Scoped JS:** Functions in `JS_TeacherView.html` should never interact directly with the DOM elements of `JS_TaltView.html`.  
* **The Include Pattern:** The `Index.html` must remain a clean skeleton, using only `<?!= include('FileName') ?>` to assemble the final payload.

## **6.4 Compiled Engineering Directives (The "Claude" Cheat Sheet)** {#6.4-compiled-engineering-directives-(the-"claude"-cheat-sheet)}

These directives represent the critical "hidden logic" and technical requirements identified during the design phase. Claude must treat these as **Hard Constraints** for implementation.

### **6.4.1 Backend & Data Logic** {#6.4.1-backend-&-data-logic}

* **Unique Slot Identification:** Every grid cell must generate a standardized `SlotID` using the pattern: `$Date_Period_LabID$`. This is the primary key for all database operations.  
* **Validation Hard-Lock:** The "Confirm" button in `Modal_Details.html` must remain `disabled` via state management until the mandatory `Subject` field is populated. Never trust client-side validation alone; verify on the server in `API_Write.gs`.  
* **The "Dry Run" Protocol:** Before committing a batch in `API_TALT.gs`, perform a "Dry Run" check against `Lab_Settings`. If a TALT tries to approve a slot that was recently marked as an "Outage," the system must flag that row for manual review.  
* **Modular Fetching:** Use a `getShimmerTemplate(type)` function in `JS_Utilities.html` to inject skeleton loaders. This ensures consistent loading states across the Teacher and TALT modules.  
* **Workload Color Logic:** Progress bars in `Modal_Workload.html` must dynamically shift from `bg-blue-600` to `bg-amber-500` at the 80% threshold (e.g., 5/6 daily sessions or 2.5/3 consecutive).  
* **Tutorial Persistence:** The `Modal_Welcome.html` must verify the `hasCompletedTutorial` flag from the `Users` sheet. The "Finish" button must execute a server-side update to this specific column to prevent the tour from re-appearing on subsequent logins.   
* **Calendar DayType Translation Layer:** Data read operations targeting scheduling allowances shall not query transaction fields using absolute dates exclusively. The query sequence must route target timestamps through a translation module that looks up and returns the corresponding rotating school cycle letter (e.g., Day A, Day B) from the Calendar registry worksheet prior to computing availability matrices.  
* **Contextual Multi-Point Read Aggregation:** Backend lookup endpoints (such as \`getBookingDetails\`) must coordinate a triple-point cross-reference operation. Each transaction card evaluation cycle must simultaneously consolidate (1) active transaction row vectors, (2) calendar day-type cycle translations, and (3) user-specific operational restrictions declared within the \`TeacherTimeTables\` matrix.  
* 

### **6.4.2 Frontend & CSS Architecture** {#6.4.2-frontend-&-css-architecture}

* **The 16px Rule (iOS Safari):** All text inputs and select dropdowns must have a minimum font size of `text-base` (16px) on mobile. This prevents the "Auto-Zoom" glitch in Safari that breaks the application’s fixed layouts.  
* **Tailwind Halo Effect:** Use the `/20` opacity utility for focus rings (e.g., `ring-muids-blue/20`). This creates a professional, brand-aligned glow without requiring custom hex codes for light-blue shades.  
* **Visual Logic for Outages:** The "Diagonal Line" pattern for blocked labs should be implemented via a CSS `linear-gradient`. These cells must have `pointer-events-none` for users with the `Teacher` role.  
* **Sticky Context:** In the Master Grid (`JS_TaltView.html`), the Lab Name/TALT Name column must be `sticky left-0` with a higher `z-index` to maintain context during horizontal scrolling.  
* **Spin-State Locking:** When the Manual Revalidation button is clicked, it must apply `pointer-events-none` in addition to `animate-spin` to prevent users from spam-clicking the refresh function and overloading the Google Apps Script quota.  
* **Navigation Anchor Tag Bypass:** The application must utilize a strict `<button>` element architecture for all internal navigation, dropdowns, and interactive triggers. Native anchor tags (`<a href="#">`) must be avoided; inside the sandboxed Workspace `<iframe>` container, clicking empty hashes breaks the browser's local state routing and forcefully pushes the user out to broken OAuth URL dialog patterns (e.g., `createOAuthDialog=true#`).   
* **Inverted High School Schedule Matrix Layout:** To maximize immediate visual scannability for high school schedule matrices, the master calendar grid layout must utilize an inverted structural axis mapping. Periods (1–8) shall be plotted vertically down the Y-axis (left column), while absolute dates/days are mapped horizontally across the X-axis (header row).  
* **Metadata Content Overlays:** Active cells matching the assigned period of a logged-in teacher must not render empty. The interface must dynamically fetch and inject rich metadata—specifically the corresponding Subject Name and Section Number—into an informational sub-card component layered directly above the action triggers.

### **6.4.3 Interaction & Accessibility** {#6.4.3-interaction-&-accessibility}

* **The 5-Second Toast:** All toast notifications must persist for exactly 5000ms. This provides sufficient time for users to read the status while they are busy in a classroom setting.  
* **Native-Feel Swiping:** Apply `snap-x` and `snap-mandatory` to the grid container on mobile. This makes the horizontal scroll "snap" to the edges of periods, giving the web app a native iOS/Android feel.  
* **Spotlight Recalculation:** The onboarding spotlight (Section 4.3) must include a window resize listener. If the browser is resized, the spotlight coordinates must recalculate instantly to prevent the focus ring from "floating" away from the target element.  
* **Iconography Helper:** Implement a central `Icon(name, size, color)` function or component. Do **not** hard-code SVG paths into individual components. This allows for a global switch of icon libraries (e.g., Lucide to FontAwesome) in one place.

### **6.4.4 Security & Permissions** {#6.4.4-security-&-permissions}

* **UI Masking vs. Logic Locking:** While the Sidebar is hidden for teachers using CSS, `Auth.gs` must verify the user's role on the server before executing any function within `API_TALT.gs`.  
* **Proxy Mode Visibility:** If a TALT is acting on behalf of a teacher, the `Proxy Banner` must remain `fixed` and high-contrast (`bg-amber-500`) to ensure the administrator is always aware they are modifying another user's data.  
* **UI Anti-Tamper Lockdown:** The `Modal_EmailEditor.html` must apply a hard `disabled` attribute to all inputs if `Can_Edit_Config` is false. However, the Engineer must also ensure `API_TALT.gs` (or the corresponding save function) re-verifies this permission on the server before committing any template changes to the database.   
* **"No Assignment" Contextual Cell Lockout:**The frontend rendering engine must enforce a hard restriction based on timetabled teaching assignments. When a user with the Teacher role accesses the calendar grid, the application must cross-evaluate the slot against their individual rows in \`TeacherTimeTables\`. If they are not actively scheduled to teach during that specific Period/Day-Type intersection, the cell must automatically drop its interactive click handlers, strip the booking triggers, and render as a grayed-out "No Assignment" asset.

### **6.4.5 Supplemental Engineering Directives** {#6.4.5-supplemental-engineering-directives}

* **A-E Cycle Context:** The Engineer must pull `BellType` and `DayType` into the header. Do not allow users to book without this context visible, preventing "Shortened Wednesday" booking errors.  
* **Style Centralization:** Use a single point of truth for styling. Implementation must use the Tailwind config for palette shifts and JavaScript wrappers (e.g., `<button class="${UI.btnPrimary}">`) for all interactive elements.  
* **State Management:** Maintain "Selected" status as a local-only UI state. No writing to Google Sheets should occur until the final batch submission in the Selected Slots panel.  
* **Technician Row Logic:** Group Lab rows with their assigned Technician. If a tech is missing, the cell must automatically trigger an `amber` warning state.  
* **iOS Keyboard Defensive Coding:** Test specifically for "Keyboard Clashing" on Safari. The "Submit" button must remain accessible (not pushed off-screen) when the virtual keyboard is active.  
* **Mandatory Header Start:** Every file build task **must** begin with the generation of the PRD Section 15.8 Header Protocol before code logic is drafted.