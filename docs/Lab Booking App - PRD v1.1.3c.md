> ⚠️ Partly superseded by [PRD_AMENDMENT_v1.4.0b.md](./PRD_AMENDMENT_v1.4.0b.md). Where they conflict, the amendment wins.

# **Technical Specification**

**Version:** 1.1.3c  
**Date:** October 28, 2025 (v1.0) | May 06, 2025 (v1.1.2) | May 11, 2026 (v1.1.3) | July 8, 2026 (v1.1.3c)  
**Steerer:** Mek  
**PRD drafter AI:** Gemini 3.0 | Model \= Pro, Thinking  
**Status:** PRD = Locked, Design Spec = Locked, Backend = Audited  
**Active Engineering Target:** **v1.4.0b** (Governing Security & Ecosystem Alignment)

This tab contains the core specification document for the application's current version (V1.1). It details the functional requirements (features, user flows), data models (database schema), and the technical contract (API specification) defining how the application should be built and behave.

---

### 🚨 **CRITICAL AMENDMENT NOTE — Version 1.4.0a (October 2026)**
> ⚠️ **SUPERSEDED in full by [PRD_AMENDMENT_v1.4.0b.md](./PRD_AMENDMENT_v1.4.0b.md).** Kept for history only. Where this note differs on tab/column counts, status casing, ownership (UserID only), postponement (linked rows, ADR-0003), HoD (strictly read-only) or deployment, the v1.4.0b amendment wins.

*This amendment formally overrides conflicting historical sections within this PRD with the confirmed operational directives established by Lead Architect Mek:*

1. **Role Authority & Equality:**
   - **`TA` = `LabTech` Equality:** `TA` holds the exact same operational and authorization level as `LabTech`. Both can approve standard bookings, approve postponements, assign technicians, override rooms, and manage lab outages (`Maintenance` & `SetupHold`).
   - **`Admin` Super-Privilege:** `Admin` possesses all system privileges (approving bookings, managing outages, assigning staff, configuring system variables, and running diagnostics).
   - **`HoD` Read-Only Scope:** `HoD` (Head of Department) **cannot** approve standard bookings. `HoD` access is restricted to an executive read-only overview for capacity analysis, forensic logs (`Logs`), and telemetry metrics (`Stats`).
   - **`Teacher` Permissions:** Teachers can book labs, view schedules, view the **Master Calendar (read-only view of all school bookings)**, and view forensic logs and telemetry stats. Teachers have authority to edit, cancel, and request postponement **only for their own bookings** (`TargetUserID` matching session email). A teacher cannot cancel or postpone another teacher's booking.

2. **Two-Way Approval Postponement Workflow & Status:**
   - **Teacher-Initiated Postponement:** If the booking teacher requests a slot reschedule, status transitions to `POSTPONE_PENDING_TALT`. TALT must approve the request before the target slot is swapped.
   - **TALT-Initiated Postponement:** If TALT moves or swaps a teacher's booked slot, status transitions to `POSTPONE_PENDING_TEACHER`. The booking teacher must approve before the swap is finalized.
   - **Atomic Mutual Exclusion:** Upon reciprocal approval, releasing the old slot and locking the target slot occurs inside a single atomic `LockService` transaction.
   - **Status Nomenclature:** Canonical status for rejected bookings is strictly **`Denied`** (retaining legacy compatibility).

3. **Lead Time Policy, 24-Hour Cancellation Lock & Urgent Bypass:**
   - **Advance Booking Lead Time:** Requires at least **2 instructional school days**, verified dynamically against the `Academic_Calendar` tab in Master DB 2026.
   - **Cancellation & Postponement Lock:** Teachers are **locked from cancelling or postponing** within **24 hours** of the requested slot start time.
   - **TALT Universal Bypass:** TALT personnel (`TA`, `LabTech`, `Admin`) have full authority to bypass lead-time rules and cancellation locks on teachers' behalf for all actions.
   - **Mandatory Audit Tracking & Remark Stacking:**
     - In `Bookings.Remark`: Remarks must **append** rather than overwrite, stacked in **chronological ascending order** downwards (e.g. `[DENIED 2026-10-16 09:00 by Fern]: Insufficient glassware\n[URGENT_BYPASS 2026-10-16 10:30 by Mek]: Teacher emergency setup approved`).
     - In `Logs`: Action logged as `URGENT_BOOKING_BYPASS` logging requesting teacher, subject, operating TALT, and timestamp.

4. **On-Behalf Booking Attribution & Parameters:**
   - When a booking is submitted on behalf of another user (e.g. TALT booking for a teacher), the system records:
     - `SubmittedByUserID`: The ID/email of the operator who submitted the transaction.
     - `User`: The operator's nickname.
     - `TargetUserID`: The ID/email of the teacher who owns the booking (holds cancellation & postponement rights).
     - `Teacher`: The booking owner's nickname.
     - `ConfirmUserID` / `ConfirmedBy`: The ID and nickname of the approving staff.
     - `AssignedTaltID` / `AssignedTaltName`: The ID(s) and nickname(s) of allocated support technicians.

5. **Federated Multi-Spreadsheet Architecture (10 Tabs across 3 Spreadsheets):**
   - **Local Transactional Spreadsheet (`<LOCAL_SPREADSHEET_ID>`):**
     - `Bookings` (25 columns, replaces `Transactions`), `Outages` (13 columns), `Duties` (8 columns), `Config` (5 columns), `Logs` (7 columns), `Stats` (12 columns).
   - **Master DB 2026 (`<MASTER_DB_ID>`) [READ-ONLY]:**
     - `Users` (8 columns), `Subjects` (5 columns), `Room` (4 columns, replaces `Labs`), `Academic_Calendar` (6 columns, replaces `Calendar`), `Bell_Schedules` (8 columns, replaces `Bell`).
   - **Timetable 2026 (`<TIMETABLE_2026_ID>`) [READ-ONLY]:**
     - `Index` sheet (7 columns, replaces `TeacherTimeTables`).

6. **Canonical Teacher Join & Attribute Normalization:**
   - Teachers join between session email (`Users.Email`) $\rightarrow$ nickname (`Users.DisplayName`) $\rightarrow$ `Timetable 2026` (`Index.Teacher`).
   - `isHoD` is derived dynamically via `Role === "HoD"`.
   - `Can_Edit_Config` is derived dynamically via `Role === "Admin"`.
   - `hasCompletedTutorial` is persisted in browser `localStorage`.
   - `PrimaryGrade` is deprecated.

7. **Deployment Topology — Standalone Web App URL (No Google Site Embedding):**
   - The application will be deployed strictly as a **Standalone Web App URL** (`https://script.google.com/a/.../exec`).
   - Embedding inside a Google Site iframe is **rejected and prohibited**.
   - `HtmlService.XFrameOptionsMode.DEFAULT` (`SAMEORIGIN`) is strictly enforced; `ALLOWALL` is eliminated to prevent clickjacking (`F-13`) and avoid third-party cookie blocking / Safari ITP login loops.

---

[1\. Executive Summary](#1.-executive-summary)

[2\. Introduction](#2.-introduction)

[2.1 Purpose of the App](#2.1-purpose-of-the-app)

[2.2 Problem Statement](#2.2-problem-statement)

[2.3 Vision & Goals](#2.3-vision-&-goals)

[2.4 Scope (In-Scope, Out-of-Scope)](#2.4-scope-\(in-scope,-out-of-scope\))

[2.5 Developer Quick-Start Summary](#2.5-developer-quick-start-summary)

[3\. Target Audience & User Personas](#3.-target-audience-&-user-personas)

[3.1 Primary Users](#3.1-primary-users)

[3.2 User Personas](#3.2-user-personas)

[3.2.1 Persona Name: Mr.Bala](#3.2.1-persona-name:-mr.bala)

[3.2.2 Persona Name: Ms.Leyla](#3.2.2-persona-name:-ms.leyla)

[3.2.3 Persona Name: Mr.Mek (me)](#3.2.3-persona-name:-mr.mek-\(me\))

[3.2.4 Persona Name: Fern](#3.2.4-persona-name:-fern)

[4\. Features & Functionality](#4.-features-&-functionality)

[4.1 Feature Prioritization (MoSCoW Method)](#4.1-feature-prioritization-\(moscow-method\))

[4.2 Detailed Feature Descriptions](#4.2-detailed-feature-descriptions)

[4.2.1 Feature: Authentication](#4.2.1-feature:-authentication)

[4.2.2 Feature: Weekly Calendar View](#4.2.2-feature:-weekly-calendar-view)

[4.2.3 Feature: User-specific Availability](#4.2.3-feature:-user-specific-availability)

[4.2.4 Feature: Teacher Reservation Form (Single Slot)](#4.2.4-feature:-teacher-reservation-form-\(single-slot\))

[4.2.5 Feature: Feature: TALT Reservation Form (Lab Support)](#4.2.5-feature:-feature:-talt-reservation-form-\(lab-support\))

[4.2.6 Feature: Manage Booking (Cancel & Postpone)](#4.2.6-feature:-manage-booking-\(cancel-&-postpone\))

[4.2.7 Feature: Lab Technician Management (Assign, Approve, Decline, Force Cancel)](#4.2.7-feature:-lab-technician-management-\(assign,-approve,-decline,-force-cancel\))

[4.2.8 Feature: Dynamic Bell Schedule Selection (Grade-Level Logic)](#4.2.8-feature:-dynamic-bell-schedule-selection-\(grade-level-logic\))

[4.2.9 Feature: Notification System](#4.2.9-feature:-notification-system)

[4.2.10 Feature: Onboarding Tutorial and Help Guide](#4.2.10-feature:-onboarding-tutorial-and-help-guide)

[4.2.11 Feature: Lab Outage Management](#4.2.11-feature:-lab-outage-management)

[4.2.12 Feature: Multi-Section Booking](#4.2.12-feature:-multi-section-booking)

[4.2.13: Feature: TALT Proxy Mode (Book for Teacher)](#4.2.13:-feature:-talt-proxy-mode-\(book-for-teacher\))

[4.3: User Flows & Navigation](#4.3:-user-flows-&-navigation)

[4.3.1 Teacher User Flow 👩‍🏫](#4.3.1-teacher-user-flow-👩‍🏫)

[4.3.2 Lab Technician/TA (TALT) User Flow 🔬](#4.3.2-lab-technician/ta-\(talt\)-user-flow-🔬)

[4.4 UI/UX Considerations](#4.4-ui/ux-considerations)

[4.4.1 Key Design Principles:](#4.4.1-key-design-principles:)

[4.4.2 Visual Source of Truth (Google Slides):](#4.4.2-visual-source-of-truth-\(google-slides\):)

[4.4.3 Visual Feedback & Progressive Loading](#4.4.3-visual-feedback-&-progressive-loading)

[4.5 Responsive & Cross-Platform Strategy](#4.5-responsive-&-cross-platform-strategy)

[4.5.1 Multi-Surface Support:](#4.5.1-multi-surface-support:)

[4.5.2 Breakpoints:](#4.5.2-breakpoints:)

[4.5.3 Touch Targets:](#4.5.3-touch-targets:)

[5\. Technical Requirements](#5.-technical-requirements)

[5.1 Platform & OS Support](#5.1-platform-&-os-support)

[5.2 System Architecture (High-level)](#5.2-system-architecture-\(high-level\))

[5.3 Technology Stack (Proposed)](#5.3-technology-stack-\(proposed\))

[5.4 Performance Requirements](#5.4-performance-requirements)

[5.5 Security & Privacy](#5.5-security-&-privacy)

[5.6 Data Storage & Management](#5.6-data-storage-&-management)

[5.7 Analytics & Reporting](#5.7-analytics-&-reporting)

[6\. Data Models & Database Schema](#6.-data-models-&-database-schema)

[6.1 All Tables](#6.1-all-tables)

[6.2 Table: Users](#6.2-table:-users)

[6.3 Table: Subjects](#6.3-table:-subjects)

[6.4 Table: Labs](#6.4-table:-labs)

[6.5 Table: Calendar](#6.5-table:-calendar)

[6.6 Table: Bell](#6.6-table:-bell)

[6.7 Table: TeacherTimeTables](#6.7-table:-teachertimetables)

[6.8 Table: Duties](#6.8-table:-duties)

[6.9 Table: Outages](#6.9-table:-outages)

[6.10 Table: Transactions](#6.10-table:-transactions)

[6.11 Table: Config](#6.11-table:-config)

[6.12 Database Integrity Rules](#6.12-database-integrity-rules)

[7\. API Specification](#7.-api-specification)

[Function List](#function-list)

[7.1 Function: getUserInfo](#7.1-function:-getuserinfo)

[7.2 Function: getCalendarData](#7.2-function:-getcalendardata)

[7.3 Function: getWeeklySchedule](#7.3-function:-getweeklyschedule)

[7.3.1 Function: triggerManualRevalidation (Admin/TALT Only)](#7.3.1-function:-triggermanualrevalidation-\(admin/talt-only\))

[7.4 Function: getBookingDetails](#7.4-function:-getbookingdetails)

[7.5 Function: getTeacherList](#7.5-function:-getteacherlist)

[7.6 Function: getLabList](#7.6-function:-getlablist)

[7.7 Function: getSubjectList](#7.7-function:-getsubjectlist)

[7.8 Function: getSubjectsByTeacher](#7.8-function:-getsubjectsbyteacher)

[7.9 Function: getLabOutages](#7.9-function:-getlaboutages)

[7.10 Function: getAvailableTALTsForBooking](#7.10-function:-getavailabletaltsforbooking)

[7.11 Function: getLabAssignmentContext](#7.11-function:-getlabassignmentcontext)

[7.12 Function: getTaltWorkloadReport](#7.12-function:-gettaltworkloadreport)

[7.13 Function: searchTeachers](#7.13-function:-searchteachers)

[7.14 Function: submitBookingRequest](#7.14-function:-submitbookingrequest)

[7.15 Function: submitMultiSectionRequest](#7.15-function:-submitmultisectionrequest)

[7.16 Function: createLabSupportBooking](#7.16-function:-createlabsupportbooking)

[7.17 Function: approveBooking](#7.17-function:-approvebooking)

[7.18 Function: declineBooking](#7.18-function:-declinebooking)

[7.19 Function: cancelBooking](#7.19-function:-cancelbooking)

[7.20 Function: postponeBooking](#7.20-function:-postponebooking)

[7.21 Function: createLabOutage](#7.21-function:-createlaboutage)

[7.22 Function: updateOutageStatus](#7.22-function:-updateoutagestatus)

[7.23 Function: deleteLabOutage](#7.23-function:-deletelaboutage)

[7.24 Function: completeTutorial](#7.24-function:-completetutorial)

[7.25 Function: bulkApproveBatch](#7.25-function:-bulkapprovebatch)

[7.26 Function: bulkDeclineBatch](#7.26-function:-bulkdeclinebatch)

[7.27 Function: updateConfirmedBooking](#7.27-function:-updateconfirmedbooking)

[7.28 Concurrency & Data Integrity.](#7.28-concurrency-&-data-integrity.)

[7.x Function: template](#7.x-function:-template)

[8\. Release Criteria & Success Metrics](#8.-release-criteria-&-success-metrics)

[8.1 Release Criteria (The "Definition of Done")](#8.1-release-criteria-\(the-"definition-of-done"\))

[8.2 Key Performance Indicators (KPIs)](#8.2-key-performance-indicators-\(kpis\))

[9\. Timeline & Resources (High-level)](#9.-timeline-&-resources-\(high-level\))

[9.1 Project Phases & Milestones](#9.1-project-phases-&-milestones)

[9.2 Resource Allocation](#9.2-resource-allocation)

[10\. Assumptions, Constraints & Risks](#10.-assumptions,-constraints-&-risks)

[10.1 Assumptions](#10.1-assumptions)

[10.2 Constraints](#10.2-constraints)

[10.3 Risks & Mitigation](#10.3-risks-&-mitigation)

[11\. Future Considerations](#11.-future-considerations)

[11.1 Advanced Booking Workflows](#11.1-advanced-booking-workflows)

[11.2 Smart Scheduling & Automation](#11.2-smart-scheduling-&-automation)

[11.3 Data, Analytics & Administration](#11.3-data,-analytics-&-administration)

[11.4 System Integrations & Accessibility](#11.4-system-integrations-&-accessibility)

[11.5 Immediate (v1.1) Maintenance](#11.5-immediate-\(v1.1\)-maintenance)

[11.6 Roadmap (v1.2) Planning](#11.6-roadmap-\(v1.2\)-planning)

[12\. Appendices](#12.-appendices)

[12.1 Glossary of Terms](#12.1-glossary-of-terms)

[12.2 Design & UI References](#12.2-design-&-ui-references)

[12.3 Technical Documentation & Tooling](#12.3-technical-documentation-&-tooling)

[13\. Changelogs & Version History](#13.-changelogs-&-version-history)

[13.1 Version History Table](#13.1-version-history-table)

[13.2 Key Architectural Decisions (Oct 31 Revision)](#13.2-key-architectural-decisions-\(oct-31-revision\))

[13.3 Detailed Revision Log (v1.1.1 \- v1.1.2)](#13.3-detailed-revision-log-\(v1.1.1---v1.1.2\))

[13.3.1 Backend & Security Optimization](#13.3.1-backend-&-security-optimization)

[13.3.2 Function & UI Enhancements](#13.3.2-function-&-ui-enhancements)

[13.4 Critical Architectural Wins](#13.4-critical-architectural-wins)

[14\. User Acceptance Testing (UAT) Plan](#14.-user-acceptance-testing-\(uat\)-plan)

[14.1 Core Booking & Selection Cart](#14.1-core-booking-&-selected-slots)

[14.2 Validation & Conflict Handling](#14.2-validation-&-conflict-handling)

[14.3 Automation & Integrations](#14.3-automation-&-integrations)

[14.4 TALT Dashboard & Proxy Mode](#14.4-talt-dashboard-&-proxy-mode)

[14.5 Data Integrity & Maintenance](#14.5-data-integrity-&-maintenance)

[14.6 User Interface (UI/UX)](#14.6-user-interface-\(ui/ux\))

[How to use this checklist during UAT:](#how-to-use-this-checklist-during-uat:)

[Deployment Checklist](#deployment-checklist)

[15\. Project Roadmap & AI-Development Strategy](#15.-project-roadmap-&-ai-development-strategy)

[15.1 Phase-Based Roadmap](#15.1-phase-based-roadmap)

[15.2 Backend Modularization (The .gs Strategy)](#15.2-backend-modularization-\(the-.gs-strategy\))

[15.3 Frontend Modularization (Component-Driven Architecture)](#15.3-frontend-modularization-\(component-driven-architecture\))

[15.3.1 Core UI & Global Assets](#15.3.1-core-ui-&-global-assets)

[15.3.2 Logic Layers (Controllers)](#15.3.2-logic-layers-\(controllers\))

[15.3.3 Visual Components (The Layout)](#15.3.3-visual-components-\(the-layout\))

[15.3.4 Modals (The Interactive Popups)](#15.3.4-modals-\(the-interactive-popups\))

[15.4 AI Prompting & Design Specification Workflow](#15.4-ai-prompting-&-design-specification-workflow)

[15.4.1 Theme & Layout Principles](#15.4.1-theme-&-layout-principles)

[15.4.2 The "Code-Wireframe" Prompt Template](#15.4.2-the-"code-wireframe"-prompt-template)

[15.5 AI Collaboration & Copy-Paste Protocol](#15.5-ai-collaboration-&-copy-paste-protocol)

[15.5.1 The "System Instruction" for AI](#15.5.1-the-"system-instruction"-for-ai)

[15.5.2 Version Headers](#15.5.2-version-headers)

[15.5.3 The Gemini-to-Claude Hand-off Protocol](#15.5.3-the-gemini-to-claude-hand-off-protocol)

[15.6 AI Agent Configuration & Multi-AI Workflow](#15.6-ai-agent-configuration-&-multi-ai-workflow)

[15.6.1 Gemini’s Gem: The Spec Describer](#15.6.1-gemini’s-gem:-the-spec-describer)

[15.6.2 Gemini’s Gem: The Wireframe Designer](#15.6.2-gemini’s-gem:-the-wireframe-designer)

[15.7 Claude Lead Engineer System Prompt](#15.7-claude-lead-engineer-system-prompt)

[15.8 File Header Protocol](#15.8-file-header-protocol)

[15.8.1 For .gs files](#15.8.1-for-.gs-files)

[15.8.2 For .html files](#15.8.2-for-.html-files)

[16\. Disaster Recovery](#16.-disaster-recovery)

[16.1 Error Recovery Scenarios](#16.1-error-recovery-scenarios)

[17\. Deployment & Environment Strategy](#17.-deployment-&-environment-strategy)

[17.1 Environment Separation](#17.1-environment-separation)

[17.2 The 1:1 Mirror Promotion Protocol](#17.2-the-1:1-mirror-promotion-protocol)

# **1\. Executive Summary** {#1.-executive-summary}

The MUIDS Lab Booking App V1.1.3 is a web-based application designed to modernize and streamline the reservation process for school science laboratories. It replaces the current manual system with a real-time, integrated solution built on Google Apps Script and Google Sheets, intended for embedding within the science hub Google Site.

The application provides distinct interfaces tailored to Teachers and Lab Technicians/Assistants (TALTs). Teachers view a personalized weekly "Timeline" showing only their scheduled classes and the availability status (`Available`, `Pending`, `Booked`, `N/A`) for lab work related to their subjects. They can request single or multiple sections of the same subject using a streamlined "Selection Slots" workflow, submitting requests based on **Subject \+ Time**.

TALTs access a comprehensive "Master Dashboard" displaying all lab activities, outages, and pending requests. TALTs are responsible for managing requests by **assigning an available Lab Room** and an available TALT, and then approving or declining. The system includes robust workload management for TALTs (checking total daily and consecutive period limits), with a defined bypass mechanism requiring explicit acknowledgment and notifying the Head of Department. Lab unavailability (e.g., for maintenance) is managed through a dedicated outage system. TALTs can also book labs for **Lab Support** tasks (e.g., setup, cleaning). All key actions trigger automated email notifications originating from the official TALT group account. Confirmed bookings automatically generate Google Calendar events.

This initial release (V1.1) focuses on delivering the core booking, assignment, and approval workflows, aiming to significantly reduce booking conflicts, improve communication, increase TALT efficiency, and provide real-time visibility into lab usage for both teachers and technicians.

# **2\. Introduction** {#2.-introduction}

## **2.1 Purpose of the App** {#2.1-purpose-of-the-app}

To provide a robust, user-friendly, and effective digital system for viewing and booking MUIDS science labs in alignment with teaching schedules and TALT availability. 

## **2.2 Problem Statement** {#2.2-problem-statement}

The current lab booking process is manual and prone to errors, often relying on spreadsheets or email forms. This leads to booking conflicts, miscommunication between teachers and lab technicians, and a lack of real-time visibility into lab availability and TALT workload. The process is inefficient and makes it difficult for teachers to find and secure a lab for their classes, especially during high-demand periods. Teachers and lab technicians require a centralized, real-time system to manage lab reservations effectively. 

## **2.3 Vision & Goals** {#2.3-vision-&-goals}

**Vision:** Create a seamless, conflict-free scheduling system that maximizes lab utilization, supports effective teaching, and optimizes TALT workload management.

**Goals (SMART):**

* Reduce booking conflicts by 90% within the first semester of deployment compared to the previous manual system.  
* Achieve 93% adoption (14 out of 15 science teachers actively using the app) within 2 months of launch.  
* Reduce average time spent by teachers to submit a booking request by 75% compared to the manual process.  
* Simplify the booking process via an intuitive user interface and centralized management dashboard.  
* Provide real-time visibility of lab schedules and TALT availability for all users.

  ## **2.4 Scope (In-Scope, Out-of-Scope)** {#2.4-scope-(in-scope,-out-of-scope)}

**In-Scope (V1.1):** *(Aligned with Must-have and Should-have features)*

* User authentication via MUIDS Google Workspace accounts (@mahidol.ac.th).  
* Role-based access (Teacher, TALT/LabTech, HoD via isHoD flag).  
* Weekly calendar view for teachers ("My Timeline") showing personalized availability based on teaching schedule.  
* Optional toggle for teachers to view the comprehensive "Master Dashboard".  
* Weekly calendar view for TALTs ("Master Dashboard") showing all bookings, outages, Lab Support tasks, and pending requests.  
* TALT dashboard filtering by Subject.  
* Ability for teachers to submit single booking requests using the **"Selected Slots"** workflow.  
* Simple booking form pop-up with auto-filled teacher/class data for single requests.  
* Clear visual indicators (icons/colors) for reservation status (Pending, Booked, Denied, N/A, Booked (Lab Support) etc.).  
* TALT ability to approve or decline pending requests.  
* TALT ability to assign an available Lab Room during approval.  
* Exclusive TALT authority for lab room assignment (Teachers request support; TALTs designate the room).  
* TALT ability to assign an available TALT during approval.  
* Enforcement of TALT workload limits (max daily periods, max consecutive periods) with a warning and bypass mechanism (including HoD notification).  
* Ability for TALTs to book labs for Lab Support tasks using a dedicated form, subject to workload checks.  
* Ability for TALTs to book labs on behalf of teachers using "Proxy Mode."  
* TALT ability to manage lab outages/maintenance periods via a dedicated interface (auto-cancels conflicting bookings).  
* Automated email notifications (sent from talt.muids@mahidol.ac.th) for key booking events.  
* Dynamic handling of Period 2 split-break timing (validated during TALT approval).  
* First-time user onboarding tutorial and persistent help guide ("?" button).  
* Creation of Google Calendar events upon booking confirmation.  
* **(Should-have)** Ability for teachers to submit multi-section booking requests using the **"Selected Slots"** workflow.  
* **(Should-have)** TALT ability to bulk approve/decline multi-section **batch** requests.

**Out-of-Scope (V1.1):** *(Aligned* with *Won't-have features and new additions)*

* Advanced reporting and analytics dashboard.  
* Equipment inventory management or booking.  
* Drag-and-drop calendar interface.  
* Full 2-way synchronization with Google Calendar (V1.1.3c only creates events).  
* Dedicated admin panel for managing master data (Users, Schedules, etc. \- managed directly in Google Sheets for V1.1.3c).  
* Integration with other school management systems (e.g., Google Classroom, ATLAS, PowerSchool, PrimeTimeTable).  
* TALT ability to edit confirmed bookings.  
* TALT ability to add post-event comments/logs.  
* Student-facing view.  
* Mobile-optimized TALT view.  
* Automated reminder emails (pre-booking or pending request reminders).  
* In-app notifications (only email notifications in V1.1.3c).  
* Substitution assignments.  
* Smart Lab Allocation Considerations (Setup/Cleaning Time).  
* Makeup Lab Booking workflow.  
* Real-time In-App Update Notifications (Popups).  
* Administrative Email Text Editor (v1.2.0): An interactive UI modal (`Modal_EmailEditor.html`) built for TALTs to modify notifications inside the web app. When saved, this component initiates a server-side routine to update rows inside the `System_Config` spreadsheet tab dynamically, maintaining the sheet as the single source of truth.

  ## **2.5 Developer Quick-Start Summary** {#2.5-developer-quick-start-summary}

* **The Stack:** Google Apps Script (GAS) \+ Google Sheets (Database) \+ Tailwind CSS (UI).  
* **Core Logic:** Teachers use the **Selected Slots** panel to request labs. TALTs approve requests, which **submits the batch** and auto-syncs to the Shared Lab Calendar while inviting the TALT as a guest.  
* **Data Integrity:** Column A in all sheets is "System Locked" (UUIDs). Never delete rows manually.  
* **Modular Code:** JS and GS files are split by function (See Section 15).

  # **3\. Target Audience & User Personas** {#3.-target-audience-&-user-personas}

  ## **3.1 Primary Users** {#3.1-primary-users}

The primary users are MUIDS Science Teachers who require laboratory access for their classes and the Lab Technicians/Assistants (TALTs) who manage lab resources, prepare materials, and oversee the booking process. The system aims to facilitate a smoother interaction between these two core groups. 

## **3.2 User Personas** {#3.2-user-personas}

### **3.2.1 Persona Name: Mr.Bala** {#3.2.1-persona-name:-mr.bala}

* **Demographics:** Age: 35, Occupation: High School Biology Teacher (Head), Location: MUIDS, Year of Service: 5 years  
* **Goals:** To easily find an available lab for his biology experiments without having to check multiple sheets or email back and forth. He wants to be able to book a lab quickly from his phone (Note: **V1.1.3c** is desktop-first, mobile is best-effort).  
* **Pain Points:** He often finds that a lab he needs is already booked without his knowing, leading to last-minute class plan changes. The current booking process is time-consuming and lacks real-time updates.  
* **Behaviors/Habits:** He plans his lab activities a week in advance and checks the calendar first thing on Monday morning to secure a spot.  
* **Quote:** *"I just need a simple way to see what's open and book it for my classes."*

  ### **3.2.2 Persona Name: Ms.Leyla** {#3.2.2-persona-name:-ms.leyla}

* **Demographics:** Age: 28, Occupation: High School Biology Teacher (newly joined), Location: MUIDS, Year of Service: 1 month  
* **Goals:** To confidently and independently book labs for her classes and build a smooth working relationship with the lab technician team, understanding the official process.  
* **Pain Points:** As a new teacher, she is unsure of the correct booking procedure, leading to miscommunications (e.g., using unofficial shared spreadsheets) and missed lab preparations. She needs a clear, reliable system.  
* **Behaviors/Habits:** Relies on information from colleagues which may be outdated or incorrect; needs a single, official source of truth for lab booking.  
* **Quote:** *"I need a system that everyone uses and trusts, so I know my booking is confirmed and the lab will be ready."*

  ### **3.2.3 Persona Name: Mr.Mek (me)** {#3.2.3-persona-name:-mr.mek-(me)}

* **Demographics:** Age: 36, Occupation: Lab technician (semi-head, leader), Location: MUIDS, Year of Service: 13 Years  
* **Goals:** To replace his partially automated but still largely manual Google Sheet-based system with a fully visual web application that enforces booking rules (teacher schedules, lab availability, TALT workload) automatically. He wants a system that reduces errors and frees up his time for lab preparation.  
* **Pain Points:** The previous script-based system still required significant manual input and lacked robust verification, leading to double bookings or accepting requests without proper checks. High workload prevented effective use and maintenance of the old system.  
* **Behaviors/Habits:** Due to time constraints, often approves requests without thoroughly checking all availability constraints, leading to downstream problems. Needs a system that performs these checks automatically.  
* **Quote:** *"I need a system that automates the verification so I can focus on preparing the labs, not fixing scheduling mistakes."*

  ### **3.2.4 Persona Name: Fern** {#3.2.4-persona-name:-fern}

* **Demographics:** Age: 25, Occupation: Lab Technician, Location: MUIDS, Year of Service: 3 years  
* **Role:** Lab Technician (reports to Science HoD)  
* **Goals:** To receive a clear, reliable schedule and the necessary lab materials (like worksheets) well in advance, allowing her to plan her preparations efficiently. She aims to support teachers effectively by having everything ready on time.  
* **Pain Points:** Her biggest frustration comes from conflicting demands or ambiguity about which TALT is responsible for which task, especially when schedules change. Last-minute, urgent ("stat") requests disrupt her planned workflow and can compromise the quality of preparation. She dislikes needing to chase down information or deal with scheduling errors caused by others.  
* **Behaviors/Habits:** Highly organized. Checks the confirmed lab schedule and meticulously plans her preparation tasks, often writing them down by period in her physical diary. She prefers autonomy in her work; once she knows the what (materials needed) and when, she efficiently manages her own time and tasks. Back-to-back labs are manageable if she has advance notice to plan accordingly. Relies on colleagues (like Mr. Mek) or the Science HoD primarily to resolve conflicts or ambiguities in the schedule.  
* **Quote:** *"Just give me the worksheet and the schedule in advance, and I'll have it ready. Back-to-back is fine if I can plan for it. What stresses me out is when the schedule changes last minute, and it gets approved by the HOD despite going against previously set rules of the Science department."*

# **4\. Features & Functionality** {#4.-features-&-functionality}

## **4.1 Feature Prioritization (MoSCoW Method)** {#4.1-feature-prioritization-(moscow-method)}

* **Must-have:**  
  * Authentication (Google Workspace Login)  
  * Weekly Calendar View (Teacher "My Timeline" & Optional "Master Dashboard" toggle)  
  * Teacher Reservation Form (Single Slot using **Selected Slots** flow)  
  * TALT Reservation Form (Lab Support tasks)  
  * Manage Booking (Teacher Cancel & Postpone actions, including 24-hour rule)  
  * Lab Technician Management (TALT Assign Lab & Assign TALT during Approve/Decline)  
  * Dynamic Bell Schedule Selection (Grade-Level Logic for P2, validated on approval)  
  * Notification System (Email notifications for key events, sent via alias, excluding reminders)  
  * Onboarding Tutorial and Help Guide (Forced first-time tutorial, persistent "?" button)  
  * Lab Outage Management (TALT interface to block labs, auto-cancels conflicting bookings)  
  * Technician Workload Management (Checks for Total Daily & Consecutive periods, with bypass warning & HoD notification)  
  * Verification of Lab Room Availability (Checks LabOutages and Transactions data)  
  * Creation of new Google Calendar Events upon booking confirmation.  
  * Desktop Web View for full functionality  
* **Should-have:**  
  * Multi-Section Booking (Teacher Flow using **Selected Slots** for multiple sections of the same subject)  
  * TALT **Batch Management** Modal (The dedicated UI for a TALT to individually approve/decline items within a **batch** request)  
  * TALT Dashboard Filter by Lab Room  
* **Could-have:**  
  * *(Left blank intentionally \- scope is clearly defined)*  
* **Won't-have (for this release V1.1.3c):**  
  * Advanced reporting and analytics dashboard.  
  * In-app notifications (only email notifications in **V1.1.3c**).  
  * Full 2-way synchronization with Google Calendar (**V1.1.3c** only creates events).  
  * TALT ability to edit confirmed bookings.  
  * TALT ability to add post-event comments/logs.  
  * Equipment inventory management or booking.  
  * Student-facing view.  
  * Mobile-optimized TALT view.  
  * Centralized Admin Panel (master data managed via Sheets in **V1.1.3c**).  
  * Integration with other school management systems (e.g., Google Classroom, ATLAS, PowerSchool, PrimeTimeTable).  
  * Automated reminder emails (pre-booking or pending request reminders).  
  * Substitution assignment system (Handling teacher/TALT absences).  
  * Smart Lab Allocation Considerations (Automated rules for setup/cleaning time).  
  * Makeup Lab Booking workflow.  
  * Automated "Suggest Alternative Slots" (TALT must do this manually in **V1.1.3c**).  
  * Real-time In-App Update Notifications (Popups) \- All UI updates require a manual page refresh to see changes from other users.

## **4.2 Detailed Feature Descriptions** {#4.2-detailed-feature-descriptions}

### **4.2.1 Feature: Authentication** {#4.2.1-feature:-authentication}

**Description:** The application will use Google Accounts for a secure and seamless login process. This ensures that only authorized MUIDS staff members can access the booking system. The system will verify a user's identity against the master `Users` sheet and will then load the appropriate interface (Teacher View or TALT View) based on their assigned role. 

**User Story:**

* **Teacher:** As a teacher, I want to log in to the booking system using my official Mahidol Google account, so that I can securely access my personal schedule and book labs without needing to create or remember a new password.  
* **TALT:** As a Lab Technician/TA, I want to log in with my official Mahidol Google account, so that I can securely access the management dashboard to approve or decline booking requests.

**Acceptance Criteria:**

1. The application's entry point must display a prominent "Login with Google" button.   
2. Clicking the button must initiate the standard Google OAuth 2.0 authentication flow, requesting permission to view the user's email address.  
3. Upon successful Google authentication, the system must retrieve the user's email address (e.g., via `Session.getActiveUser().getEmail()`).  
4. The system must then look up this email address in the `UserID` column of the `Users` sheet.  
5. **Successful Login:** If the email address is found in the `Users` sheet, the user is considered authenticated and granted access to the application.  
6. **Role-Based Access:** After a successful login, the system must check the `Role` column for that user:  
   * If the `Role` is 'teacher', the standard teacher-facing calendar view ("My Timeline") must be loaded by default.  
   * If the `Role` is 'LabTech' or 'TA', the TALT management interface ("Master Dashboard") must be loaded by default.  
7. A "Logout" button must be clearly visible and accessible from within the application at all times.  
8. Clicking the "Logout" button must securely terminate the user's session and return them to the login screen.

**Unhappy Path:**

* **Unauthorized User:** If a user authenticates with a Google account whose email is **not** found in the `Users` sheet, they must be redirected to a page with a clear 'Access Denied' message: "Access Denied. Please use your official Mahidol School account. If this is your official account, you do not have permission to access this system. Please contact the admin at `talt.muids@mahidol.ac.th`."  
* **Google Service Outage:** If the Google Authentication service is unavailable, the login button should be disabled or show a message: "Google Login is temporarily unavailable."

**Edge Cases:**

* **Role Change:** An administrator changes a user's role in the Google Sheet (e.g., from 'teacher' to 'TA') while they are logged in. The user's permissions and UI must update automatically the next time they load the main calendar page (i.e., when `getUserInfo` is called on refresh), without them needing to log out.

**Specific UI Interaction:**

* **Login Button State:** While the login process is happening, the "Login" button should change to a disabled state with the text "Signing in..." or display a loading indicator to prevent multiple clicks.

### **4.2.2 Feature: Weekly Calendar View** {#4.2.2-feature:-weekly-calendar-view}

**Description:** The primary interface for viewing lab availability. Displays a weekly grid based on the school's A-E day cycle and bell schedule. Teachers see a personalized "My Timeline" view by default, with an option to toggle to a comprehensive "Master Dashboard". TALTs see the "Master Dashboard" by default. The calendar is navigable by week.

**User Story:**

* **Teacher:** As a teacher, I want to see my weekly teaching schedule overlaid with clear lab availability status for my subjects, so I can easily find and plan my lab bookings. I also want the option to see the full lab schedule for transparency.  
* **TALT:** As a TALT, I want a comprehensive master view of all lab bookings, pending requests, outages, and lab support tasks for the week, so I can manage resources and requests effectively.

**Acceptance Criteria:**

1. **Grid Structure:** The view must display a weekly grid (Monday-Friday).  
2. **Navigation:** Navigation controls (`<` and `>`) must be present and allow browsing to the previous and next weeks.  
3. **Headers:** Header rows must display the "Weekday," "Date" (from `Calendar` sheet), "Day Type" (A-E from `Calendar` sheet), and "Bell Schedule Type" (from `Calendar` sheet).  
4. **Period Column:** A "Period" column must list the period identifiers ("HR", "P1", "P2", ..., "P8") as row labels. It must **not** display specific times.  
5. **Body Rows:** Body rows must represent the time slots corresponding to the Period labels.  
6. **Teacher Default View ("My Timeline"):**  
   * By default, the view for a logged-in teacher must only display rows/slots corresponding to their scheduled classes (from `TeacherTimeTables`).  
   * This view must display the derived status (`Available`, `Booked`, `Pending`, `N/A`) for potential lab work *for the teacher's subject* during their class time.  
   * Slots where the teacher is not teaching are implicitly hidden or visually distinct as non-bookable. Only the teacher's own `Available` slots are clickable.  
7. **TALT Default View ("Master Dashboard"):**  
   * By default, the view for a logged-in TALT must display rows for every period and every lab (e.g., 4 sub-rows per period if 4 labs exist).  
   * This view must show the status of every individual lab room slot, including confirmed bookings (with assigned TALT/Lab), pending requests, outages, and `Lab Support` bookings.  
8. **Teacher Toggle:** A "Show Master Calendar" toggle must be available for teachers. When enabled, the view must switch from "My Timeline" to the full "Master Dashboard" (read-only). In this view, only the teacher's own `Available` slots remain clickable.  
9. **TALT Filtering:** The TALT view must include a dropdown filter allowing them to view by specific Subject (hiding other subjects' bookings) or "All Subjects", while always showing universal items (Outages, `Lab Support`).

**Unhappy Paths:**

* **Data Fetch Error:** If the `getCalendarData` API call fails, the calendar area must display a user-friendly error message: "Could not load schedule. Please try refreshing the page."

**Edge Cases:**

* **First Use:** On initial launch with an empty `Transactions` sheet, the calendar must load correctly, showing available slots based on TALT duties and outages.  
* **Non-instructional Day:** For days marked as 'Holiday' or 'Weekend' in the `Calendar` sheet, all slots must be visually disabled.  
* **Outage Starts/Ends Mid-Week:** An outage from Tuesday-Thursday must correctly show affected labs as "N/A" only on those days.  
* **Stale Data:** UI updates reflecting changes made by other users require a manual page refresh.

**Specific UI Interactions:**

* **Loading State:** A skeleton screen or centered spinner must be shown during the initial `getCalendarData` load.  
* **Navigation Column Layout:** The `<td>` cells for the `<` and `>` navigation controls must use a `rowspan` attribute spanning all period rows (HR-P8) to create single, merged columns.  
* **Tooltips (Hover):** Hovering over any calendar slot must display a relevant tooltip:  
  * *Teacher View (Available):* "Click to book lab for \[Subject\]"  
  * *Teacher View (Booked/Pending):* "Lab Title: \[LabTitle\], Status: \[Status\]"  
  * *Master View (Booked):* "Lab: \[LabName\], Title: \[LabTitle\], Teacher: \[Teacher Nickname\], Assigned TALT: \[TALT Nickname\]"  
  * *Master View (Pending):* "Subject: \[Subject\], Teacher: \[Teacher Nickname\], Title: \[LabTitle\]"  
  * *Master View (Lab Support):* "Lab: \[LabName\], Purpose: \[LabTitle\], By: \[TALT Nickname\]"  
  * *Any View (Declined):* "Status: Declined. Reason: \[Technician's Remark\]"  
  * *Any View (N/A \- Technician):* "N/A \- All technicians are unavailable for this period."  
  * *Any View (N/A \- Outage):* "N/A \- \[Outage Reason\]"

### **4.2.3 Feature: User-specific Availability** {#4.2.3-feature:-user-specific-availability}

Note: This feature describes the core business logic that enables the "My Timeline" view, which is defined in Feature 4.2.2 and powered by the `getCalendarData` API.

**Description:** This feature ensures the calendar view is personalized and accurate for teachers. The system will filter the calendar to only show available booking slots during a teacher's scheduled classes. Crucially, the system will also perform an initial check of technician availability (based on their fixed, pre-scheduled duties) and mark slots as 'N/A' if no technicians are available for support during that period.

**User Story:** As a teacher, I only want to see the labs available during my scheduled class periods, and I need to know if a lab is unavailable due to a lack of technician support, so I don't waste time looking at unavailable slots.

**Acceptance Criteria:**

1. The system must query the `TeacherTimeTables` sheet to get the logged-in user's teaching schedule.  
2. For any period the teacher does *not* have a class, all lab slots in that period must be **visually disabled and un-clickable** in their "My Timeline" view.  
3. The system must query the `TechnicianDuties` sheet for the selected date and period.  
4. If the count of TALTs who are **not** assigned a conflicting fixed duty (e.g., lunch duty, meeting) for a specific period is zero, then all Lab slots for that period must be marked as **'N/A (Technician)'** and be unbookable.

**Unhappy Paths:**

* (This feature's logic is part of `getCalendarData`. Its failure state is covered by that function's "Data Fetch Error" path.)

**Edge Cases:**

* **TALT is also a Teacher:** If a user has both a TALT role and a teaching schedule, the V1.1 system will apply teacher rules. Handling potential conflicts where they are the only TALT available during their own class is deferred to V2.0.

**Specific UI Interactions:**

* **Disabled Slots:** Slots where the teacher is not teaching are "greyed out" and have no click-target or hover-effect in the "My Timeline" view.  
* **N/A Slots:** Slots that are 'N/A (Technician)' are visually distinct (e.g., different color/icon) and display the correct tooltip ("N/A \- All technicians are unavailable for this period.") upon hover.

### **4.2.4 Feature: Teacher Reservation Form (Single Slot)** {#4.2.4-feature:-teacher-reservation-form-(single-slot)}

**Description:** A pop-up form that appears when a teacher uses the **"Selected Slots"** flow to submit a single available class slot. This form allows the teacher to provide the specific purpose and any remarks for their reservation request.  

**User Story:** As a teacher, I want to fill out a simple form when I book a single lab so I can provide the necessary details (like the experiment name) for the lab technician. 

**Acceptance Criteria:**

1. The modal window/pop-up appears when the user clicks the **Review Batch (1)** or **Review Selection (1)** button (part of the **Selected Slots** flow).  
2. The form must display the following fields as read-only, automatically populated from the selected calendar slot's data: "Subject," "Teacher," "Section," "Date," and "Period."  
3. The form must have two editable fields: "Lab Title" (required) and "Remark" (optional).  
4. The "Submit" button must be disabled until the "Lab Title" field is filled.  
5. Clicking the "Submit" button triggers the submitBatchBooking API call.  
6. **Constraint:** The Lab Room field is omitted from the teacher’s view. Teachers select 'Lab Support Required,' and the specific room is assigned by the TALT upon confirmation.

**Unhappy Paths:**

* **Business Rule: 2-Day Advance Booking:**  
  * The system must enforce that a booking request is made at least 2 instructional days in advance. (Note: This check is performed by the frontend before enabling the final submission button, but must also be re-verified by the backend API.)  
  * When a user selects a booking date, the system must count the number of instructional days (A-E days) between the current date (exclusive) and the selected date (inclusive).  
  * If the count of instructional days is less than 2 (0 or 1), the booking action must be blocked, and an error message displayed: *"Bookings must be made at least 2 school days in advance. Please select a different date."*  
  * *Example:* A booking made on a 'B' day (Thursday) for a 'C' day (Friday) (1 instructional day) must be blocked. A booking made on a 'B' day (Thursday) for a 'D' day (Tuesday) (2 instructional days) must be allowed.  
* **Race Condition (Invalid Slot):** If the user has the booking form open and another user books any lab for that same Subject/Date/Period combination such that no suitable labs remain available, submitting the form must fail with an error: *"Sorry, lab availability for this slot just changed. Please select another time."*  
* **Network Failure:** If the internet connection drops after the user clicks "Submit," the app must show a *"Submission Failed. Please check your connection and try again"* message and should not clear the form data.  
* **Authorization Expired:** If the user's Google login session expires while the form is open, submitting it should prompt them to log in again, preserving their form data if possible.

**Edge Cases:**

* **Booking Across Midnight:** A user working at 11:59 PM submits a booking for the "next day." The system must correctly use the server's date to determine the booking date and apply the 2-day rule correctly. 

**Specific UI Interactions:**

* **Success Feedback:** Upon successful submission, a temporary, non-blocking notification (a "toast") must appear for 3-5 seconds: *"✅ Your request has been sent."* 

### **4.2.5 Feature: Feature: TALT Reservation Form (Lab Support)** {#4.2.5-feature:-feature:-talt-reservation-form-(lab-support)}

**Description:** Allows a TALT to click any "Available" slot on the "Master Dashboard" and book it for internal tasks. This action creates a record with a "Booked (Lab Support)" status to distinguish it from a teacher's class. This is for non-class tasks like lab preparation, material setup, cleaning, or routine maintenance.

**User Story:** As a Lab Technician or TA, I want to quickly block out an available lab slot directly from the calendar for internal tasks, so that the lab's availability is accurately reflected to teachers and a record of the non-class usage is kept.

**Acceptance Criteria:**

1. A user logged in with the `Role` of 'LabTech' or 'TA' must be able to click on any calendar slot with the status: "Available" on the Master Dashboard.  
2. Clicking an available slot must open a simplified pop-up booking form.  
3. The form must contain a single required input field for the "Purpose" (which will populate the `LabTitle` column).  
4. The "Submit" button must be disabled until the "Purpose" field is filled.  
5. Upon submitting the form, a new row must be created in the `Transactions` table.  
6. The new record's `UserID` must be the ID of the TALT who created the booking.  
7. The `Status` must be set to **"Booked (Lab Support)"**.  
8. The `LabID`, `Date`, and `Period` must correspond to the calendar slot that was clicked.  
9. The `ConfirmedBy` column must be populated with the TALT's `UserID`.  
10. The new booking **must count against** the TALT's daily and consecutive workload limits.  
11. After successful submission, the calendar view must immediately update, showing the slot as "Booked (Lab Support)".

**Unhappy Paths:**

* **Race Condition (Invalid Slot):** If the TALT has the form open and another user (teacher or TALT) books that same slot, submitting the form must fail with an error: "Sorry, this slot is no longer available."  
* **Network Failure:** If the internet connection drops after the TALT clicks "Submit," the app must show a "Submission Failed" message and not clear the form data.  
* **Workload Limit Hit:** If submitting the booking would put the TALT over their 5-period daily limit or 3-consecutive-period limit, a **confirmation modal** must appear (as defined in the `approveBooking` bypass logic).

**Edge Cases:**

* **Booking in Teacher's Slot:** A TALT clicks an "Available" slot that is *during* a teacher's scheduled class (a slot the teacher *could* have booked). This must be allowed. The system does not block TALTs from booking slots for `Lab Support` tasks.

**Specific UI Interactions:**

* **Success Feedback:** Upon successful submission, a temporary "toast" notification must appear: "✅ Lab has been booked for Lab Support."

### **4.2.6 Feature: Manage Booking (Cancel & Postpone)** {#4.2.6-feature:-manage-booking-(cancel-&-postpone)}

**Description:** Defines the rules and logic for a **teacher** to manage their existing bookings. This includes the ability to cancel a `Pending` or `Booked` lab, or to initiate a `Postpone` request for a new time slot.

**User Story:** As a teacher, my lesson plan can change unexpectedly. I want to be able to cancel or postpone my lab bookings easily through the app, so I can manage my schedule and free up the lab for others.

**Acceptance Criteria:**

1. **Business Rule (24-Hour Lock):** A teacher can **only** cancel or postpone a booking up to **24 hours before** the scheduled start time of the lab period.  
2. When a teacher clicks on a booking they own (Status: `Booked` or `Pending`), a **Booking Details** modal must appear.  
3. This modal must display a "Cancel Booking" button and a "Postpone" button.  
4. **Disabled State:** If the booking's start time is within 24 hours of the current time, the "Cancel Booking" and "Postpone" buttons must be **disabled** (greyed out).  
5. **Cancel Flow:** If the "Cancel Booking" button is clicked, the application initiates the **"Cancel Booking"** or **"Cancel a Postponement Request"** flow, as defined in the User Flow (Section 4.3).  
6. **Postpone Flow:** If the "Postpone" button is clicked, the application initiates the **"Postpone Booking"** flow, as defined in the User Flow (Section 4.3).  
7. **Notification:** A successful cancellation or postponement request must trigger an email notification to the teacher and the TALT email group.

**Unhappy Paths:**

* **Past 24-Hour Window:** A teacher opens a booking for a lab that starts in 3 hours. The "Cancel" and "Postpone" buttons are disabled. A tooltip or message explains why: "Bookings cannot be changed within 24 hours of the start time."  
* **Network Failure:** A user clicks "Confirm Cancel" but has no internet. An error message appears ("Action failed. Please check your connection"), and the booking is not cancelled.  
* **Stale Data:** A teacher clicks "Cancel" on a booking that a TALT *just* declined. The `cancelBooking` API must fail with an error: "This booking's status has already been changed. Please refresh."

**Edge Cases:**

* **Postponement-in-Progress:** When a teacher initiates a postponement, the *original* booking (Status: `Await confirmation (Postponing)`) must have its "Cancel" and "Postpone" buttons disabled to force the user to manage the *new* `Pending` request.

**Specific UI Interactions:**

* **Confirmation Modal:** Clicking "Cancel Booking" must always trigger a confirmation pop-up to prevent accidental clicks.  
  * *For a normal booking:* "Are you sure you want to cancel this lab?"  
  * *For a new postponement request:* "Cancel this postponement request? This will reinstate your original booking."

### **4.2.7 Feature: Lab Technician Management (Assign, Approve, Decline, Force Cancel)** {#4.2.7-feature:-lab-technician-management-(assign,-approve,-decline,-force-cancel)}

**Description:** A dashboard where TALTs can manage the full lifecycle of a reservation: approving pending requests (by assigning a lab and TALT), declining requests (with a reason), and force-cancelling existing bookings for administrative reasons. 

**User Story:** As a semi-head lab technician, I want to see a queue of all pending requests so I can efficiently manage them. I need to check workloads, assign labs/TALTs, and then confirm or decline the request. I also need the ability to administratively cancel any booking if an urgent issue arises (like a lab flooding or an HoD directive). 

**Acceptance Criteria (Assign, Approve, Decline):**

1. The TALT dashboard must display a "Pending Requests" list, visually grouping **batch** requests.  
2. Clicking a pending request (or a **batch**) opens a Booking Details modal.  
3. This modal must call getAvailableTALTsForBooking to populate an "Assign to:" dropdown with a "smart list" of all TALTs and their workload status.  
4. This modal must display an "Assign Lab Room:" dropdown showing all labs (with unavailable labs greyed out).  
   1. Upon approval, the TALT must select a LabName (where the API call handles the corresponding LabID) from the available rooms. This assignment triggers the confirmation email to the teacher with the room details.  
5. **Workload Warning:** The "Assign to:" list must visually warn if a TALT is over the 5-period daily limit or 3-consecutive-period limit.  
   1. Define that if the "Workload Check" (Daily \>5 periods or \>3 consecutive) fails, a bypass is possible only if the TALT provides an explicit reason in the approval modal.  
6. **Double Booking Check:** The system must perform a final check for lab availability at the moment of approval (this is the "Race Condition" check).  
7. **Google Calendar:** When a TALT approves a booking, the system must automatically create a new Google Calendar event on the shared lab calendar.  
8. The "Assign Lab Room" dropdown is a "smart list" that must show the P-1 and P+1 booking status for each available lab.

**Acceptance Criteria (Force Cancel):**

1. A TALT must be able to "Force Cancel" any Booked or Pending request from the Master Dashboard.  
2. The Booking Details modal for any active booking must have a "Force Cancel" button.  
3. This action must set the Status to `Cancelled (Admin)` to differentiate it from a teacher's cancellation.  
4. A notification must be sent to the teacher clearly stating the cancellation was an administrative action and providing the reason.

**Unhappy Paths:**

* **Missing Reason (Decline/Force Cancel):** If a TALT tries to "Decline" or "Force Cancel" without providing a reason, the "Submit" button must be disabled and a validation message ("A reason is required") must appear.  
* **Stale Data:** A TALT tries to approve a booking that was just cancelled by the teacher. The action must fail with an error: *"Action failed. This request has already been cancelled."*  
* **Race Condition (Double Booking):** A TALT tries to approve a request for a slot (Chem1, P3) that was just booked by another TALT (e.g., for Lab Support). The approval must fail with an error: *"This lab room is no longer available."*  
* **No Available Labs:** A TALT opens a pending request, but there are no suitable lab rooms available at that time (due to a race condition where all labs became full after the teacher submitted the request).  
* *UI/Logic:* The "Assign Lab Room" dropdown must appear empty or disabled. The "Approve" button must be disabled. The TALT's only option is to "Decline" the request (e.g., with the reason "No lab rooms available at this time"). 

**Edge Cases:**

* **Approving/Declining a Postponement:** The system must correctly handle the two-part transaction (as defined in the User Flow).  
* **Approving/Declining a Batch:** The TALT uses the **"Batch Management Modal"** to individually assign and action each request within a **batch**. The system sends one consolidated notification at the end.

**Specific UI Interactions:**

* **Bypass Modal:** If a TALT selects an overloaded TALT and clicks "Approve," a warning modal with a checkbox (`[ ] I acknowledge and approve this override`) must appear and be checked before proceeding.  
* **Confirmation Modal (Decline):** Clicking "Decline" must trigger a confirmation pop-up (*"Are you sure you want to decline this booking?"*).  
* **Confirmation Modal (Force Cancel):** Clicking the "Force Cancel" button must open a modal. This modal must require the TALT to type a reason before the "Confirm Force Cancel" button is enabled.

### **4.2.8 Feature: Dynamic Bell Schedule Selection (Grade-Level Logic)** {#4.2.8-feature:-dynamic-bell-schedule-selection-(grade-level-logic)}

**Description:** The application must dynamically determine the precise start and end times for Period 2 (P2) based on the grade level associated with the teacher's scheduled class. This logic is handled during the TALT's approval step to ensure data is correct before a booking is confirmed. For subjects categorized as Grade 'All' (e.g., Wellbeing, Homeroom), the system shall resolve P2 timing conflicts by defaulting to the 'PrimaryGrade' value found in the requesting teacher's user profile. 

**User Story:** As a teacher, I want to book my P2 lab without worrying about the split-break schedule. I trust the system to handle the timing details, and if my lab time is shorter than usual, I expect to be notified.

**Acceptance Criteria:**

1. A teacher can successfully submit a booking request for a P2 slot. The request will enter the `Pending` state.  
2. When a TALT opens a pending P2 request to approve it, the backend script must perform the following logic:  
3. **Lookup Grade:** The system must find the booking's class in the `TeacherTimeTables` sheet. It will then read the `Grade` column for that class (which is auto-populated by a `VLOOKUP` from the `Subjects` sheet).  
4. **Determine Time Pair:** Based on the `Grade` value found:  
   * If `Grade` is **11**, use `PeriodID = '2-11'` from the `Bell` sheet.  
   * If `Grade` is **10** or **12**, use `PeriodID = '2-10/12'` from the `Bell` sheet.  
   * **Data Persistence:** Upon approval, the backend script must update the **Period (Column K)** in the *Transactions* sheet for that specific row, changing the initial "2" to the determined PeriodID (e.g., "2-11" or "2-10/12"). This ensures the sheet's `TimeSlotID` formula correctly maps to the Bell schedule.   
5. **Short Lab Notification:** If the logic successfully finds the P2 time and the total duration is **less than 50 minutes**, the system must show a toast message in the app and also add a special note to the teacher's final confirmation email. Ensure that the `updatedBookingDetails` response also includes a `isShortLab: true` flag. This allows the **Frontend** to show a "Success" toast message that says: *"Approved\! (Note: This is a 45-min lab).*   
6. **Google Calendar Event:** The final event created in Google Calendar must use the precise `DateTime` objects derived from this grade-level logic.  
7. **Scope Limitation:** This dynamic time logic must *only* apply to periods identified as P2.  
8. For subjects with Grade 'All', the system shall default to the Grade level assigned to the requesting Teacher’s profile to determine P2 timings. 

**Unhappy Paths:**

* **Missing Grade Data:** A TALT opens a P2 request, but the `Grade` column for that class in `TeacherTimeTables` is empty (e.g., the `VLOOKUP` failed or the master `Subjects` sheet is incorrect). The "Approve" button must be **disabled**, and a clear error message shown *to the TALT*: "Cannot approve. Grade level is missing for this class. Please check `Subjects` and `TeacherTimeTables` sheets."  
* **Missing Bell Data:** The system correctly finds the `Grade` (e.g., "11") but cannot find the `PeriodID = '2-11'` in the `Bell` sheet. The "Approve" button must be **disabled**, and an error message shown *to the TALT*: "Cannot approve. Bell schedule configuration is missing for '2-11'."

**Edge Cases:**

* **Non-10/11/12 Grades:** If the `Grade` column contains a different value (e.g., "9"), the system will correctly fail to find a matching P2 time, triggering the "Missing Bell Data" error. This is acceptable.

**Specific UI Interactions:**

* **Short Lab Warning (TALT):** When a TALT opens a P2 request that is a "short lab" (\<50 min), the modal must display a small warning *to the TALT*: "Note: This is a shortened \[e.g., 45-min\] lab. The teacher will be notified upon approval."

### **4.2.9 Feature: Notification System** {#4.2.9-feature:-notification-system}

**Description:** The system will send automated email notifications to keep all stakeholders (teachers and the TALT team) informed about the lifecycle of a lab booking. To ensure all communication is official and centralized, all notifications will originate from the `talt.muids@mahidol.ac.th` group account address.

**User Story:**

* **Teacher:** As a teacher, I want to receive immediate email updates about my lab bookings—when my request is received, confirmed, declined, or cancelled—so I can be confident in my schedule and know the status of my requests without having to constantly check the app.  
* **TALT:** As a Lab Technician/TA, I want to be notified immediately when a new lab booking request is submitted or cancelled, so I can manage my workload efficiently and respond to teacher requests in a timely manner.

**Acceptance Criteria (Notification Triggers):**

1. **General:**  
   * All email notifications sent by the system must display `talt.muids@mahidol.ac.th` as the sender's address (using the name "TALT: Booking System").  
   * All notification emails must contain the key details of the booking (e.g., Lab Name, Date, Period, and Lab Title).  
2. **Trigger: New Request Submitted** (`Status` changes to `Pending`):  
   * An email must be sent to the TALT group (`talt.muids@mahidol.ac.th`) notifying them of the new request.  
   * A receipt email must be sent to the Teacher.  
   * *Special Case (Postponement):* If the request is a postponement (`LinkedBookingID` is not null), the email subject/body must clearly state this (e.g., "New POSTPONEMENT Request...").  
   * *Special Case (Multi-Section Batch):* If `submitBatchBooking` is used for a multi-section batch, one consolidated email is sent.  
3. **Trigger: Request Approved** (`Status` changes to `Booked`):  
   * A confirmation email must be sent to the Teacher.  
   * *Special Case (Any period that is \< 50 min):* The teacher's email must include the warning note: *"Please note: This lab period is shortened to \[XX\] minutes."*  
   * *Special Case (Workload Bypass):* If the bypassWarning flag was true, a separate notification email must be sent to the HoD (the user with isHoD: true).  
   * *Special Case (TALT Proxy):* If booked on behalf of a teacher, the email should reflect this (e.g., "Your booking was confirmed by TALT Mek.").  
   * *Special Case (Multi-Section Batch):* If approveBooking is processing the last item in a submitted **batch**, one consolidated email is sent.  
   * If a workload bypass is used, an automated notification email is sent to the user(s) marked isHoD \= TRUE. *Exception:* If the person who requested the booking OR the person approving the booking is the HoD themselves, the notification email is suppressed to avoid redundant self-notifications.   
4. **Trigger: Request Declined** (`Status` changes to `Denied`):  
   * A notification email must be sent to the Teacher.  
   * This email must include the `technicianRemark` (the reason for the denial).  
   * *Special Case (Multi-Section Batch):* If `declineBooking` is processing the last item in a **batch**, one consolidated email is sent.  
5. **Trigger: Booking Cancelled** (`Status` changes to `Cancelled by User`):  
   * A notification email must be sent to the TALT group.  
   * A confirmation email must be sent to the Teacher..  
6. **Trigger: Booking Force Cancelled** (`Status` changes to `Cancelled (Admin)`):  
   * A notification email must be sent to the Teacher, clearly stating it was an administrative cancellation and including the reason.

**Unhappy Paths:**

* **Gmail Service Failure:** If the `GmailApp.sendEmail()` function fails (e.g., Google service is down, quota exceeded), the API call must still succeed in its primary task (e.g., approving the booking). The failure to send an email must be logged by the backend script but must not break the application's core workflow.  
* **Invalid Alias:** If the `from` alias is misconfigured, the script will fail. The system must have error handling (`try...catch`) for this and log the failure.

**Technical Implementation Notes:**

* The email notifications will be implemented using Google Apps Script.  
* The `GmailApp` service must be used (not `MailApp`) to enable sending from an alias.  
* The `from` option within the `GmailApp.sendEmail()` function must be explicitly set to `talt.muids@mahidol.ac.th`.  
* The `name` option should be set to "TALT: Booking System".  
* *Prerequisite:* The user account that authorizes the script must have `talt.muids@mahidol.ac.th` configured as a "Send mail as" alias in their Gmail settings.

### **4.2.10 Feature: Onboarding Tutorial and Help Guide** {#4.2.10-feature:-onboarding-tutorial-and-help-guide}

**Description:** To ensure a smooth user experience, the application will feature an integrated tutorial system. For new users, a mandatory, step-by-step tutorial will launch automatically upon their first login. For all users, a persistent help ("?") button will be available, allowing them to relaunch the tutorial at any time.

**User Story:**

* **First-Time User:** As a new user, I want to be automatically guided through the main features, so I can learn how to view the calendar and book a lab correctly without feeling lost.  
* **All Users:** As a user, I want to be able to access a quick guide at any time, so that if I forget how to do something, I can find the answer immediately.

**Acceptance Criteria:**

1. The `Users` table must have a column: `hasCompletedTutorial` (Boolean), defaulting to `FALSE`.  
2. Upon a user's successful login, the system must check the `hasCompletedTutorial` flag for that user (this check is part of `getUserInfo`).  
3. **Forced Tutorial:** If the `hasCompletedTutorial` flag is `FALSE`, a tutorial sequence must launch automatically in a modal overlay, preventing interaction with the main application.  
4. The tutorial must consist of at least five steps:  
   * **Step 1:** Welcome and introduction.  
   * **Step 2:** Explaining the calendar view ("My Timeline" vs "Master Dashboard"), status icons, and color-coding.  
   * **Step 3:** A guided walkthrough of how to use the **"Selected Slots"** panel to stage and request a lab.  
   * **Step 4:** Explaining how to check the status of a Pending booking.  
   * **Step 5:** Explaining how to find and use the "Postpone" and "Cancel" buttons on an existing booking.  
5. **Set Flag on Completion:** Upon clicking the final "Finish" button on the forced tutorial, the system must call the `completeTutorial` API to update the `hasCompletedTutorial` flag to `TRUE`.  
6. **Help Button:** A clearly visible help icon ("?") must be present in a fixed position (e.g., top-right corner) on all main screens.  
7. Clicking the "?" button must launch the same tutorial sequence as an optional guide.  
8. The optional guide (from the "?" button) must have a clear "Close" or "X" icon on every step, allowing the user to exit at any time.

**Unhappy Paths:**

* **Browser Closed Mid-Tutorial:** If the user closes their browser mid-tutorial, the `hasCompletedTutorial` flag will remain `FALSE`. The tutorial must automatically restart from the beginning the next time they log in.  
* **API Failure:** If the backend script fails to update the flag to `TRUE` after completion (e.g., network error), the flag will remain `FALSE`, and the tutorial will launch again on the next login. The system must not crash.

**Edge Cases:**

* **Manual User Add:** If a new user is added directly to the `Users` sheet, their `hasCompletedTutorial` flag must default to `FALSE` to ensure they receive the tutorial.  
* **Tutorial Update:** If the tutorial content is updated in a future version, an admin can manually reset the `hasCompletedTutorial` flag for all users to `FALSE`, forcing them to see the new guide. (A UI for this is a V2.0 feature).

**Specific UI Interactions:**

* **Modal Overlay:** The tutorial must display in a modal with a semi-transparent dark background, focusing the user's attention.  
* **Spotlight:** Each step should use a "spotlight" effect to highlight the specific UI element being explained (e.g., the calendar grid, the **"Review Selection"** button).  
* **Progress Indicator:** A clear indicator (e.g., "Step 2 of 5") must be visible.  
* **Tooltip:** The "?" button should have a tooltip on hover that reads "Help & Tutorial".

### **4.2.11 Feature: Lab Outage Management** {#4.2.11-feature:-lab-outage-management}

**Description:** Provides a dedicated interface for TALTs to block out labs for specific date ranges due to maintenance, repairs, deep cleaning, or other extended unavailability. This feature writes to the `LabOutages` table, which the main calendar reads from to show slots as "N/A". This is the "big scalpel" for managing multi-day or full-day closures.

**User Story (TALT):** As a TALT, I want to easily mark a lab as 'Out of Service' for a specific date range and provide a reason, so that teachers are automatically prevented from booking it and I don't have to manually decline their requests.

**Acceptance Criteria:**

1. A TALT must have access to a "Manage Outages" or "Lab Status" page in their dashboard.  
2. On this page, a TALT must see a list of all currently active and future outages.  
3. A TALT must be able to create a new outage by selecting:  
   * A lab from a dropdown list (populated from the `Labs` sheet).  
   * A `StartDate`.  
   * An `EndDate`.  
   * A `Reason` (e.g., "Flood repairs").  
4. A TALT must be able to delete an existing outage from the list.  
5. After a new outage is created, the `getCalendarData` function must immediately reflect this change, and any affected slots on the main calendar must show as "N/A".  
6. Hovering over an "N/A" slot on the main calendar must show the `Reason` from the outage (e.g., "N/A \- Flood repairs").

**Unhappy Paths:**

* **Failed Form Validation:** The TALT tries to submit the "Create Outage" form:  
  * With the `EndDate` set before the `StartDate`. The form must be blocked with an error: "End date must be on or after the start date."  
  * Without selecting a `Lab`. An error message "Please select a lab" must appear.  
  * Without providing a `Reason`. An error message "A reason is required" must appear.  
* **Unauthorized Access:** A user with the `Role` of 'teacher' somehow navigates to the "Manage Outages" page URL. They must be shown a "Permission Denied" error and redirected.  
* **Data Load Failure:** The list of current outages (`getLabOutages` function) fails to load. The list area must display an error message: "Could not load outages. Please try again later."

**Edge Cases:**

* **Outage Conflicts with Existing Bookings:** Outages have higher priority than bookings. When a TALT creates an outage, the system must find all existing `Booked` or `Pending` bookings for that lab within that date range. The system must **auto-cancel** all conflicting bookings and send a notification email to the affected teachers.  
* **Single-Day Outage:** The TALT sets the `StartDate` and `EndDate` to the same day. This must be allowed and should correctly block that single day.  
* **Deletion Race Condition:** Two TALTs view the list. TALT A deletes an outage. When TALT B clicks the delete button for the same outage, they must receive a non-crashing error: "This outage has already been deleted."

**Specific UI Interactions:**

* **Loading State:** When the "Manage Outages" page is opened, a loading spinner or skeleton list must be shown while the `getLabOutages` function is fetching data.  
* **Empty State:** If there are no active or future outages, the list area must display a clear message: "There are no scheduled lab outages."  
* **Deletion Confirmation:** When a TALT clicks the "Delete" button for an outage, a confirmation modal must appear: "Are you sure you want to delete this outage? This action cannot be undone." The deletion only proceeds if they confirm.  
* **List Auto-Refresh:** After a TALT successfully creates or deletes an outage, the list of outages on the page must refresh automatically.  
* **Success Feedback:** After creating or deleting an outage, a temporary "toast" notification must appear (e.g., "✅ Outage for Bio1 created.").

### **4.2.12 Feature: Multi-Section Booking** {#4.2.12-feature:-multi-section-booking}

**Description:**Allows a teacher to select one or more available lab slots for the same subject across different periods/days and submit them as a single, coherent request using the standard reservation form.

**User Story:** As a teacher, I want to click all the lab slots I need for the week for a specific subject, whether it's one or five, and then fill out a single form to book them all, so I can work quickly and efficiently. 

**Acceptance Criteria (Teacher UI "Selected Slots" ):**

1. When a teacher clicks an "Available" slot, the application does not immediately open the booking form.  
2. Instead, the slot is highlighted (selected), and a new **"Selected Slots"** UI element panel appears (e.g., button **"Review Selection (1)"**).  
3. The teacher can click other "Available" slots.  
4. **Frontend Validation (Subject):** The UI must enforce that all selected slots are for the same subject. If a "Gen.Phys" slot is selected, all "Int.Sci" slots must become un-clickable, and a tooltip must explain why.  
5. **Frontend Validation (Section):** The UI must enforce that only one slot per unique section can be selected within a batch (e.g., cannot select Mon P1 and Wed P3 if both are for "Gen.Phys 1101").  
6. As slots are added/removed, the review button updates (e.g., **"Review Selection (3)"**).  
7. When the user clicks the **"Review Selection (\#)"** button, a single reservation form appears (fields: Lab Title (required), Remark).

**Acceptance Criteria (Backend & API Logic):**

1. When the user clicks "Submit" on the form, the frontend detects the number of selected slots.  
2. **Unified Batch Path:** The frontend calls `submitBatchBooking` regardless of whether the array contains single or multiple slots, treating all payloads uniformly as a **batch** transaction.  
3. **Batch ID:** A `BatchID` column must be added to the `Transactions` sheet. When `submitBatchBooking` is called, a unique `BatchID` must be generated and applied to all new Transaction records within that specific payload.  
4. **Atomicity:** The `submitBatchBooking` transaction must be atomic. If any selected slot fails validation (2-day rule, availability), the entire batch must fail, and no records created.  
5. All new records are created with Status: `'Pending'`.

**Acceptance Criteria (TALT UI \- Batch Management):**

1. Single-slot requests (where rows share a unique `BatchID` but contain only one element) appear natively as individual items, while multi-slot **batches** must be visually grouped in the "Pending Requests" list (e.g., "Gen.Phys \- 3 Sections (Batch: BATCH789)").  
2. Clicking on a batch group must open a dedicated **"Batch Management Modal."**  
3. This modal must display a list showing each individual booking request within that **batch**.  
4. For each request in the modal, the TALT must be able to:  
   * Select an available Lab Room from a dropdown (`<Lab availability check>`).  
   * Select an available TALT from the smart list dropdown (`<Workload check>`).  
5. The modal must provide a mechanism for the TALT to individually approve or decline each request (e.g., Approve/Decline buttons next to each row). (Declining requires a reason).

**Acceptance Criteria (Notification Logic):**

1. **Submission (Single):** Triggers one receipt email.  
2. **Submission (Multi):** Triggers one consolidated receipt email (e.g., "We have received your request for 3 sections.").  
3. **Approval/Decline (Single):** Triggers one confirmation/decline email.  
4. **Approval/Decline (Multi):** The `approveBooking` and `declineBooking` APIs will check if a processed item is the last in its **batch**. Only then will one consolidated notification be sent summarizing the entire **batch** (e.g., "Batch Update: 2 Booked, 1 Denied").

**Unhappy Paths:**

* **Invalid Selection (Subject):** UI blocks selecting slots for different subjects: *"All selected labs must be for the same subject."*  
* **Invalid Selection (Section):** UI blocks selecting multiple slots for the same section: *"You can only book one lab per section in a single request."*  
* **Partial Availability (Race Condition):** User submits a batch, but one slot was just taken. `submitBatchBooking` fails: *"One or more of the selected slots are no longer available. Your request was not submitted."*  
* **2-Day Rule:** If any selected slot violates the 2-day advance rule, the **"Review Selection (\#)"** button is disabled with a tooltip explaining why.

**Specific UI Interactions:**

* **Deselecting:** Clicking a selected slot deselects it. If count drops to 0, the **"Selected Slots"** panel/action element disappears.  
* **Success Toast (Single):** *"✅ Your request has been sent."*  
* **Success Toast (Multi):** *"✅ Your request for 3 sections has been sent."*

### **4.2.13: Feature: TALT Proxy Mode (Book for Teacher)** {#4.2.13:-feature:-talt-proxy-mode-(book-for-teacher)}

**Description:** Enables a Lab Technician or TA (TALT) to conduct a reservation acting as a proxy for a teacher. This functionality is utilized when a faculty member submits a request through unofficial channels—such as telephone, email, or face-to-face communication—requiring the TALT to formally document the entry within the application. The TALT effectively views and interacts with the application as if they were the selected teacher, but with special administrative permissions (like bypassing the 2-day rule).

**User Story (TALT):** As a TALT, I want to select a teacher from a list and view the calendar exactly as they see it, so I can accurately book a lab for their specific subject and schedule without them having to log in. I want to be able to do this on their behalf, seeing their exact schedule and bypassing rules if necessary, while ensuring the booking is still correctly logged under their name, with a note which TALT make the bookings.

**Acceptance Criteria (TALT UI):**

1. **Entry Point:** A "Book for Teacher" button must be visible on the TALT Dashboard.  
2. **Teacher Selection:** Clicking the button opens a searchable modal list of all users with the Role: 'teacher'.  
3. **Visual Indicator:** Upon selecting a teacher, the application enters "Proxy Mode."  
   1. The UI must display a prominent top banner (e.g., bright yellow or orange) stating: *"Acting as: \[Teacher Name\] (Proxy Mode)"*.  
   2. An "Exit Proxy Mode" button must be present in the banner.  
4. **Calendar Mirroring:** The calendar must reload to show the selected teacher's personal schedule and subject availability by calling `getCalendarData` passing the TALT's ID as `loggedInUserId` and the teacher's ID as `targetUserId`.  
5. **Simplified Workflow:** The TALT follows the Teacher **"Selected Slots"** Flow (4.3.1).  
   1. Because the user is a TALT, a "Room Assignment" dropdown appears immediately on the booking form.  
   2. user is a TALT, a **"Room Assignment"** dropdown appears immediately on the booking form.  
6. **Bypass 2-Day Rule:** If the TALT selects a slot violating the 2-day rule, the **"Review Selection (\#)"** button remains enabled.  
7. Upon submission, the booking is created with Status: 'Booked' (skipping 'Await confirmation').  
8. The frontend calls submitBatchBooking using the TALT's ID as loggedInUserId and the teacher's ID as targetUserId.

**Unhappy Paths:**

* **Unscheduled Class:** If the TALT tries to book a slot where the teacher is not scheduled to teach, the API returns: *"Booking failed: The selected teacher is not scheduled to teach this subject during this period."* The **staged selection** is preserved for editing.  
* **Teacher Not Found:** If the search yields no results, display: *"No teacher found. Please check the spelling."*  
* **Accidental Proxy:** If the TALT forgets they are in Proxy Mode and tries to book for themselves, the bright banner serves as the primary warning. If they close the browser while in Proxy Mode, the session should reset to their own TALT view upon next login.

**Edge Cases:**

* **Exiting Proxy Mode:** A clear "Exit Proxy Mode" button or link must be visible, allowing the TALT to return to their own "Master Dashboard." 

**Specific UI Interactions:**

* **Proxy Indicator:** While in "Proxy Mode," a persistent banner must be displayed at the top of the screen (e.g., *"You are currently booking as: Teacher Tenzin"*).  
* **Bypass Modal:** When submitting a request that violates the 2-day rule, a confirmation modal must appear (e.g., *"This booking is less than 2 instructional days away. Proceed anyway?"*). The `bypassLeadTimeWarning: true` flag is only sent if the TALT confirms.  
* **Search-as-you-type:** The teacher selection modal should filter the list in real-time as the TALT types the name or email.  
* **Color Shift:** The overall theme of the app could subtly shift colors (e.g., sidebar changes from blue to dark grey) to provide a constant "non-standard state" reminder.

## **4.3: User Flows & Navigation** {#4.3:-user-flows-&-navigation}

This section outlines the primary paths users will take through the application. 

### **4.3.1 Teacher User Flow 👩‍🏫** {#4.3.1-teacher-user-flow-👩‍🏫}

**1\. Login & Onboarding**  
→ User clicks "Login with Google" \<Google Auth logic\>.  
→ System verifies the user's email against the Users sheet using \<User Verification logic\>.  
→ The application loads to the current week with the \<Current Date logic\>.  
→ If `hasCompletedTutorial` is FALSE using \<Tutorial check\>, the mandatory tutorial automatically begins. 

**2\. Main Calendar View (Hub)**  
→ The user lands on their default "My Timeline" view after the \<Data Fetch logic\>.  
→ This view shows their teaching blocks and status (Available, Booked, Pending, N/A) using the \<Availability logic\>.  
→ Optional Toggle: "Show Master Calendar" reveals the complex TALT dashboard. 

**3\. Booking a New Lab (Smart Selected Slots Flow)**  
**→** User clicks an "Available" class slot.

* Quick-Book Templates: Users may save a specific combination of Subject \+ Section \+ Period as a "Template." Selecting a template from the Booking Form will auto-populate these fields, leaving only the Date to be selected, reducing booking time to under 10 seconds. 

**→** Slot highlights, and the **Selected Slots** staging panel appears with the action button "Review Selection (1)".  
**→** UI applies "Smart Section-Blocking" filter \<Multi-section validation\>.

* **Smart Selected Slots Constraints:** To maintain data integrity, once the first slot is added to the selection, the UI will "lock" the view to only allow additional slots that match the same Subject and Grade. Any slots belonging to different subjects will be temporarily disabled (greyed out) until the selection is submitted or cleared. 

**→** User selects more valid slots. The button updates, e.g., **"Review Selection (\#)"**.  
**→** User clicks **"Review Selection (\#)"** \<2-day advance rule check\>.  
**→** Simple Reservation Form modal appears.  
**→** User fills form and clicks "Submit".  
**→** Frontend passes the payload array directly to the uniform submitBatchBooking API \<API Routing logic\>.  
**→** Calendar updates to Pending.  
**→** Consolidated receipt email sent \<Notification logic\>.

**4\. Booking Status Updates**  
**→** Status on timeline updates after TALT action (Booked ✅ or Denied ❌). 

**5\. Managing an Existing Booking**  
**→** User clicks a Booked or Pending slot.  
**→** Booking Details modal appears.  
**→** "Cancel" / "Postpone" buttons are enabled/disabled `<24hr rule check>`.  
**→** **Cancel Flow:**  
**→** User clicks "Cancel Booking".  
**→** A confirmation prompt appears.  
**→** User confirms.  
**→** Status updates to `Cancelled by User`.  
**→** Slot becomes available.  
**→** Email sent `<Notification logic>`.  
**→** **Postpone Flow:**   
**→** User clicks "Postpone".  
**→** Enters "Postponement Mode".  
**→** Selects new slot `<2-day advance rule check>`.  
**→** Confirms the postponement.  
**→** Original status updates to `Pending (Postponement)`. This slot is not yet available to other users.  
**→** New request created (Pending) `<Postpone logic transaction>`.  
**→** Email sent `<Notification logic>`.  
**→** **Cancel Postponement Request Flow:**   
**→** User cancels the new Pending request.  
**→** Confirms the cancellation.  
**→** New request becomes `Cancelled by User`.  
**→** Original Booking (BK123): Status reverts from `Pending (Postponement)` back to `Booked`. `<Reinstate logic>`.  
**→** Email sent `<Notification logic>`.

### **4.3.2 Lab Technician/TA (TALT) User Flow 🔬** {#4.3.2-lab-technician/ta-(talt)-user-flow-🔬}

**1\. Login & Dashboard (Hub)**  
→ User logs in and is verified `<Google & Auth Check Role logic>`.  
→ The TALT Dashboard loads (the "Master Dashboard") `<Data Fetch logic>`.  
→ "Pending Requests" list is visible.  
→ "Filter by Subject" dropdown is available `<UI Filter logic>`.

**2\. Managing Teacher Requests (Assign & Approve/Decline)**  
**→** User selects a request from the "Pending Requests" list.  
**→** **Check Request Type:** The system checks if the selected request has a `BatchID`.  
**→** **If NO BatchID (Single Request):**  
**→** UI flags if it's a postponement request `<Postponement check>`.  
**→** System calls `getAvailableTALTsForBooking` `<TALT availability logic>`.  
**→** Booking Details modal appears with required fields:  
1\. **Assign Lab Room:** Dropdown showing all labs (unavailable greyed out) `<Lab availability check>`.  
**2\. Assign TALT:** Smart list dropdown `<Workload display status>`.  
**→** TALT selects Lab and TALT.  
**→** TALT clicks "Approve" or "Decline".  
**→** *(If Approving & Bypass Needed):* Confirmation modal appears `<Bypass UI logic>`. TALT confirms bypass.   
**→** Appropriate API called (`approveBooking` or `declineBooking`) `<Validation checks>`, `<Workload checks>`, `<P2 logic split>`, `<Bypass logic>`.  
**→** Dashboard updates `<UI Update logic>`.  
**→** Teacher receives confirmation/decline email `<Notification logic>`.  
**→** *(If Approved)* Google Calendar event created `<Calendar event logic>`.  
**→** **If YES BatchID (Part of a Batch):**  
**→** The "Batch Management Modal" opens, displaying all individual requests in that **batch**.  
**→** For each request listed in the modal:  
**→** TALT selects an available Lab Room `<Lab availability check>`.  
**→** TALT selects an available TALT `<Workload check>`, potentially triggering `<Bypass UI logic>`.  
**→** TALT chooses the action (Approve or Decline) for that specific request (declining requires adding a reason).  
**→** TALT clicks a final "Submit Batch Actions" button.  
**→** The frontend makes multiple individual calls to the appropriate API (`approveBooking` or `declineBooking`) for each request acted upon.  
**→** Dashboard updates `<UI Update logic>`.  
**→** Teacher receives one consolidated notification email summarizing the outcome for the entire **batch** `<Consolidated logic notification>`.  
**→** *(For Approved items)* Google Calendar events are created `<Calendar event logic>`

**Batch Management Interface**   
When a TALT opens a request with a `BatchID`, the system will not use the standard single-approval modal. Instead, it opens a workspace that: 

* Lists all sessions in the **batch** with individual Lab/TALT dropdowns for each.  
* Allows the TALT to **"Stage"** actions (setting Row 1 to Approve, Row 2 to Decline).  
* Requires a Single Confirmation ("Submit Batch Actions") to execute all staged changes, triggering one consolidated notification email to the teacher.

**3\. Booking Lab Support Tasks**  
**→** TALT clicks an "Available" slot on Master Dashboard.  
**→** Selects "Lab Support", fills "Purpose", submits.  
**→** `createLabSupportBooking` API called `<Workload checks>`, `<Final availability check>`, `<Bypass logic>`.  
**→** Slot updates to `Booked (Lab Support)`.

**4\. Booking on Behalf of Teacher**  
**→** TALT clicks "Book for a Teacher" button.  
**→** Selects teacher from modal.  
**→** Calendar enters "Proxy Mode" (viewing as another teacher), reloading the teacher's "My Timeline" view `<Proxy data fetch logic>`.  
**→** TALT follows the teacher's **"Smart Selected Slots"** flow `<Teacher applies booking logic>`.

## **4.4 UI/UX Considerations** {#4.4-ui/ux-considerations}

To ensure a consistent, intuitive, and visually appealing user experience, the design for the Lab Booking App is documented via Google Slides in favor of Functional Code-Wireframes. This approach ensures that the development team has clear guidelines for the application's layout and interactive behavior while prioritizing rapid iteration over high-fidelity graphic design. 

**Process:** Generate functional wireframes in Slides to define spatial arrangements and user flows. 

**Implementation:** Use Tailwind CSS "Code-Wireframes" (Section 15.4) to translate these slides directly into HTML. Developers/AI should focus on the "Semantic Labels" (e.g., "Primary Action Button", "Alert Banner") in the slides to choose the correct Tailwind utility classes. 

**Slide-to-Claude Pipeline:** The Google Slides serve as the visual source of truth. The Gemini Designer Gem will interpret these slides for Claude, providing the specific Tailwind utility classes Claude needs to implement the design.  

### **4.4.1 Key Design Principles:** {#4.4.1-key-design-principles:}

* **Clarity:** The interface prioritizes clear, unambiguous presentation of information (e.g., lab availability, booking status, error messages).  
* **Efficiency:** User flows are streamlined, minimizing clicks and data entry for common tasks (e.g., the **"Selected Slots"** and **"Batch Management"** flows).  
* **Consistency:** UI components, typography, color schemes, and interaction patterns are consistent across all screens.  
* **Feedback:** The system provides immediate and clear visual feedback for all user actions and system states (e.g., loading, success, error).  
* **Dark Mode Support:** To accommodate technicians working in low-light laboratory environments and reduce eye strain during extended dashboard monitoring, the UI must support a high-contrast "Dark Mode." This toggle must apply a dark theme globally across the entire viewport.

### **4.4.2 Visual Source of Truth (Google Slides):** {#4.4.2-visual-source-of-truth-(google-slides):}

Link: [https\://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc\_3lUmaRRo/edit?usp=sharing](https://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc_3lUmaRRo/edit?usp=sharing)

The Google Slides serve as the spatial reference. **The Gemini Wireframe Designer Gem will interpret these layouts and generate the 'Code-Wireframe' descriptions required by Claude to implement the UI.** This eliminates the need for manual CSS adjustment during development. 

* **Screen Layouts:** Functional wireframes for all key screens (Login, Teacher "My Timeline", TALT "Master Dashboard", Booking Form, TALT Modals, Onboarding Tutorial).  
* **Component Library:** Definitions for reusable UI components (buttons, input fields, dropdowns, modals, icons) and their states (hover, disabled, active).  
* **Color Palette:** Primary (Mahidol Blue), secondary, accent, and status (success, warning, error) definitions using Tailwind-compatible hex codes.  
* **Typography:** Hierarchy for headings, body text, and labels.  
* **Spacing & Grid:** Guidelines for consistent spacing between elements (e.g., 8px grid) and overall layout structure.  
* **Interaction Flows:** Visual representations of user journeys and micro-interactions (e.g., form validation feedback).

**Note:** Developers are expected to consult the Google Slides as the definitive guide for spatial arrangements. Any discrepancies between this functional specification and the wireframes should be raised immediately for clarification.

### **4.4.3 Visual Feedback & Progressive Loading**  {#4.4.3-visual-feedback-&-progressive-loading}

To maintain the perception of speed and reduce user anxiety during asynchronous operations, the following states must be implemented:

* **Calendar Load:** Display a Skeleton Grid with a shimmer effect while `getCalendarData` is fetching.  
* **Booking Submission:** Change the **"Review Selection"** button to a disabled state with a spinner icon immediately upon click.  
* **TALT Approval/Decline:** Use a Modal Overlay with a progress indicator (e.g., "Updating Calendar...") to prevent users from closing the window during a multi-step write operation.

## **4.5 Responsive & Cross-Platform Strategy** {#4.5-responsive-&-cross-platform-strategy}

### **4.5.1 Multi-Surface Support:** {#4.5.1-multi-surface-support:}

The application must maintain full functional parity across Windows/macOS desktops and iOS/Android mobile browsers (Chrome, Safari, Edge).

**Scope Limitation (V1.1.3c):** While full functional desktop web view is required for all roles, note that the TALT management view is optimized for desktop presentation, and mobile viewports will focus on core teacher calendar navigation and submission workflows. 

### **4.5.2 Breakpoints:** {#4.5.2-breakpoints:}

Implement three standard Tailwind tiers:

* **Mobile (default):** Vertical stacks, full-width buttons, and horizontal-scroll containers for wide data grids.  
* **Tablet (`md:`):** 768px+, two-column layouts where applicable.   
* **Desktop (`lg:`):** 1024px+, full multi-column grid layouts and persistent navigation. 

### **4.5.3 Touch Targets:** {#4.5.3-touch-targets:}

All interactive elements (cells, buttons, selection nodes) must have a minimum hit area of 44x44px on viewports less than 768px to ensure accessibility for teachers on the move. 

# **5\. Technical Requirements** {#5.-technical-requirements}

## **5.1 Platform & OS Support** {#5.1-platform-&-os-support}

* **Primary:** The application is a web app designed for desktop-first access. It must be fully functional on the latest versions of modern browsers (Chrome, Safari, Edge, Firefox).  
* **Secondary:** The application should be usable on mobile and tablet web browsers (responsive design), but a fully optimized mobile experience (especially for the TALT Dashboard) is considered a V2.0 feature.

## **5.2 System Architecture (High-level)** {#5.2-system-architecture-(high-level)}

* The system is a server-less web application built on the Google Workspace platform.   
* **Frontend:** A single-page web application (HTML/CSS/JavaScript) served by the Google Apps Script `HtmlService`.  
* **Backend:** All business logic, validation, and data manipulation are handled server-side by Google Apps Script (`.gs` files).  
* **Database:** A single Google Sheet acts as the database for all application data.  
* **Integrations:** The backend script interfaces with native Google Workspace services:  
  * Google Sheets API (for database operations).  
  * Gmail API (via `GmailApp` for sending email notifications).  
  * Google Calendar API (via `CalendarApp` for creating events).  
  * Google OAuth 2.0 (via `Session.getActiveUser()`) for authentication.

## **5.3 Technology Stack (Proposed)** {#5.3-technology-stack-(proposed)}

* **Frontend:** HTML5, CSS (Tailwind CSS Recommended), client-side JavaScript.  
* **Client-Server Communication:** `google.script.run` asynchronous API.  
* **Backend:** Google Apps Script (server-side JavaScript).  
* **Database:** Google Sheets.  
* **Authentication:** Google Workspace OAuth 2.0 (via Apps Script built-in services).  
* **Platform Priority:**  
  * The Desktop Web View is the 'Must-Have' priority for full functionality.  
  * The 'Mobile-Smart' layout defined in the Design Spec is a secondary requirement; mobile users should be able to view the schedule and perform basic single-slot bookings, but complex batch management is optimized for Desktop.

## **5.4 Performance Requirements** {#5.4-performance-requirements}

* **Initial Load:** The main calendar view (initial `getCalendarData` call) should load within 5 seconds on a standard school network.  
* **API Responsiveness:** All subsequent API calls (e.g., submitting a booking, navigating weeks) should return a response within 2-3 seconds.  
* **Real-time (V1.1 Scope):** The system does not support automatic real-time updates. UI updates reflecting changes made by other users (e.g., a TALT approving a request) require a manual page refresh by the user.  
* **Constraint:** Google Sheets performance is a known constraint; backend logic must be optimized for efficient sheet reads/writes (e.g., minimizing API calls, using batch operations, and leveraging Google Apps Script caching where possible).  
* **Platform Constraints (Google Quotas):** Development must respect the following hard limits imposed by Google Apps Script:  
  * **Execution Time:** Functions must complete within 6 minutes (360 seconds).  
  * **Triggers:** Maximum of 20 triggers per script.  
  * **Email Limits:** 100 recipients/day (Personal accounts) or 1,500 (Google Workspace).  
  * **URL Fetch:** 10MB per request / 100,000 calls per day.  
* **Scalability Warning & Future Optimization:** While the current architecture is optimized for the first year of data, the following bottlenecks are identified for monitoring:   
  * **Current Bottleneck:** The `getCalendarData` function performs a full scan of the `Transactions` sheet. As the semester progresses and rows exceed 1,000+, load times may increase.   
  * **V2 Optimization Plan**  
    * Implement an optimized fetching strategy to use Apps Script's `DeveloperMetadata` or filter ranges by date before fetching values into memory.   
    * If initial load times exceed the 5-second threshold, implement date-filtered queries using `DeveloperMetadata` or indexed lookups to avoid full-sheet scans. 

## **5.5 Security & Privacy** {#5.5-security-&-privacy}

* **Authentication:** User identity is managed by MUIDS Google Workspace accounts. The app uses Google's built-in OAuth 2.0 flow to identify the user. Access is restricted to users listed in the `Users` sheet.  
* **Authorization (Server-Side):** All API functions must perform server-side checks to verify the user's role and permissions before executing an action.  
  * *Examples:* Only a user with role `'LabTech'` or `'TA'` can call `approveBooking` or `forceCancelBooking`. A user calling `cancelBooking` must be the owner of that booking.   
  * Note that there is not role `‘TALT’`; both `’LabTech’` and `’TA’` have the same level of authority.  
* **Asynchronous State Re-hydration:** To maintain security within the Google Workspace `<iframe>` environment (which prohibits full-page reloads), the application shall use a "Soft-Update" pipeline. Session-sensitive role changes or identity mutations must be processed via server-side callbacks returning JSON payloads, allowing the client to update the UI state locally without triggering browser-level navigation or OAuth refresh events.  
* **Data Storage:** All data resides within the MUIDS Google Workspace. Direct access to the backend Google Sheet must be restricted to administrators (e.g., the TALT team).  
* **Proxy Mode Administrative Safeguards:**   
  * **Visual Guardrail:** To prevent administrative error and ensure the "Principle of Least Astonishment," the frontend must implement a high-visibility "Acting as \[Teacher Name\]" global banner whenever the TALT is viewing or editing data via Proxy Mode.  
  * **Termination:** A clear, persistent "Exit Proxy Mode" button must be present to immediately flush the target teacher's session data from the local state and return to the TALT Dashboard.  
  * **Audit Logging:** All write operations performed in Proxy Mode must be tagged with the initiating TALT's ID in the backend logs to ensure accountability for bookings made on behalf of others.  
* **Enhanced Security Protocols**  
  * **Input Sanitization:** All data received from the frontend via `google.script.run` must be stripped of HTML tags and special characters, and be sanitized on the server side, before being written to the sheet to prevent Cross-Site Scripting (XSS).  
  * **API Rate Limiting:** While `google.script.run` is inherently throttled by Google, the client-side code must disable "Submit" buttons immediately upon clicking to prevent duplicate `google.script.run` calls.  
  * **Audit Trail (Proxy Mode):** Every action taken in "Proxy Mode" (Section 4.2.13) must log the `SubmittedByUserID` (the TALT) separately from the `BookingForUserID` (the Teacher) in the `Transactions` sheet for administrative auditing.  
* **Configuration & Template Modification Permissions**  
  * Access to the dynamic configuration editor modal (`Modal_EmailEditor.html`) is completely decoupled from the basic TALT role.  
  * **UI Constraint:** The configuration panel button will only render if the active user's authorization payload contains `Can_Edit_Config == true`.  
  * **Server-Side Guard:** Any administrative write execution triggered from the frontend to overwrite settings must include a validation check:

```js
if (user.Can_Edit_Config !== true) {
  throw new Error("Security Violation: Unauthorized attempt to alter system variables.");
}
```

* **Anonymous / Unlisted User Handling**  
  * The application operates on a strict whitelist. If an individual accesses the web app deployment URL and their Google active email is not found within the `Users` database tab, the application must completely halt standard rendering routines.  
  * **Action:** The server will refuse to serve `Index.html`. Instead, it will compile and return `UI_Unauthorized.html`.  
  * **User Experience:** The user sees a clean, branded MUIDS Landing Page stating: *"Access Restricted. Your account ({user\_email}) is not registered in the Lab Booking System. Please contact the Head Lab Technician to request enrollment.”*

## **5.6 Data Storage & Management** {#5.6-data-storage-&-management}

* **Database:** A single Google Sheet document will act as the database, with separate tabs (sheets) for each data table (`Users`, `Transactions`, `Labs`, etc.).  
* **Data Integrity:** Master data (`Users`, `Schedules`, `Labs`, `Subjects`) will be managed manually within the Google Sheet for V1.1. Data validation rules within Google Sheets (e.g., dropdowns from ranges) must be used where possible to minimize data entry errors.  
* **Backup:** Data is backed up via Google Sheets' built-in version history.

## **5.7 Analytics & Reporting** {#5.7-analytics-&-reporting}

* **V1.1 Scope:** This application will not include a built-in analytics or reporting dashboard.  
* **Manual Reporting:** Basic analysis (e.g., lab utilization, number of bookings) can be performed as-needed by TALTs using the standard pivot table and charting tools directly within the Google Sheet database.

# **6\. Data Models & Database Schema** {#6.-data-models-&-database-schema}

The application's data schema is managed within a single Google Sheet. Each tab represents a distinct table, emulating a relational database through Google Sheets' array formulas (e.g., `ARRAYFORMULA`) and lookup functions (e.g., `VLOOKUP`). This structure automates data entry, enforces validation, and creates logical relationships between disparate datasets.

**Structural Engineering Note:** This schema explicitly supports the TALT-assigns-lab model, `BatchID` groupings for multi-section requests, and `SubjectID` \+ `Grade` lookups for Period 2 break-logic.

The schema is divided into two primary categories:

* **Master Data** (*e.g., Users, Subjects, Labs, Calendar*): The definitive source of truth for core entities. These are updated infrequently and provide the data for validation rules (dropdowns) and schedule verification.  
* **Transactional Data** (*e.g., Transactions, Outages*): Records all dynamic events and interactions. These tables maintain integrity by referencing the Master Data tables and utilizing unique IDs (e.g., `TransactionID`, `BatchID`).

Strategy: Formula-Driven Columns

The system intentionally shifts relational mapping logic from the backend (Apps Script) to the frontend (Spreadsheet Formulas) where applicable. For example, the `TeacherTimeTables` sheet uses lookups to automatically verify a teacher's subject and grade based on the period selected. This reduces the complexity of API calls, minimizes manual entry errors, and ensures the data remains human-readable for administrators.  

## **6.1 All Tables** {#6.1-all-tables}

* **`Users`:** Master list of all teachers, TALTs, and HoDs with defined roles and dynamic feature flags.  
* **`Subjects`:** Master list of all subjects (e.g., Gen Chem), associated IDs, and Grade levels.  
* **`Labs`:** List of bookable rooms, including properties like capacity and Subject Tags (to facilitate room assignment).  
* **`Calendar`:** Maps specific dates to the 5-day cycle (A-E) and assigns the appropriate Bell Schedule.  
* **`Bell`:** Defines start/end times for various schedule types (Normal, Assembly, Half-day, Split Period 2).  
* **`Duties`:** Master list of fixed, non-booking TALT responsibilities used for workload calculation.  
* **`TeacherTimeTables`:** The master timetable mapping teachers to specific subjects, sections, and periods.  
* **`Outages`:** Records unavailability ranges for specific labs due to maintenance or cleaning.  
* **`Transactions`:** The engine of the application; logs every batch booking request, room assignment, status update, and Proxy Mode audit trail.  
* **`Config`:** Stores application system variables, feature flags, and dynamic email template bodies.

## **6.2 Table: Users** {#6.2-table:-users}

Stores the essential information for every individual who can log in and interact with the system. This table is fundamental for authentication (verifying who the user is) and authorization (determining what they are allowed to do). The `Role` column is critical for distinguishing between teachers, who stage requests, and lab technicians or teaching assistants, who manage and assign resources. There is no ‘TALT’ role. It’s the team acronym. Make ‘LabTech’ and ‘TA’ have the same level of authority.

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **UserID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"UserID";ARRAYFORMULA(IF(ISBLANK(B2:B),,"user\_"\&TEXT(ROW(B2:B)-1,"00")))} | Unique identifier for each user (e.g., user\_01) generated automatically based on row index. It is compiled by chronological order of joining the department. |
| **B** | **Account** | String | NOT NULL | UNIQUE | \- | Google Smart Chip for the user account. Manually added by Admin. |
| **C** | **FirstName** | String | NOT NULL | \- | \={"FirstName";ARRAYFORMULA(IF(ISBLANK(B2:B),,LEFT(B2:B,FIND(" ",B2:B)-1)))} | Human-readable first name. Derived from the Google Chip in Column B. |
| **D** | **LastName** | String | NOT NULL | \- | \={"LastName";ARRAYFORMULA(IF(ISBLANK(B2:B),,RIGHT(B2:B,LEN(B2:B)-FIND(" ",B2:B,1))))} | Human-readable last name. Derived from the Google Chip in Column B. |
| **E** | **Email** | String | NOT NULL | UNIQUE | \={"Email";ARRAYFORMULA(IF(ISBLANK(B2:B),,B2:B.email))} | User’s email address for login/notifications. Validated to be '@mahidol.ac.th'. |
| **F** | **Nickname** | String | NOT NULL | UNIQUE | \- | User’s nickname. Manually input. Used as the human-readable lookup in other sheets. |
| **G** | **Role** | Enum | NOT NULL | 'Teacher', 'LabTech', 'TA' \*There is no 'TALT' role. | \- | Defines the user's permissions within the app. |
| **H** | **isHoD** | Boolean | NOT NULL | TRUE / FALSE | \- | Identifies if the user is a Head of Department for workload bypass notifications. |
| **I** | **Subjects** | EnumList | NULLABLE | FOREIGN KEY (Subjects.SubjectID) | \- | List of all subjects the teacher teaches (separated by commas). Nullable for LabTech or TA. |
| **J** | **hasCompletedTutorial** | Boolean | NOT NULL | Default: FALSE | \- | TRUE if the user completed the UI tutorial, preventing it from popping up on future logins. |
| **K** | **Primary Grade** | Enum | NOT NULL | ‘10’, ‘11’, ‘12’ | \- | The teacher's administrative grade level. Used to determine P2 timings when booking "All-Grade" subjects (Homeroom, Meetings).  |
| **L** | **Joined AY** | Integer | NULLABLE | Valid year which is later than 2013, the year of MUIDS establishment. | \- | Record of the academic year the users joined MUIDS Science Department |
| **M** | **Can\_Edit\_Config** | Boolean | NOT NULL | TRUE / FALSE | \- | Security flag determining if this specific user can alter email templates and system constants. Must be explicitly set to TRUE by a super-admin. Default is FALSE. Role-Based Access Control (RBAC): the backend script (`API_TALT.gs`) will re-verify their email against the spreadsheet before saving any changes. If `Can_Edit_Config` is not `TRUE`, the execution terminates instantly with a security exception.  |

## **6.3 Table: Subjects** {#6.3-table:-subjects}

This table serves as a centralized, definitive list of all subjects offered. It ensures that subject names are consistent across the entire application and allows for categorization by grade level and type (e.g., 'Core', 'Elective'). This table is primarily used in dropdown menus, data validation in the Users and TeacherTimeTables sheets, and for calculating dynamic bell schedules. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **SubjectID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"SubjectID";ARRAYFORMULA(IF(ISBLANK(B2:B),,"subject\_"\&TEXT(ROW(B2:B)-1,"00")))} | Unique ID for each subject (e.g., subject\_01). Generated automatically based on row index. |
| **B** | **Subject** | String | NOT NULL | UNIQUE | \- | The official short name or code of the subject. Used as the human-readable identifier in the UI dropdowns.  |
| **C** | **Course Full Name** | String | NOT NULL | \- | \- | Title of the subject’s full official name.  |
| **D** | **Grade** | Enum | NOT NULL | '10', '11', '12', 'All' | \- | The grade level associated with the subject. **Critical: Used for the P2 split-break logic.** |
| **E** | **SubjectCategory** | Enum | NULLABLE | 'Core', 'Elective', 'Lunch Duty', 'Meeting' | \- | The type of subject, used for applying different rules, filtering, or reporting purposes. |

## **6.4 Table: Labs** {#6.4-table:-labs}

This is the master list of all physical lab rooms or resources that are available for booking. Each row represents a unique, reservable space. The system uses this list to populate booking options and to prevent double-booking of the same lab at the same time. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **LabID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"LabID";ARRAYFORMULA(IF(ISBLANK(B2:B),,"lab\_"\&TEXT(ROW(B2:B)-1,"00")))} | Unique ID for each lab (e.g., lab\_01). Generated automatically based on row index. |
| **B** | **LabName** | String | NOT NULL | UNIQUE | \- | List of the lab rooms and Science classrooms. Each lab can only accommodate 1 activity at a time. |
| **C** | **SubjectTags** | String | NOT NULL | \- | \- | Used for suggesting suitable rooms based on the subject. It is flexible; bookings are not strictly limited to these tags. |
| **D** | **Status** | Enum | NOT NULL | ‘Active’, ‘Outage’, ‘Booked’ | \- | Showing status of that lab for its availability. |

## **6.5 Table: Calendar** {#6.5-table:-calendar}

This table acts as the master calendar for the entire school schedule. Its primary role is to determine what type of school day (e.g., 'A', 'B', 'C', 'D', 'E') and what type of bell schedule (e.g., 'Regular', 'Wed', 'Assembly') applies to any given date. This information is then looked up by other tables (like Transactions) to correctly display timetables and exact time slots.

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **Date** | Date | NOT NULL | UNIQUE (PRIMARY KEY) | \- | Unique ID for each date (Format: MMM DD/YYYY). |
| **B** | **DayType** | Enum | NOT NULL | 'A', 'B', 'C', 'D', 'E' | \- | A-E schedule, manually mapped or imported from the school calendar (.xlsx format). |
| **C** | **AutoBell** | Enum | NOT NULL | 'Regular', 'Wed' | \={"AutoBell";ARRAYFORMULA(IF(ISBLANK(A2:A),,IF(WEEKDAY(A2:A)=4,"Wed","Regular")))} | Automates Wednesday apart from other Weekdays using the date. |
| **D** | **AddShortened** | Enum | NULLABLE | 'Shortened' | \- | Manually added flag for dates with an irregular schedule. Can be left blank for normal days. |
| **E** | **ManualShort** | String | NULLABLE | \- | \- | Manually specifies the specific bell schedule name (e.g., 'Assembly') for 'Shortened' dates. |
| **F** | **BellType** | String | NOT NULL | \- | \={"BellType";ARRAYFORMULA(IF(ISBLANK(A2:A),,IF(NOT(ISBLANK(E2:E)),E2:E,IF(D2:D="Shortened","NoBell",C2:C))))} | The final, definitive bell schedule. Read by the Transactions table. |

## **6.6 Table: Bell** {#6.6-table:-bell}

This table defines the precise timing for every period within every possible type of school day. It is the single source of truth for when a class period starts and ends. This allows the application to display accurate times on the calendar and to calculate the duration of each period. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **TimeSlotID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"TimeSlotID";ARRAYFORMULA(IF(ISBLANK(C2:C),,"TS\_P"\&TRIM(C2:C)&"\_"\&TRIM(B2:B)))} | Composite Key from PeriodID and BellType. Usually spans \~16 rows per schedule (e.g., A2:A17). |
| **B** | **BellType** | String | NOT NULL | \- | \- | The name of the schedule this bell timing belongs to (e.g., 'Regular', 'Wed'). |
| **C** | **PeriodID** | String | NOT NULL | \- | \- | The name or identifier for the period (e.g., 'HR', '1', '2-11'). |
| **D** | **TimeRange** | String | NOT NULL | \- | \- | Start and stop time combined (Format: "HH:mm-HH:mm"). 'HH' must have a leading 0\. Obtained from the Gemini Bell Schedule Tabulator. |
| **E** | **StartTime** | Time (HH:mm) | NOT NULL | \- | \={"StartTime";ARRAYFORMULA(IF(ISBLANK(D2:D),,TEXT(LEFT(D2:D,5),"HH:mm")))} | Human-readable start time extracted from the TimeRange column. |
| **F** | **EndTime** | Time (HH:mm) | NOT NULL | \- | \={"EndTime";ARRAYFORMULA(IF(ISBLANK(D2:D),,TEXT(RIGHT(D2:D,5),"HH:mm")))} | Human-readable end time extracted from the TimeRange column. |
| **G** | **Duration** | String | NOT NULL | \- | \={"Duration";ARRAYFORMULA(IF(ISBLANK(D2:D),,LEFT(TEXT(F2:F-E2:E,"HH:mm")\*1440,2)&" min"))} | Human-readable duration calculated by subtracting StartTime from EndTime. |
| **H** | **Notes** | String | NULLABLE | \- | \- | Special notes about a specific time slot, such as "Assembly" or "Lunch Break". |

## **6.7 Table: TeacherTimeTables** {#6.7-table:-teachertimetables}

This table contains the complete, detailed master schedule for every teacher. It connects users to the subjects they teach and the specific periods and rooms they are assigned to for each of the A-E day types. Its main purpose is to serve as a validation source; the system checks against this table to confirm a teacher has a class scheduled before allowing them to book a lab for that time slot. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **TeachingBlockID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"TeachingBlockID";ARRAYFORMULA(IF(ISBLANK(C2:C),,"TBID\_"\&TEXT(ROW(C2:C)-1,"000")))} | A unique key for reliable lookups. Generates based on row index. |
| **B** | **UserID** | String | NOT NULL | FOREIGN KEY (Users.UserID) | \={"UserID";ARRAYFORMULA(IF(ISBLANK(C2:C),,XLOOKUP(C2:C,Users\!F:F,Users\!A:A,,0)))} | The unique ID of the teacher, auto-fetched based on the Teacher's nickname in Col C. |
| **C** | **Teacher** | String | NOT NULL | \- | \- | User’s nickname (Manual input). Acts as the trigger for the row's auto-generation. |
| **D** | **DayType** | Enum | NOT NULL | 'A', 'B', 'C', 'D', 'E' | \- | The day type from the Calendar sheet. |
| **E** | **Period** | Enum | NULLABLE | 'HR', '1'-8' | \- | The period number from the Bell schedule. |
| **F** | **Subject** | String | NULLABLE | \- | \- | The short name/code of the subject taught in that block. Manual input. |
| **G** | **Room** | String | NULLABLE | \- | \- | A human-readable display of the assigned classroom. |
| **H** | **Section** | String | NULLABLE | \- | \- | The specific section of the class (e.g., '1001'). |
| **I** | **SubjectID** | String | NULLABLE | FOREIGN KEY (Subjects.SubjectID) | \={"SubjectID";ARRAYFORMULA(IF(ISBLANK(F2:F),,XLOOKUP(F2:F,Subjects\!B:B,Subjects\!A:A)))} | Auto-fetches the SubjectID by looking up the value from Col F in the Subjects sheet. |
| **J** | **CourseFullName** | String | NULLABLE | \- | \={"CourseFullName","Grade";ARRAYFORMULA(IF(ISBLANK(I2:I),,VLOOKUP(I2:I,Subjects\!A:E,{3,4},FALSE)))} | Auto-populated via VLOOKUP. Displays the full official name of the subject. (See Note below). |
| **K** | **Grade** | Enum | NULLABLE | '10', '11', '12', 'All' | *(Populated by the formula in Column J)* | The grade level. **Crucial for the P2 Split logic.** |
| **L** | **UserRole** | Enum | NOT NULL | FOREIGN KEY (Users.Role) | \={"UserRole";ARRAYFORMULA(IF(ISBLANK(C2:C),,XLOOKUP(C2:C,Users\!F:F,Users\!G:G,,0)))} | Auto-fetches the role ('Teacher', 'LabTech', 'TA') to help filter data for the Duties sheet. |

## **6.8 Table: Duties** {#6.8-table:-duties}

This table holds the master schedule for all fixed, non-lab duties assigned to technicians and TAs. Its primary function is to serve as a block-out list. The booking system will check against this table to determine if any technicians are available to support a lab session during a requested time slot. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **DutyID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"DutyID";ARRAYFORMULA(IF(ISBLANK(C2:C),,"Duty\_"\&TEXT(ROW(C2:C)-1,"000")))} | Unique identifier for each duty record. Generated automatically based on row index. |
| **B** | **TeachingBlockID** | String | NOT NULL | FOREIGN KEY (TeacherTimeTables) | \=QUERY(TeacherTimeTables\!A:L,"SELECT A, B, C, D, E, F WHERE (L \= 'LabTech' OR L \= 'TA') AND F IS NOT NULL ORDER BY B ASC", 1\) | Auto-populates columns B through G. Pulls the master ID for the assigned block. |
| **C** | **UserID** | String | NOT NULL | FOREIGN KEY (TeacherTimeTables) | *(Populated by Query in Col B)* | The ID of the technician this duty belongs to. |
| **D** | **Teacher** | String | NOT NULL | \- | *(Populated by Query in Col B)* | Human-readable nickname of the TALT or TA. |
| **E** | **DayType** | Enum | NOT NULL | 'A', 'B', 'C', 'D', 'E' | *(Populated by Query in Col B)* | The day type from the A-E schedule this duty applies to. |
| **F** | **Period** | Enum | NOT NULL | 'HR', '1'-'8' | *(Populated by Query in Col B)* | The specific period during which the duty occurs. |
| **G** | **Subject** | String | NOT NULL | \- | *(Populated by Query in Col B)* | The specific assigned duty code (e.g., 'LD 4A', 'Study Hall'). |
| **H** | **DutyDescription** | String | NOT NULL | \- | \={"DutyDescription";ARRAYFORMULA(IF(ISBLANK(B2:B),,SWITCH(LEFT(G2:G,2),"LD","Lunch Duty","St","Study Hall","Fo","Food Class", G2:G)))} | A human-readable description of the duty based on the prefix of the Subject. |

## **6.9 Table: Outages** {#6.9-table:-outages}

This table tracks scheduled maintenance, repairs, or other periods when a specific lab room is temporarily unavailable for use. The backend system checks this table during the validation phase to prevent teachers from booking a lab that is actively out of service. It supports both full-day closures and partial-day (period-specific) outages. 

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **OutageID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"OutageID";ARRAYFORMULA(IF(ISBLANK(B2:B),,"Outage\_"\&TEXT(ROW(B2:B)-1,"000")))} | Unique identifier for each outage record. Generated automatically based on row index. |
| **B** | **LabID** | String | NOT NULL | FOREIGN KEY (Labs.LabID) | \- | The ID of the lab (Manual input/dropdown). |
| **C** | **LabName** | String | NOT NULL | \- | \={"LabName";ARRAYFORMULA(IF(ISBLANK(B2:B),,XLOOKUP(B2:B,Labs\!A:A,Labs\!B:B,,0)))} | Human-readable name auto-pulled from the Labs sheet. |
| **D** | **StartDate** | Date | NOT NULL | \- | \- | The first date the lab becomes unavailable. |
| **E** | **EndDate** | Date | NOT NULL | \- | \- | The final date of the outage. |
| **F** | **AllDay** | Boolean | NOT NULL | TRUE / FALSE | \- | TRUE blocks the whole day. FALSE means it's only a partial-day outage. |
| **G** | **StartPeriod** | Enum | NULLABLE | 'HR', '1'-'8' | \- | If AllDay is FALSE, the period the outage begins. |
| **H** | **EndPeriod** | Enum | NULLABLE | 'HR', '1'-'8' | \- | If AllDay is FALSE, the period the outage ends. |
| **I** | **Reason** | String | NULLABLE | \- | \- | Explanation for the closure (e.g., "Plumbing", "Inventory"). |
| **J** | **Status** | Enum | NOT NULL | 'Active', 'Resolved' | \- | Defaults to 'Active'. Changed to 'Resolved' to open the lab early without deleting historical data. |

## **6.10 Table: Transactions** {#6.10-table:-transactions}

This is the core operational table of the application. It tracks the entire lifecycle of a booking from the initial request to its final state (Booked, Denied, or Cancelled).  

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **BookingID** | String | NOT NULL | UNIQUE (PRIMARY KEY) | \={"BookingID";ARRAYFORMULA(IF(ISBLANK(E2:E),,"bk\_"\&TEXT(ROW(E2:E)-1,"000")))}  | A unique identifier (e.g., bk\_001) generated automatically based on row index. |
| **B** | **BatchID** | String | NULLABLE | \- | \- | A shared identifier (e.g., BATCH-A7B3) generated by the API (`submitMultiSectionRequest`) to link all bookings in a batch. Null for single bookings. |
| **C** | **SubmittedByUserID** | String | NOT NULL | FOREIGN KEY (Users.UserID) | \- | UserID of the person who clicked "Submit" in the app (could be TALT in Proxy Mode). |
| **D** | **User** | String | NOT NULL | FOREIGN KEY (Users.Nick) | \={"User";ARRAYFORMULA(IFNA(XLOOKUP(C2:C,Users\!A:A,Users\!F:F)))} | Human-readable nickname of the user who created the transaction. |
| **E** | **BookingForUserID** | String | NOT NULL | FOREIGN KEY (Users.UserID) | \- | The ID of the teacher for this entry’s reservation, linking back to the Users table. |
| **F** | **Teacher** | String | NOT NULL | FOREIGN KEY (Users.Nick) | \={"Teacher";ARRAYFORMULA(IFNA(XLOOKUP(E2:E,Users\!A:A,Users\!F:F)))}  | Subject teacher for that entry’s reservation (the "Target User"). |
| **G** | **Subject** | String | NOT NULL | \- | \- | The name of the subject (e.g., Gen Chem 1107\) selected from the teacher's schedule. |
| **H** | **LabID** | String | NULLABLE | FOREIGN KEY (Labs.LabID) | \- | The ID of the lab room assigned by the TALT. |
| **I** | **LabName** | String | NULLABLE | FOREIGN KEY (Labs.Name) | \={"LabName";ARRAYFORMULA(IFNA(XLOOKUP(H2:H,Labs\!A:A,Labs\!B:B)))}  | Human-readable name for lab room assigned by the TALT during approval. |
| **J** | **Date** | Date | NOT NULL | FOREIGN KEY (Cal.Date) | \- | The specific date of the booking (Format: MMM DD/YY). Link to the Calendar table to determine the day type |
| **K** | **Period** | Enum | NOT NULL | HR and 1-8 | \- | The specified period of the requested booking. |
| **L** | **Section** | String | NOT NULL | \- | \- | Lookup section from TeacherTimeTable which DayType and Period matches. Same as showed at the selection screen. |
| **M** | **DayType** | Enum | NOT NULL | A, B, C, D, E | \={"DayType";ARRAYFORMULA(IF(ISBLANK(E2:E),,VLOOKUP(J2:J,Calendar\!A:F,2,FALSE)))} | Lookup DayType of the input ‘Date’ from ‘Calendar’ sheet. |
| **N** | **BellType** | String | NOT NULL | \- | \={"BellType";ARRAYFORMULA(IF(ISBLANK(E2:E),,VLOOKUP(J2:J,Calendar\!A:F,6,FALSE)))} | Lookup BellType of the input ‘Date’ from ‘Calendar’ sheet. |
| **O** | **TimeSlotID** | String | NOT NULL | \- | \={"TimeSlotID";arrayformula(if(isblank(E2:E),,"TS\_P"\&TRIM(K2:K)&"\_"\&TRIM(N2:N)))} | Specific time slot for the booking, linking to the Bell table to get start/end times. |
| **P** | **LabTitle** | String | NOT NULL | \- | \- | The teacher-provided name or purpose for the lab session. |
| **Q** | **Status** | Enum | NOT NULL | *See Note 1* | \- | The current stage in the approval workflow. (See Note 1 for exact status strings).  |
| **R** | **BookingTimeStamp** | DateTime | NOT NULL | \- | \- | The exact date and time of submission (Format: MMM DD/YYYY HH:mm). |
| **S** | **ConfirmUserID** | String | NULLABLE | FOREIGN KEY (Users.UserID) | \- | UserID of the user who processed (Approved/Denied) this entry. |
| **T** | **ConfirmedBy** | EnumList | NULLABLE | FOREIGN KEY (Users.Nick) | \={"ConfirmedBy";ARRAYFORMULA(IFNA(XLOOKUP(S2:S,Users\!A:A,Users\!F:F)))}  | The nickname of the TALT who approved, denied, or modified the request. |
| **U** | **AssignedTaltID** | EnumList | NULLABLE | FOREIGN KEY (Users.UserID) | \- | IDs of TALTs assigned to support the lab. Can be left blank. Multiple selection allowed. The API must persist both AssignedTaltID and AssignedTaltName at the moment of approval to ensure historical readability even if a user's nickname is changed later.  |
| **V** | **AssignedTaltName** | EnumList | NULLABLE | FOREIGN KEY (Users.Nick) | \- | Written by API. Human-readable nickname(s) of assigned TALTs. For multiple TALTs, the API provides a comma-separated list (e.g., Mek, Kris).  The API must persist both AssignedTaltID and AssignedTaltName at the moment of approval to ensure historical readability even if a user's nickname is changed later.  |
| **W** | **Remark** | String | NULLABLE | \- | \- | Notes for the lab or justification for denial. |
| **X** | **GCalEventID** | String | NULLABLE | \- | \- | Stores the Google Calendar event ID to allow for future modifications/cancellations. |
| **Y** | **LinkedBookingID** | String | NULLABLE | FOREIGN KEY (Trans.ID) | \- | For postponed bookings, stores the ID of the original record. |

***Note 1*** **(Status Enums):** `Await Confirmation`, `Booked`, `Denied`, `Cancelled by User`, `Cancelled (Admin)`, `Postponed`.

## **6.11 Table: Config** {#6.11-table:-config}

This table stores environment configurations, operational thresholds, and dynamic email copy using a flat Key-Value structure. This layout eliminates code changes during environment promotion or template updates.

\* \*\*Data Validation:\*\* The \`Config\_Key\` must be unique and capitalized.

| Col | Column Name | Data Type | Nullability | Constraints | Attached Formula (Header Row) | Description |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **A** | **Category** | String | NOT NULL | Must be one of: `Environment`, `System`, `Email_Subject`, `Email_Body`. Dropdown validation enforced.  | \- | Groups settings (Environment, System, Email\_Subject, Email\_Body) |
| **B** | **Config\_Key** | String | NOT NULL | **Primary Key.** Unique, alphanumeric, uppercase, no spaces (use underscores).  | \- | \*\*Primary Key.\*\* Unique string identifier used by Apps Script lookup engines.  |
| **C** | **Config\_Value** | String |  | The active payload value. Supports multiline blocks (`\n`) for email text templates.  | \- | The actual setting or text template block. Supports newline \`\\n\` characters. |  |
| **D** | **Description** | String | NULLABLE  | Plain-text description detailing what this variable impacts in the engine.  | \- | Explanatory note detailing what the configuration controls.  |
| **E** | **Placeholders** | String | NULLABLE  | Comma-separated list of tokens allowed inside the `Config_Value`. Read by UI editor  | \- | Comma-separated list of dynamic tokens allowed within the text.  |

## **6.12 Database Integrity Rules** {#6.12-database-integrity-rules}

To prevent system-wide failure caused by manual data entry errors:

* **Column A "Hard-Lock":** Column A in every sheet (containing Primary Keys/IDs) must be protected using **Google Sheets Range Protection**.  
* **Access Restriction:** Permissions must be set so that "Only the Owner/Lead Developer" can edit these ranges. Even administrative users (TALTs/HoDs) must be restricted from typing into Column A to protect the `UUID` links that power the booking logic.  
* **Data Validation:** Where IDs are used as Foreign Keys (e.g., `labId` in the `Transactions` sheet), Data Validation (Dropdowns) must be used to ensure only valid IDs from the source tables can be selected.

# **7\. API Specification** {#7.-api-specification}

This section defines the Application Programming Interface (API) that connects the web application frontend to the Google Apps Script backend. This API acts as a formal contract, detailing every function the frontend can call, what data it must provide, and what data it can expect in return.

All data is transferred in **JSON (JavaScript Object Notation)** format. The frontend calls these backend functions using the `google.script.run` client-side API.

**Crucial Standards:**

* **Response Envelope Format (gas-best-practices standard):** Every server function returns a `Result<T>` envelope `{ "ok": true, ... }` on success, and `{ "ok": false, "message": "..." }` on error. Never throw raw unhandled exceptions across `google.script.run` boundaries.
* **Concurrency:** All API endpoints defined below must adhere to the Concurrency and Data Integrity standards outlined in **Section 7.24**. This ensures that simultaneous user actions do not lead to data corruption or inconsistent states within the Google Sheet.  
* **Race Conditions:** All 'Write' operations (**Functions 7.13 through 7.23**) MUST implement the Google Apps Script `LockService` as defined in Section 7.24 to prevent race conditions during data entry and status updates.

---

### **Function List** {#function-list}

**Category 1: Data Retrieval Functions (READ)**  
7.1 `getUserInfo`: Profile, Role, Nickname, and PrimaryGrade.  
7.2 `getCalendarData`: Term dates and Bell timings (including split P2 logic).  
7.3 `getWeeklySchedule`: The "Heart" of the calendar view.  
7.4 `getBookingDetails`: For the "View/Edit" modal.  
7.5 `getTeacherList`: All users with 'Teacher' role (for Proxy Mode).  
7.6 `getLabList`: All physical labs (for TALT assignment/Outages).  
7.7 `getSubjectList`: Full master list of subjects.  
7.8 `getSubjectsByTeacher`: Filtered subjects for specific teacher selection.  
7.9 `getLabOutages`: Current list of blocked labs.  
7.10 `getAvailableTALTsForBooking`: Check technician slot availability.  
7.11 `getLabAssignmentContext`: Real-time "Who is in which lab?" data for TALTs.  
7.12 `getTaltWorkloadReport`: Detailed breakdown of a TALT's current day workload.  
7.13 `searchTeachers`: Searches and returns a list of teachers matching a name or email string (used for TALT Proxy Mode).

**Category 2: Action Functions (WRITE)**  
7.14 `submitBookingRequest`: Standard teacher reservation.  
7.15 `submitMultiSectionRequest`: Selection Cart processing.  
7.16 `createLabSupportBooking`: TALT manual entry/Proxy reservation.  
7.17 `approveBooking`: Critical: Assigns LabID \+ TaltID \+ optional BypassReason.  
7.18 `declineBooking`: Rejection with reason.  
7.19 `cancelBooking`: General cancellation (Teacher/TALT/HoD).  
7.20 `postponeBooking`: Moves a status to 'Postponed'.  
7.21 `createLabOutage`: Adds maintenance block.  
7.22 `updateOutageStatus`: Toggles 'Active' vs 'Resolved'.  
7.23 `deleteLabOutage`: Hard removal of an outage record.  
7.24 `completeTutorial`: Sets `hasCompletedTutorial` to TRUE.  
7.25 `bulkApproveBatch`: Confirms multiple batch bookings and assigns TALTs in one transaction.   
7.26 `bulkDeclineBatch`: Rejects multiple batch bookings with a shared reason and one notification.  
7.27 `updateConfirmedBooking` :Modifies Lab/TALT assignments for confirmed bookings (Internal only).

**Category 3: System Infrastructure**  
7.28 `Concurrency & Data Integrity`: The LockService specification.

---

#### **7.1 Function: `getUserInfo`** {#7.1-function:-getuserinfo}

**Description:** Retrieves the essential profile details, role permissions, and settings for the currently logged-in user. This is the first function called after a successful login. It initializes the frontend state, dictates role-based UI rendering (Teacher vs. TALT views), determines if the onboarding tutorial should trigger, and fetches the `PrimaryGrade` used as a fallback for Period 2 split-bell calculations. 

**Request from Frontend:**  
*(Note: In Google Apps Script, it is more secure to use* `Session.getActiveUser().getEmail()` *on the backend rather than trusting a frontend payload. However, for testing or explicit passing, the payload is defined below).*

```json
{
  "userEmail": "teacher.ten@mahidol.ac.th"
}
```

**Backend Logic:**

1. **Validate:** Ensure `userEmail` is a valid string and ends with `@mahidol.ac.th`.

2. **Query:** Look up the `userEmail` in the **Users** sheet (Table 6.2, Column E).  
3. **Handle Not Found:** If the email is not in the database, return a `false` success state to trigger the frontend "Access Denied" screen.  
4. **Extract & Format Data:** \* Fetch `UserID` (Col A), `FirstName` (Col C), `LastName` (Col D), `Nickname` (Col F), `Role` (Col G), `isHoD` (Col H), `PrimaryGrade` (Col K), and `hasCompletedTutorial` (Col J).  
   1. Fetch the `Subjects` string (Col I). Split this comma-separated string into a clean JSON array (e.g., `["subject_03", "subject_10"]`). If the column is blank (like for most TALTs), return an empty array `[]`.  
5. **Return:** Assemble and return the final user object.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "user": {
    "userId": "user_05",
    "email": "teacher.ten@mahidol.ac.th",
    "firstName": "Tenzin",
    "lastName": "Gyatso",
    "nickname": "Ten",
    "role": "Teacher",
    "isHoD": false,
    "primaryGrade": "11",
    "hasCompletedTutorial": false,
    "subjects": [
      "subject_03",
      "subject_10"
    ]
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Access Denied: User 'teacher.ten@mahidol.ac.th' is not registered in the system."
}
```

#### **7.2 Function: `getCalendarData`** {#7.2-function:-getcalendardata}

**Description:** Retrieves the static framework for the week, including the day types (e.g., Holiday, Normal), bell schedules, and exact start/end times for periods. This function resolves the **Feature 4.2.8** Period 2 split-break logic on the backend by checking the relevant user's `PrimaryGrade`, ensuring the frontend doesn't have to guess the correct timings.  

**Request from Frontend:**

* *(Standard Request (Teacher/TALT viewing their own default calendar):* 

```json
{
  "loggedInUserId": "user_05", 
  "weekStartDate": "2025-10-27"
}
```

* *Proxy Request (TALT viewing the calendar framework for a specific teacher):* 

```json
{
  "loggedInUserId": "user_02", 
  "targetUserId": "user_05",   
  "weekStartDate": "2025-10-27"
}
```

**Backend Logic:**

1. **Determine Context User:** If `targetUserId` is provided, verify `loggedInUserId` has the 'LabTech' or 'HoD' role. If authorized, set the context user to `targetUserId`. Otherwise, set the context user to `loggedInUserId`.  
2. **User Lookup:** Find the context user's `PrimaryGrade` from the Users sheet (Table 6.2).  
3. **Calendar Query:** Fetch the 5 days (Monday-Friday) starting from `weekStartDate` in the Calendar table (Table 6.5) to check for Holidays, `DayType` (e.g., A, B), and the `BellType` (e.g., Regular, HalfDay).  
4. **Bell Timings:** Fetch the standard times from the Bell table (Table 6.6).  
5. **P2 Resolution:** For Period 2, if the context user's `PrimaryGrade` is '11', return the G11 start/end times. If '10' or '12', return the G10/12 times.  
6. **Assemble:** Return the structure of the week.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "weekData": [
    {
      "date": "2025-10-27",
      "dayOfWeek": "Monday",
      "dayType": "A",
      "bellType": "Regular",
      "periods": [
        { "period": "HR", "startTime": "07:30", "endTime": "07:45" },
        { "period": "1", "startTime": "07:50", "endTime": "08:45" },
        { "period": "2", "startTime": "08:50", "endTime": "09:45" } 
        // Note: Period 2 times are dynamically resolved based on the PrimaryGrade
        // ... periods 3-8
      ]
    }
    // ... Tuesday - Friday
  ]
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Could not load calendar framework. The database may be unreachable or the weekStartDate is invalid."
}
```

*If a Teacher tries to use Proxy Mode without permission:* 

```json
{
  "ok": false, "success": false,
  "error": "Authorization failed. You do not have permission to view the schedule framework for another user."
}
```

#### **7.3 Function: `getWeeklySchedule`** {#7.3-function:-getweeklyschedule}

**Description:** The core data-fetching function for the calendar view. It fetches the detailed teaching timetable for a specified week and overlays all active transactions, lab outages, and TALT availability.

* **Primary Use (Teachers):** Allows subject teachers to view their own teaching blocks and see the booking status (Pending/Confirmed/Available) for those specific blocks.   
* **Secondary Use (TALTs/Proxy Mode):** Allows a TALT to view the "Master Dashboard" (all labs) or look up a specific teacher's schedule to verify class times and make proxy bookings.

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_15", 
  "targetUserId": "user_15", // Optional. If omitted, defaults to loggedInUserId
  "weekStartDate": "2025-10-27"
}
```

**Backend Logic:**

1. **Determine Target & Authorize:** If `targetUserId` is provided and differs from `loggedInUserId`, verify that `loggedInUserId` has the role of 'LabTech' or 'HoD'. If not, deny the request. Set `contextUser` \= `targetUserId` (or `loggedInUserId` if none provided).  
2. **Fetch Calendar Framework:** Query the Calendar sheet (Table 6.5) for the 5 weekdays. Identify the `DayType` (e.g., A, B, C). Dates without a `DayType` are flagged as non-school days.  
3. **Fetch Master Data:** Query Transactions (Table 6.10), Outages (Table 6.9), and Duties (Table 6.8) for the specified date range.  
4. **Check for Conflict Flags:** The system reads the "Status" column from the Transactions table. If a row is marked as **"Action Required"** (flagged by the **7.3.1 Re-validation Engine**), the UI will prioritize this warning.  
5. **Fetch Timetable:** Query the TeacherTimeTables (Table 6.7) for rows matching the `contextUser's` ID and the identified `DayTypes`.  
6. **Build Slot Matrix:** Construct a JSON object keyed by date. For each valid school date, iterate through all physical labs and periods to create slot objects.  
7. **Apply Status Hierarchy (Crucial Logic per Slot):**  
   *  If `DayType` is Holiday/Weekend \-\> Status: **`Unavailable`**  
   * Else If an Outage exists for this Lab/Date \-\> Status: **`Outage`**  
   * Else If a Transaction exists for this context:  
     1. If Status \== 'Action Required' \-\> Status: **`Conflict/Action Required`**  
     2. If Status \== 'Pending' \-\> Status: **`Pending`**  
     3. If Status \== 'Confirmed' \-\> Status: **`Booked`**  
   * Else If Duties show all TALTs are maxed out \-\> Status: **`No Technicians Available`**  
   * Else \-\> Status: **`Available`**

#### **7.3.1 Function: `triggerManualRevalidation` (Admin/TALT Only)** {#7.3.1-function:-triggermanualrevalidation-(admin/talt-only)}

**Description:** A standalone maintenance function designed to ensure data integrity after a manual update to the Master Schedule.

**Logic:** 1\. Iterates through all "Confirmed" bookings in the Transactions sheet for all future dates. 2\. **Validation Engine:** For every booking, it cross-references the current Master Schedule (TeacherTimeTables 6.8) to verify that the Teacher, Subject, Section, and Grade still align with that Date/Period. 3\. **Outcome:** \* If a discrepancy is found (e.g., a teacher's class was moved to a different period in the master sheet), the booking status in the Transactions sheet, Table 6.10, is updated to **"Action Required."** \* An automated notification is sent to the assigned TALT and the Teacher, prompting them to reschedule or modify the lab.

**Response to Frontend (Success):**  
*(Note: The data is grouped by Date. The frontend will filter this array based on the user's role. Teachers will filter to show only slots where* `isContextUserTeaching == true`*)* 

```json
{
  "ok": true, "success": true,
  "schedule": {
    "2025-10-27": [ 
      {
        "period": "1",
        "labId": "lab_01",
        "labName": "Biology Lab 1",
        "isContextUserTeaching": true,
        "timetableDetails": {
           "subject": "subject_03",
           "section": "1001",
           "regularRoom": "215"
        },
        "availabilityStatus": "Available",
        "bookingDetails": null,
        "outageDetails": null
      },
      {
        "period": "1",
        "labId": "lab_05",
        "labName": "Physics Lab 1",
        "isContextUserTeaching": false,
        "timetableDetails": null,
        "availabilityStatus": "Action Required", // Flagged by Re-validation
        "bookingDetails": {
           "bookingId": "TR_0045",
           "status": "Action Required",
           "labTitle": "Kinematics Prep",
           "bookedBy": "user_12", 
           "assignedTaltId": "user_02",
           "conflictNote": "Schedule Mismatch: Teacher no longer teaches this section at P1."
        },
        "outageDetails": null
      }
    ]
  }
}
```

**Response to Frontend (Error, Authorization Error ):**

```json
{
  "ok": false, "success": false,
  "error": "AAuthorization failed: You do not have Proxy permissions to view another teacher's schedule."
}
```

*(If User Not Found):* 

```json
{
  "ok": false, "success": false,
  "error": "TTarget user with the specified ID was not found in the database."
}
```

#### **7.4 Function: `getBookingDetails`** {#7.4-function:-getbookingdetails}

**Description:** Retrieves all detailed metadata for a single booking transaction. This function is triggered when a user clicks on a specific booking slot in the calendar to view its details in a pop-up modal. It provides the full context needed for TALTs to approve/edit or for teachers to view the status of their request. 

7.4.1 **"No Assignment" Hard Lockout Guardrail:** The system must actively scan the `TeacherTimeTables` matrix for the logged-in user. If the user is not officially scheduled to teach during a requested period/day-type combination, the UI must:

1. Lock out the cell completely.  
2. Strip the interactive "Select Slot" booking trigger.  
3. Apply a disabled, grayed-out "No Assignment" status visual.

**Request from Frontend:**

```json
{
  "bookingId": "TR_0045"
}
```

**Backend Logic:**

1. **Validate:** Check that `bookingId` is a valid, non-empty string.  
2. **Query:** Find the row in the **Transactions** sheet (Table 6.10) where Column A matches the `bookingId`.  
3. **Handle Not Found:** If the ID does not exist, return an error.  
4. **Extract Data:** Read the entire row to retrieve all relevant fields. Because the Transactions sheet automatically populates human-readable columns via formulas, the API simply maps these cells to a JSON object:  
* Requestor info: ID and Name  
* Schedule info: Date, Period, Subject ID, and Subject Name  
* Content info: Lab Title, Teacher Remark  
* Assignment info: Lab ID, Lab Name, Assigned TALT ID, Assigned TALT Name (Cols U and V)  
* Status info: Status ('Pending', 'Confirmed', etc.), Technician Remark, Bypass Reason (if applicable).  
5. **Assemble & Return:** Return the structured booking object.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "details": {
    "bookingId": "TR_0045",
    "status": "Confirmed",
    "timestamp": "2025-10-20T08:30:00Z",
    "requestorId": "user_12",
    "requestorName": "Leyla",
    "date": "2025-10-28",
    "period": "3",
    "subjectId": "subject_04",
    "subjectName": "AP Bio",
    "labTitle": "Frog Dissection",
    "Remark": "Need 15 scalpels.",
    "assignedLabId": "lab_02", 
    "assignedLabName": "Biology Lab 2",
    "assignedTaltId": "user_02",
    "assignedTaltName": "Kris"
  }
}
```

*(Note: If the `status` is "Pending", the `assignedLabId`, `assignedLabName`, `assignedTaltId`, and `assignedTaltName` will be `null` or empty strings, as the TALT has not yet approved the room).* 

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Booking 'TR_0045' was not found. It may have been deleted."
}
```

#### **7.5 Function: `getTeacherList`** {#7.5-function:-getteacherlist}

**Description:** Retrieves a lightweight list of all active users designated with the 'Teacher' role. This is primarily used by the frontend to populate the "Select Teacher" dropdown menu in the TALT interface when they are using Proxy Mode to book on behalf of someone else. 

**Request from Frontend:**

```json
{}
```

*(No parameters are needed, though the backend should still verify the requester's active session token implicitly via Google Apps Script).* 

**Backend Logic:**

1. **Query:** Fetch all records from the **Users** sheet (Table 6.2).  
2. **Filter:** Keep only the rows where `Role` (Col G) is exactly 'Teacher' (case-insensitive).  
3. **Format Data:** For each matching row, extract the `UserID` (Col A), `Nickname` (Col F), `FirstName` (Col C), `LastName` (Col D), and `Email` (Col E).  
4. **Sort:** Sort the resulting array alphabetically by `Nickname` to ensure a user-friendly dropdown experience.  
5. **Assemble & Return:** Return the structured array.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "teachers": [
    { 
      "userId": "user_15", 
      "nickname": "Bala",
      "firstName": "Balachander",
      "lastName": "Nagaraj",
      "email": "teacher.bala@mahidol.ac.th"
    },
    { 
      "userId": "user_12", 
      "nickname": "Leyla",
      "firstName": "Leyla",
      "lastName": "Down",
      "email": "teacher.leyla@mahidol.ac.th"
    },
    { 
      "userId": "user_05", 
      "nickname": "Ten",
      "firstName": "Tenzin",
      "lastName": "Raban",
      "email": "teacher.ten@mahidol.ac.th"
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not retrieve the teacher list. The Users database may be unavailable." 
}
```

#### **7.6 Function: getLabList** {#7.6-function:-getlablist}

**Description:** Retrieves the master list of all physical laboratory rooms in the school. This function is essential for populating dropdown menus in two key TALT-facing workflows:

1. **Approval Workflow:** When a TALT uses `approveBooking`, they must select a physical room from this list to assign to the teacher's request.  
2. **Outage Management:** When an admin or TALT uses `createLabOutage`, they must select which specific lab is being blocked off for maintenance.

**Request from Frontend:**

```json
{}
```

*(No parameters are required as this fetches a static master list).* 

**Backend Logic:**

1. **Query:** Fetch all records from the **Labs** sheet (Table 6.4).  
2. **Format Data:** For each row, extract the `LabID` (Col A) and `LabName` (Col B). *Optional but recommended:* Also extract `SubjectTags` (Col C \- e.g., Biology, Chemistry, General) as this helps the frontend group or filter the dropdowns to make the TALT's job easier.  
3. **Sort:** Sort the array alphabetically by `LabName` (or numerically by room number).  
4. **Assemble & Return:** Return the structured array of lab objects.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "labs": [
    { 
      "labId": "lab_01", 
      "labName": "Biology Lab 1",
      "subjectTags": "Gen.Bio, Food Sci, AP Bio, Gen. Chem, Anatomy"
    },
    { 
      "labId": "lab_02", 
      "labName": "Biology Lab 2",
      "subjectTags": "Gen.Bio, AP Bio, Gen. Chem, Anatomy"
    },
    { 
      "labId": "lab_05", 
      "labName": "Physics Lab 1",
      "subjectTags": "Gen.Physics"
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not retrieve the lab list. The Labs database may be unavailable." 
}
```

#### **7.7 Function: `getSubjectList`** {#7.7-function:-getsubjectlist}

**Description:** Retrieves the complete master directory of all subjects taught at the school. While standard teachers only see their own assigned subjects (via `getUserInfo` or `getSubjectsByTeacher`), TALTs and Admins need this full master list when using Proxy Mode to book a special event, an ad-hoc lab session, or when looking up generic "All-Grade" subjects (like Homeroom or Wellbeing). 

**Request from Frontend:**

```json
{}
```

*(No parameters are required as this fetches a static master list).* 

**Backend Logic:**

1. **Query:** Fetch all records from the **Subjects** sheet (Table 6.3).  
2. **Format Data:** For each row, extract the `SubjectID` (Col A), `SubjectCode` (Col B \- the short name), `CourseFullName` (Col C \- the newly added official title), and `Grade` (Col D).  
3. **Sort:** Sort the resulting array logically—first by `Grade` (e.g., 10, 11, 12, All), and then alphabetically by `SubjectCode`.  
4. **Assemble & Return:** Return the structured array of subject objects.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "subjects": [
    { 
      "subjectId": "subject_03", 
      "subject": "Gen.Bio",
      "courseFullName": "General Biology 10",
      "grade": "10",
      "subjectCategory": "Core" 
    },
    { 
      "subjectId": "subject_04", 
      "subject": "AP Bio",
      "courseFullName": "AP Biology",
      "grade": "11",
      "subjectCategory": "Elective" 
    },
    { 
      "subjectId": "subject_99", 
      "subject": "Homeroom",
      "courseFullName": "Homeroom",
      "grade": "All",
      "subjectCategory": "Core" 
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not retrieve the subject directory. The Subjects database may be unavailable." 
}
```

#### **7.8 Function: `getSubjectsByTeacher`** {#7.8-function:-getsubjectsbyteacher}

**Description:** Retrieves a tailored list of subjects that a specific teacher is assigned to teach. This function is used to populate the "Select Subject" dropdown on the Booking Form (for teachers) or in Proxy Mode (for TALTs). By filtering the master list to only show relevant subjects, it prevents users from accidentally booking a lab for a class they do not teach. 

**Request from Frontend:**

```json
{
  "teacherId": "user_12",
  "teacherName": "Leyla" 
}
```

*(Note: The frontend passes the `teacherName` specifically so the backend can generate a human-readable error if the database lookup fails).*

**Backend Logic:**

1. **Validate Input:** Ensure `teacherId` is a valid string.  
2. **User Lookup:** Query the **Users** sheet (Table 6.2) for the `teacherId`.  
3. **Handle Not Found:** If the ID is not found, return an error utilizing the `teacherName` provided in the request payload.  
4. **Extract & Parse Subjects:** Extract the `Subjects` string (Column I). Split the comma-separated string into an array. If the user has no assigned subjects, return an empty array `[]`.  
5. **Subject Lookup:** Query the **Subjects** sheet (Table 6.3). Filter the master list, keeping only the rows where the `SubjectID` matches an ID in the teacher's array.  
6. **Format Data:** Extract `SubjectID` (Col A), `SubjectCode` (Col B), `CourseFullName` (Col C), and `Grade` (Col D).  
7. **Assemble & Return:** Return the filtered array.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "subjects": [
    { 
      "subjectId": "subject_03", 
      "subject": "Gen.Bio",
      "courseFullName": "General Biology",
      "grade": "10",
      "subjectCategory": "Core" 
    },
    { 
      "subjectId": "subject_04", 
      "subject": "AP Bio",
      "courseFullName": "AP Biology",
      "grade": "11",
      "subjectCategory": "Elective" 
    }
  ]
}
```

*(If the user is a TALT with no teaching subjects, it returns: `"subjects": []`)* 

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not retrieve subjects. Teacher 'Leyla' was not found in the database." 
}
```

#### **7.9 Function: `getLabOutages`** {#7.9-function:-getlaboutages}

**Description:** Fetches a list of active and scheduled future lab outages. This is used by the frontend to display the master outage list on the TALT Management Dashboard, allowing them to track, edit, or resolve maintenance blocks. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02" 
}
```

**Backend Logic:**

1. **Authorization Check:** Query the **Users** sheet for `loggedInUserId`. Verify the user has the role of `LabTech`, `TA`, or `isHoD == TRUE`. If not, return a "Permission Denied" error.  
2. **Query:** Fetch all records from the **Outages** sheet (Table 6.9).  
3. **Filter:** Filter the list to return only rows where:  
* The `EndDate` is on or after the current date (ignoring past historical outages to keep the payload light).  
* The `Status` is 'Active' (ignoring outages that have already been marked as 'Resolved' via `updateOutageStatus`).  
4. **Format Data:** Extract `OutageID`, `LabID`, `LabName`, `StartDate`, `EndDate`, `AllDay`, `StartPeriod`, `EndPeriod`, `Reason`, and `Status`.  
5. **Sort:** Sort the array chronologically by `StartDate`.  
6. **Assemble & Return:** Return the structured array.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "outages": [
    {
      "outageId": "outage_001",
      "labId": "lab_01",
      "labName": "Bio1",
      "startDate": "2025-10-20",
      "endDate": "2025-10-22",
      "allDay": true,
      "startPeriod": null,
      "endPeriod": null,
      "reason": "Deep cleaning after chemical spill",
      "status": "Active"
    },
    {
      "outageId": "outage_002",
      "labId": "lab_04",
      "labName": "Chem1",
      "startDate": "2025-10-28",
      "endDate": "2025-10-28",
      "allDay": false,
      "startPeriod": "3",
      "endPeriod": "5",
      "reason": "Fume hood ventilation repair",
      "status": "Active"
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Permission Denied: You do not have the required clearance to view the Outage Management Dashboard." 
}
```

#### **7.10 Function: `getAvailableTALTsForBooking`** {#7.10-function:-getavailabletaltsforbooking}

**Description:** Evaluates all technicians against a specific booking's Date and Period to determine their availability. It runs the "Workload Rules" (Hard Conflicts, 5-period daily limit, 3-period consecutive limit) and returns a comprehensive list of TALTs with their current workload status. This directly supports the TALT Assignment dropdown and the Workload Bypass UI. 

**Request from Frontend:**

```json
{
  "bookingId": "TR_0045"
}
```

**Backend Logic:**

1. **Fetch Target Booking:** Query the **Transactions** sheet (Table 6.10) for the `bookingId` to extract the `Date`, `Period`, and `DayType`.  
2. **Fetch TALT Roster:** Query the **Users** sheet (Table 6.2) for all users where `Role` is 'LabTech' or 'TA'.  
3. **Evaluate Each TALT:** Loop through the roster and query **Transactions** and **Duties** (Table 6.8) for that specific `Date`/`DayType`.  
4. **Apply Workload Logic:**  
* **Rule 1 (Hard Conflict):** Does the TALT already have a Confirmed booking or Fixed Duty in this *exact* Period? If yes \-\> `isAvailable: false`.  
* **Rule 2 (Daily Limit):** Calculate total active periods for this date. Would adding this period push them over 5? If yes \-\> `needsBypass: true`.  
* **Rule 3 (Consecutive Limit):** Check adjacent periods (e.g., if period is 3, check 1, 2, 4, 5). Would adding this period create 3 or more back-to-back working periods? If yes \-\> `needsBypass: true`.  
5. **Assemble & Return:** Return the detailed list.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "taltAvailability": [
    { 
      "taltId": "user_02", 
      "taltName": "Mek", 
      "currentDailyLoad": 2,
      "isAvailable": true,
      "needsBypass": false,
      "conflictReason": null
    },
    { 
      "taltId": "user_06", 
      "taltName": "Mai", 
      "currentDailyLoad": 5,
      "isAvailable": true,
      "needsBypass": true,
      "conflictReason": "Exceeds daily limit (5 periods)"
    },
    { 
      "taltId": "user_16", 
      "taltName": "Win", 
      "currentDailyLoad": 3,
      "isAvailable": false,
      "needsBypass": false,
      "conflictReason": "Hard Conflict: Already assigned to Lunch Duty (LD 6A) this period"
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not evaluate availability. Booking 'TR_0045' was not found." 
}
```

#### **7.11 Function: `getLabAssignmentContext`** {#7.11-function:-getlabassignmentcontext}

**Description:** Fetches the detailed availability and context for physical lab rooms regarding a specific Pending request. By looking at what is happening in the room during the requested period, the period *before*, and the period *after*, this powers the "Assign Lab Room" smart dropdown, allowing the TALT to make the most efficient setup/teardown decisions without clicking back and forth on the calendar. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02", 
  "bookingId": "TR_0045" 
}
```

**Backend Logic:**

1. **Authorization Check:** Verify `loggedInUserId` has the 'LabTech', 'TA', or 'HoD' role.  
2. **Fetch Target Booking:** Query the **Transactions** sheet (Table 6.10) for the `bookingId`. Extract the `Date`, `Period`, and `Subject` (e.g., "Gen.Bio").  
3. **Fetch Labs:** Query the master **Labs** sheet (Table 6.4).  
4. **Evaluate Each Lab:** Loop through every physical lab and build its context:  
* **Suitability Check:** Does the `SubjectTags` column for this lab include the target `Subject`? If yes, `isSuitable: true`.  
* **Current Period Check:** Query **Outages** and **Transactions** for this Lab, Date, and Period. Set `currentPeriodStatus` to 'Available', 'Outage', or 'Booked'.  
* **Adjacent Period Checks:** Query **Transactions** for this Lab/Date at `Period - 1` and `Period + 1`. If a confirmed booking exists, extract its `LabTitle`. If not, return 'Empty'.  
5. **Sort Data:** Sort the array so that `isSuitable: true` labs appear at the top of the list, followed by the others (alphabetically).  
6. **Assemble & Return:** Return the context array.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "labContexts": [
    {
      "labId": "lab_01",
      "labName": "Bio1",
      "isSuitable": true,
      "currentPeriodStatus": "Available",
      "pMinus1Status": "Empty",
      "pPlus1Status": "Booked: Diffusion Lab (Dr.A)"
    },
    {
      "labId": "lab_02",
      "labName": "Bio2",
      "isSuitable": true,
      "currentPeriodStatus": "Available",
      "pMinus1Status": "Booked: Microscope Intro (Bala)",
      "pPlus1Status": "Booked: Microscope Intro (Bala)"
    },
    {
      "labId": "lab_03",
      "labName": "BioPrep",
      "isSuitable": false,
      "currentPeriodStatus": "Available",
      "pMinus1Status": "Empty",
      "pPlus1Status": "Empty"
    },
    {
      "labId": "lab_04",
      "labName": "Chem1",
      "isSuitable": false,
      "currentPeriodStatus": "Booked",
      "pMinus1Status": "Empty",
      "pPlus1Status": "Empty"
    }
  ]
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Cannot retrieve lab context. Booking 'TR_0045' was not found or has already been actioned." 
}
```

#### **7.12 Function: `getTaltWorkloadReport`** {#7.12-function:-gettaltworkloadreport}

**Description:** Retrieves a detailed, chronological breakdown of a specific TALT's workload for a single date. It merges fixed administrative assignments (like Lunch Duty or Study Hall) with dynamic lab booking assignments. This report is displayed in a modal when a user clicks "View Load" next to a TALT's name in the assignment dropdown, helping them decide if a Workload Bypass is justified. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_05", 
  "taltId": "user_02",
  "date": "2025-08-25" 
}
```

**Backend Logic:**

1. **Authorization Check:** Ensure `loggedInUserId` has the right to view this (Teachers booking in standard mode, TALTs in proxy mode, or HoDs). *Note: Unlike peer-to-peer teacher schedules, TALT workloads are generally transparent to any teacher trying to book a lab.*  
2. **Determine DayType:** Query the **Calendar** sheet (Table 6.5) for the requested `date` to find its `DayType` (e.g., 'A', 'B', 'C'). If it's a holiday/weekend, return an empty schedule.  
3. **Fetch Fixed Duties:** Query the **Duties** sheet (Table 6.8). Filter for rows where `UserID == taltId` and `DayType` matches the target date's DayType.  
4. **Fetch Lab Bookings:** Query the **Transactions** sheet (Table 6.10). Filter for rows where `AssignedTaltID == taltId`, `Date` matches the target date, and `Status == 'Confirmed'`.  
5. **Merge & Format:** Combine both datasets into a single array of "work blocks". For duties, map `DutyDescription` as the title. For bookings, map `LabTitle` and `LabName`.  
6. **Calculate Totals:** Count the total number of active periods to provide a quick summary.  
7. **Sort & Return:** Sort the merged array chronologically by `Period`.

**Response to Frontend (Success):**  
*(Example based on August 25, 2025 \- DayType D. Mek has Lunch Duty on P5, plus two hypothetical lab bookings).* 

```json
{
  "ok": true, "success": true,
  "report": {
    "taltId": "user_02",
    "taltName": "Mek",
    "date": "2025-08-25",
    "dayType": "D",
    "totalLoad": 3,
    "breakdown": [
      {
        "period": "2",
        "type": "Lab Booking",
        "title": "Titration Prep",
        "location": "Chem1",
        "referenceId": "TR_0088"
      },
      {
        "period": "3",
        "type": "Lab Booking",
        "title": "Titration Teardown",
        "location": "Chem1",
        "referenceId": "TR_0089"
      },
      {
        "period": "5",
        "type": "Fixed Duty",
        "title": "Lunch Duty (LD 5A)",
        "location": "Cafeteria",
        "referenceId": "Duty_004"
      }
    ]
  }
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Could not generate workload report. TALT or Date data is missing." 
}
```

#### **7.13 Function: `searchTeachers`**  {#7.13-function:-searchteachers}

**Description:** Returns a list of teachers matching a search string. This is primarily used by TALTs in Proxy Mode to quickly find the teacher they are booking on behalf of.

**Request from Frontend:**

```json
{
  "searchTerm": "Ten",
  "loggedInUserId": "user_02"
}
```

**Backend Logic:**

1. **Authorization Check:** Retrieve the user record for `loggedInUserId`. If the role is not 'LabTech', 'TA', or 'HoD', return a permission error.  
2. **Data Retrieval & Filtering:** Access the **Users** sheet and filter for rows where `Role` is 'Teacher'.  
3. **Match Search Term:** Perform a case-insensitive match of the `searchTerm` against the `Name`, `Nickname`, or `Email` columns.  
4. **Output:** Map all matching rows to a clean JSON array containing the essential user details.

**Response to Frontend (Success, Mocking "Tenzin"):**

```json
{
  "ok": true, "success": true,
  "count": 1,
  "teachers": [
    {
      "targetUserId": "user_15",
      "name": "Tenzin Raban",
      "nickname": "Tenzin"
    }
  ]
}
```

**Response to Frontend (Error, No Results):**

```json
{
  "ok": false, "success": false,
  "errorType": "NOT_FOUND",
  "message": "No teacher found matching your search."
}
```

**Response to Frontend (Error, Unauthorized):**

```json
{
  "ok": false, "success": false,
  "errorType": "PERMISSION_DENIED",
  "message": "Only Lab Technicians or TAs can access Proxy Mode."
}
```

#### **7.14 Function: `submitBookingRequest`** {#7.14-function:-submitbookingrequest}

**Description:** Handles the creation of a single new lab booking request. In the V1.1 architecture, this function *always* creates a 'Pending' record, as physical room assignments are deferred to the TALT. It supports both standard teachers booking for themselves and TALTs/HoDs booking on behalf of others (Proxy Mode).

**Request from Frontend:**

* *Standard Request (Teacher Tenzin booking for herself):*

```json
{
  "loggedInUserId": "user_15",
  "targetUserId": "user_15", 
  "subjectId": "subject_03",
  "section": "1101",
  "date": "2025-11-06",
  "period": "3",
  "labTitle": "Wave Experiment",
  "remark": "Need 5 oscilloscopes."
}
```

* *Proxy Request (TALT Mek booking for Tenzin, with lead-time bypass):*

```json
{
  "loggedInUserId": "user_02",  
  "targetUserId": "user_15", 
  "subjectId": "subject_03",
  "section": "1101",
  "date": "2025-11-01", 
  "period": "3",
  "labTitle": "[Urgent] Wave Experiment",
  "remark": "HoD approved late booking.",
  "bypassLeadTimeWarning": true
}
```

**Backend Logic:**

1. **Determine Context & Authorize:** \* `actor` \= `loggedInUserId`. `userToBookFor` \= `targetUserId`.  
* If `actor` \!= `userToBookFor`, verify `actor` has 'LabTech', 'TA', or 'HoD' role. If not, return an authorization error.  
2. **Check 1: 2-Day Advance Rule (Lead Time):**  
* Calculate instructional days between the current date and the requested `date` (referencing the **Calendar** sheet to skip weekends/holidays).  
* If days \< 2:  
  * If `bypassLeadTimeWarning == true` AND `actor` has Proxy permissions, allow it.  
  * Else, return "Request must be made at least 2 instructional days in advance" error.  
3. **Check 2: Teacher Timetable Verification:**  
* Query the **Calendar** sheet to determine the `DayType` for the requested date.  
* Query **TeacherTimeTables** for `userToBookFor` to verify they are actually scheduled to teach `subjectId` / `section` on that `DayType` and `Period`. If no match is found, reject the request.  
4. **Check 3: Duplicate Request (Race Condition):** \* Query **Transactions** to ensure `userToBookFor` does not already have an active (Pending or Confirmed) request for this exact `Date` and `Period`.  
5. **Action: Create Record:**  
* Generate a new `BookingID` (e.g., `TR_0045`).  
* Lookup the target `TimeSlotID` and `BellType` from the **Bell** and **Calendar** tables.  
* Insert a new row into the **Transactions** sheet (Table 6.10):  
  * `SubmittedByUserID` \= `actor`  
  * `BookingForUserID` \= `userToBookFor`  
  * `Subject` \= Derived from `subjectId` lookup  
  * `Section` \= `section`  
  * `Date` \= `date`, `Period` \= `period`  
  * `LabTitle` \= `labTitle`, `Remark` \= `remark`  
  * `Status` \= "Pending"  
  * `BookingTimeStamp` \= Current UTC timestamp  
  * *(Note: `LabID`, `AssignedTaltID`, and `ConfirmUserId` must remain completely empty/null).*  
6. **Notify:** Trigger the "New Request Submitted" email script to alert the TALT group, and send a confirmation receipt to the `userToBookFor`. 

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Your request has been successfully submitted.",
  "newBookingDetails": { 
    "bookingId": "TR_0045",
    "status": "Pending"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Booking failed: Request must be made at least 2 instructional days in advance."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Booking failed: You are not scheduled to teach this subject during this period according to the master timetable."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Booking failed: No suitable labs or technicians are available for this time slot."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Booking failed: Only Technicians and Admins can bypass the 2-day lead time warning." 
}
```

#### **7.15 Function: `submitMultiSectionRequest`**  {#7.15-function:-submitmultisectionrequest}

**Description:** Submits a batch of related lab booking requests (e.g., the same lab experiment repeated across multiple sections of the same subject) as a single atomic transaction. It assigns a shared `BatchID` to all records, allowing the frontend UI to group them and the `approveBooking` function to consolidate confirmation emails. 

**Request from Frontend:**  
*Standard Teacher Request (Tenzin books for 2 sections):* 

```json
{
  "loggedInUserId": "user_15",
  "targetUserId": "user_05", 
  "subjectId": "subject_03",
  "labTitle": "Wave Experiment Series",
  "remark": "Need 5 oscilloscopes per section.",
  "slots": [ 
    { "section": "1101", "date": "2025-11-06", "period": "3" },
    { "section": "1102", "date": "2025-11-07", "period": "1" }
  ]
}
```

*TALT Proxy Request (Mek books for Tenzin, with lead-time bypass):* 

```json
{
  "loggedInUserId": "user_02",    
  "targetUserId": "user_15", 
  "subjectId": "subject_03",
  "labTitle": "[Urgent] Wave Experiment Series",
  "remark": "HoD approved late booking.",
  "bypassLeadTimeWarning": true,
  "slots": [
    { "section": "1101", "date": "2025-11-01", "period": "3" },
    { "section": "1102", "date": "2025-11-01", "period": "5" }
  ]
}
```

**Backend Logic:**

1. **Determine Context & Authorize:** \* `actor` \= `loggedInUserId`. `userToBookFor` \= `targetUserId`.  
* If `actor` \!= `userToBookFor`, verify `actor` has 'LabTech', 'TA', or 'HoD' role.  
2. **Atomicity Pre-Check Loop:** Iterate through the `slots` array to validate every item *before* touching the database. If *any* slot fails a check, abort the entire process and return an error (All-or-Nothing).  
* **Check 1: 2-Day Advance Rule:** Calculate instructional days. If \< 2, check if `bypassLeadTimeWarning == true` (and actor is TALT/HoD). If not, throw Lead Time error.  
* **Check 2: Teacher Timetable:** Query **TeacherTimeTables** to verify `userToBookFor` actually teaches `subjectId` / `section` on that Date/Period. If not, throw Timetable error.  
* **Check 3: Duplicate Request:** Query **Transactions** to ensure `userToBookFor` doesn't already have an active request for that Date/Period. If yes, throw Duplicate error.  
3. **Action: Create Records:** If the Pre-Check loop completes with zero errors:  
* Generate a single, unique `BatchID` (e.g., `BATCH_009`).  
* Loop through the `slots` array again. For each slot, insert a new row into the **Transactions** sheet (Table 6.10):  
  * `BookingID` \= (Generated unique ID for this specific row)  
  * `BatchID` \= `BatchID`  
  * `SubmittedByUserID` \= `actor`  
  * `BookingForUserID` \= `userToBookFor`  
  * `Subject` \= Derived from `subjectId`  
  * `Section` \= `slot.section`  
  * `Date` \= `slot.date`, `Period` \= `slot.period`  
  * `LabTitle` \= `labTitle`, `Remark` \= `remark`  
  * `Status` \= "Pending"  
  * `BookingTimeStamp` \= Current UTC timestamp  
4. **Notify:** Trigger *one* consolidated "New Request Submitted" email to the TALT group and `userToBookFor`, summarizing the requested dates/periods. 

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Your request for 2 sections has been successfully submitted.",
  "batchDetails": {
    "batchId": "BATCH_009",
    "totalSlots": 2,
    "status": "Pending"
  }
}
```

**Response to Frontend (Error):**

```json
{ 
  "ok": false, "success": false, 
  "error": "Batch Booking failed: The slot on 2025-11-06 (Period 3) does not meet the 2-day advance notice requirement." 
}
```

```json
{ 
  "ok": false, "success": false, 
  "error": "Batch Booking failed: You are not scheduled to teach Section 1102 on 2025-11-07 (Period 1)." 
}
```

```json
{ 
  "ok": false, "success": false, 
  "error": "Batch Booking failed: You already have a request submitted for 2025-11-06 (Period 3)." 
}
```

#### **7.16 Function: `createLabSupportBooking`** {#7.16-function:-createlabsupportbooking}

**Description:** Creates a self-assigned, instantly confirmed booking for technicians (e.g., deep cleaning, setup/teardown, or inventory). It runs the exact same workload validation rules as `approveBooking`, ensuring that TALTs do not accidentally overbook themselves with internal tasks without triggering a bypass prompt. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02", 
  "labId": "lab_01",
  "date": "2025-10-29",
  "period": "4",
  "purpose": "Deep clean microscopes",
  "bypassWarning": false,
  "bypassReason": "" 
}
```

**Backend Logic:**

1. **Authorization Check:** Ensure `loggedInUserId` has the role 'LabTech', 'TA', or 'HoD'. If not, return a permission error.  
2. **Check 1: Workload Limits:** Run the "Total Workload" (daily limit) and "Consecutive Workload" (back-to-back limit) checks for `loggedInUserId` on the requested `date`.  
3. **Check 2: Workload Bypass:** \* If Check 1 limits are exceeded AND `bypassWarning == false`, reject the request and return the `BYPASS_REQUIRED` error (this triggers the frontend modal).  
* If Check 1 limits are exceeded AND `bypassWarning == true`, allow the request to proceed.  
4. **Check 3: Room Availability (Race Condition):** Query **Transactions** and **Outages** for the exact `labId`, `date`, and `period`. If a confirmed booking or active outage already exists, return the "Room unavailable" error.  
5. **Action: Create Record:** Generate a new `BookingID` and insert a row into the **Transactions** sheet (Table 6.10):  
   * `SubmittedByUserID` \= `loggedInUserId`  
   * `BookingForUserID` \= `loggedInUserId`  
   * `LabID` \= `labId`  
   * `Date` \= `date`, `Period` \= `period`  
   * `Subject` \= "Lab Support" (or "Internal Prep")  
   * `Section` \= "N/A"  
   * `LabTitle` \= `purpose`  
   * `Status` \= "Confirmed (Lab Support)"  
   * `ConfirmUserId` \= `loggedInUserId`  
   * `AssignedTaltID` \= `loggedInUserId`  
   * `BookingTimeStamp` \= Current UTC timestamp  
6. **Action: Create Calendar Event:** Generate a Google Calendar event for the TALT's schedule and save the `GCalEventID`.  
7. **Action: Notify HoD (Bypass):** IF `bypassWarning == true` AND `loggedInUserId` is not the HoD, send a background email to the HoD summarizing the internal bypass reason.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Lab Support booking successfully created.",
  "newBookingDetails": {
    "bookingId": "TR_0046",
    "labName": "Bio1",
    "labId": "lab_01",
    "date": "2025-10-29",
    "period": "4",
    "labTitle": "Deep clean microscopes",
    "status": "Confirmed (Lab Support)",
    "assignedTaltName": "Mek"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Total workload limit reached. Proceed anyway?",
  "errorCode": "BYPASS_REQUIRED" 
}
```

```json
{
  "ok": false, "success": false,
  "error": "Creation failed: This lab room is already booked or undergoing maintenance during this period."
}
```

#### **7.17 Function: `approveBooking`** {#7.17-function:-approvebooking}

**Description:** The core action for TALTs. It approves a pending booking, officially assigns a physical lab room and a specific technician, executes final validation/workload checks, resolves exact P2 timings, creates the Google Calendar event, and manages notification emails (including intelligent batch-email consolidation). 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02", // The TALT or HoD taking the action
  "bookingId": "TR_0045",
  "selectedLabId": "lab_04",
  "selectedTechnicianId": "user_06", // The TALT being assigned to the job
  "bypassWarning": true,
  "bypassReason": "HoD verbally approved over-limit." 
}
```

**Backend Logic:**

1. **Fetch Booking Data:** Query the **Transactions** sheet (Table 6.10) for `bookingId`. Extract Date, Period, Subject, Section, BookingForUserID (Teacher ID), LinkedBookingID, and BatchID.  
2. **Check 1: Stale Data:** Verify current Status is 'Pending'. If not, abort and return an error.  
3. **Step 1: Bell Schedule Resolution (P2 Logic):**  
* Initialize `startTime`, `endTime`, and `sendShortLabEmail = false`.  
* **If Period is '2':**  
  * Query **TeacherTimeTables** (Table 6.7) matching the Teacher ID, Subject, Section, and DayType. Read the `Grade` column.  
  * If Grade is blank/invalid \-\> Return `CONFIG_ERROR`.  
  * If Grade is '11' \-\> Look for `PeriodID == '2-11'` in the **Bell** sheet.  
  * If Grade is '10' or '12' \-\> Look for `PeriodID == '2-10/12'` in the **Bell** sheet.  
  * If the corresponding Bell entry is missing \-\> Return `CONFIG_ERROR`.  
  * If the found duration is \< 50 mins \-\> Set `sendShortLabEmail = true`.  
  * Set `startTime` and `endTime` to the found values.  
* **If Period is NOT '2':**  
  * Get the standard `startTime` and `endTime` from the Bell sheet. If missing \-\> Return `CONFIG_ERROR`.  
4. **Check 2: Workload & Bypass Checks:** \* Run the Total and Consecutive workload limits on `selectedTechnicianId` for that date.  
* If limits are exceeded AND `bypassWarning == false`, reject the approval and return `BYPASS_REQUIRED`.  
* If limits are exceeded AND `bypassWarning == true`, allow the approval to proceed.  
5. **Check 3: Race Condition:** Final query to ensure `selectedLabId` is still available on that Date/Period.  
6. **Action: Approve & Update:** Update the Transaction row:  
* Status \= "Confirmed"  
* LabID \= `selectedLabId`  
* ConfirmUserId \= `loggedInUserId`  
* AssignedTaltID \= `selectedTechnicianId`  
* **CRITICAL:** If the period was resolved to a specific split-bell, update the Period column (e.g., change "2" to "2-11").  
7. **Action: Postponement Handling:** If `LinkedBookingID` exists, find the original older booking and update its Status to "Cancelled (Postponed)".  
8. **Action: Create Calendar Event:** Create the Google Calendar event using the resolved `startTime` and `endTime`. Save the `GCalEventID` to the Transaction row.  
   * **Shared Calendar & Guest Logic:** When a booking is approved:  
1. The system creates the event directly on the **MUIDS Lab Calendar**.  
2. The `assignedTaltId` (email) is added to that event as a **Guest**.  
3. **Result:** The event remains an official departmental record on the shared calendar, but also automatically populates the technician's personal Google Calendar, ensuring visibility on their mobile devices and personal schedules.  
4. **Bidirectional Sync:** Set the GCal Event `description` to include the `BookingID` and the `TeacherName`. This makes the "Bidirectional Sync" easier later because the script can find the ID in the event description.   
9. **Action: Notify HoD (Bypass):** IF `bypassWarning == true` AND `loggedInUserId` is not the HoD, send a background email to the HoD summarizing the bypass reason.  
10. **Action: Notify Teacher (Batch Logic):**  
* **If BatchID is NULL:** Send standard confirmation email to the teacher. Append the short lab warning if `sendShortLabEmail == true`.  
* **If BatchID is NOT NULL:** Count remaining 'Pending' bookings with this exact `BatchID`.  
  * If Count \> 0: Do nothing (wait for the rest to be processed).  
  * If Count \== 0: Query all final outcomes for this `BatchID`. Send *one* consolidated email to the teacher (e.g., "Batch Update: 3 Confirmed, 0 Denied"). Include short lab warnings if applicable to any of the approved items.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Booking confirmed and calendar event created.",
  "updatedBookingDetails": {
    "bookingId": "TR_0045",
    "labName": "Chem1",
    "labId": "lab_04",
    "date": "2025-10-21",
    "period": "2-11", // Frontend receives updated accurate period
    "section": "1001",
    "labTitle": "Titration Prep",
    "status": "Confirmed",
    "bookedBy": "Teacher Leyla",
    "assignedTaltName": "Mai", 
    "googleCalendarEventLink": "https://calendar.google.com/event?eid=..."
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Cannot approve. Grade level is missing for this class. Please check Subjects and TeacherTimeTables sheets.",
  "errorCode": "CONFIG_ERROR"
}
```

```json
{
  "ok": false, "success": false,
  "error": "Cannot approve. Bell schedule configuration is missing for '2-11'.",
  "errorCode": "CONFIG_ERROR"
}
```

```json
{ "ok": false, "success": false, "error": "Workload limit reached for TALT Kris. Proceed anyway?", "errorCode": "BYPASS_REQUIRED" }
```

```json
{ "ok": false, "success": false, "error": "This lab room is no longer available." }
```

```json
{ 
  "ok": false, "success": false, 
  "error": "Action failed. This request is no longer Pending (it may have already been actioned by another TALT)." 
}
```

#### **7.18 Function: `declineBooking`** {#7.18-function:-declinebooking}

**Description:** Declines a pending booking, logs the rejection reason, handles postponement reversions (reverting the original booking if a postponement is denied), and manages consolidated batch email notifications.

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02", 
  "bookingId": "TR_0048",
  "reason": "Required chemicals are currently out of stock."
}
```

**Backend Logic:**

1. **Authorization & Fetch:** Verify `loggedInUserId` has 'LabTech', 'TA', or 'HoD' permissions. Query the **Transactions** sheet for `bookingId`. Extract `Status`, `LinkedBookingID`, and `BatchID`.  
2. **Check 1: Stale Data:** Verify the current `Status` is 'Pending'. If it has already been actioned (e.g., confirmed or cancelled), return an "Action failed" error.  
3. **Action: Decline:** Update the target row in the **Transactions** sheet. Set `Status` to "Denied". Set the technician's rejection reason (e.g., appending to the `Remark` column or setting a dedicated `TechnicianRemark` column). Set `ConfirmUserId` to `loggedInUserId`.  
4. **Action: Postponement Reversion:** IF a `LinkedBookingID` exists (meaning this request was an attempt to reschedule an existing lab), find that original booking ID. Revert the original booking's `Status` from "Pending (Postponement)" back to "Confirmed" so the teacher does not lose their original slot.  
5. **Action: Notify Teacher (Batch Logic):** \* **If BatchID is NULL:** Send the standard decline notification email to the teacher, explicitly including the `reason`.  
* **If BatchID is NOT NULL:** Count remaining 'Pending' bookings that share this exact `BatchID`. If Count \> 0, do nothing yet. If Count \== 0, query all final outcomes for this `BatchID` and send *one* consolidated email to the teacher (e.g., "Batch Update: 2 Confirmed, 1 Denied. Reason: Required chemicals out of stock.").  
6. **Fetch & Return:** Retrieve the newly updated details to return to the frontend.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Booking request has been declined.",
  "updatedBookingDetails": {
    "bookingId": "TR_0048",
    "status": "Denied",
    "technicianRemark": "Required chemicals are currently out of stock."
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Action failed. This request is no longer Pending."
}
```

#### **7.19 Function: `cancelBooking`** {#7.19-function:-cancelbooking}

**Description:** Cancels a Pending or Confirmed reservation. If a teacher cancels a new postponement request, the system automatically reinstates their original booking. It also manages Google Calendar event deletion and enforces the 24-hour cancellation rule for teachers. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_05",
  "bookingId": "TR_0088"
}
```

**Backend Logic:**

1. **Fetch Data:** Query the **Transactions** sheet for `bookingId`. Retrieve `BookingForUserID`, `Status`, `Date`, `Period`, `LinkedBookingID`, and `GCalEventID`.  
2. **Check 1: Authorization:** Verify `loggedInUserId` matches `BookingForUserID`. If they do not match, verify that `loggedInUserId` has 'LabTech', 'TA', or 'HoD' permissions (Proxy Cancellation). If neither is true, return an authorization error.  
3. **Check 2: Stale Data:** Verify the current `Status` is 'Pending' or 'Confirmed'. If it is already 'Denied' or 'Cancelled', return a stale data error.  
4. **Check 3: 24-Hour Rule:** \* Retrieve the `startTime` for the booking's `Period` on its `Date` (via the Bell sheet).  
* Calculate the difference between the current server time and the `startTime`.  
* If the difference is less than 24 hours AND `loggedInUserId` is a standard Teacher (not a TALT/HoD), block the cancellation and return an error. TALTs/HoDs bypass this rule.  
5. **Action: Calendar Cleanup:** If the booking `Status` was 'Confirmed' and a `GCalEventID` exists, call the Google Calendar API to delete the event.  
6. **Action: Update Record & Postponement Reversion:**  
* **If `LinkedBookingID` is NULL (Standard Cancel):** Update the target row's `Status` to "Cancelled".  
* **If `LinkedBookingID` has a value (Postponement Cancel):** Update the target row's `Status` to "Cancelled". Find the original booking row using `LinkedBookingID` and revert its `Status` from "Pending (Postponement)" back to "Confirmed".  
7. **Notify:** Trigger the "Booking Cancelled" email to the TALT group and the Teacher. 

**Response to Frontend (Success \- Standard Cancel):**

```json
{
  "ok": true, "success": true,
  "message": "Booking has been successfully cancelled.",
  "updatedBooking": {
    "bookingId": "TR_0088",
    "status": "Cancelled"
  }
}
```

**Response to Frontend (Success \- Postponement Cancelled):**

```json
{
  "ok": true, "success": true,
  "message": "Postponement request cancelled. Original booking has been reinstated.",
  "updatedBooking": { "bookingId": "TR_0088", "status": "Cancelled" },
  "reinstatedBooking": { "bookingId": "TR_0045", "status": "Confirmed" }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Cancellation failed: Bookings cannot be cancelled within 24 hours of the start time."
}
```

```json
{
  "ok": false, "success": false,
  "error": "This booking's status has already been changed."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Cancellation failed: You do not have permission to cancel this booking."
}
```

#### **7.20 Function: `postponeBooking`** {#7.20-function:-postponebooking}

**Description:** Initiates a postponement by marking the original booking as "Pending (Postponement)" and creating a new "Pending" request for the new slot, linked to the original. Supports both teacher self-service and TALT proxy actions. 

**Request from Frontend:**

* *Standard Teacher Request:*

```json
{
  "loggedInUserId": "user_05",
  "originalBookingId": "TR_0012",
  "newSlot": {
    "subjectId": "subject_03",
    "section": "1101",
    "date": "2025-11-10",
    "period": "4"
  }
}
```

*TALT Proxy Request (with 24hr/2-day bypass):*

```json
{
  "loggedInUserId": "user_02",    
  "targetUserId": "user_15", 
  "originalBookingId": "TR_0012",
  "bypassLeadTimeWarning": true,
  "newSlot": {
    "subjectId": "subject_03",
    "section": "1101",
    "date": "2025-11-01", 
    "period": "4"
  }
}
```

**Backend Logic:**

1. **Determine Context & Fetch:** `actor` \= `loggedInUserId`. `userToBookFor` \= `targetUserId` (or `loggedInUserId` if null). Query **Transactions** for `originalBookingId` (`TR_0012`).  
2. **Check 1: Authorization:** Verify `userToBookFor` is the `BookingForUserID` on the original booking. If `actor` \!= `userToBookFor`, verify `actor` has 'LabTech', 'TA', or 'HoD' role.  
3. **Check 2: 24-Hour Rule (Original Slot):** Retrieve the original booking's start time. If the current time is within 24 hours of the start time, standard Teachers are blocked from postponing. TALTs/HoDs automatically bypass this rule.  
4. **Check 3: 2-Day Rule (New Slot):** Calculate instructional days for `newSlot.date`. If \< 2, check if `bypassLeadTimeWarning == true` (and actor is a TALT/HoD). If not, throw a Lead Time error.  
5. **Check 4: Teacher Timetable:** Query **TeacherTimeTables** to verify `userToBookFor` teaches `newSlot.subjectId` / `newSlot.section` on that Date/Period.  
6. **Check 5: Duplicate Request:** Query **Transactions** to ensure `userToBookFor` doesn't already have an active request for the new Date/Period.  
7. **Action: Perform Transaction:**  
* **Update Original:** Set the status of `TR_0012` to "Pending (Postponement)".  
* **Create New:** Generate a new ID (e.g., `TR_0089`). Create a new row in **Transactions**. Set `Status` \= "Pending". Set `LinkedBookingID` \= `TR_0012`. Copy `LabTitle` and `Remark` from the original. Set `Subject`, `Section`, `Date`, and `Period` from `newSlot`.  
8. **Notify:** Trigger the "Postponement Request Submitted" email to the TALT group and the Teacher. 

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Postponement request submitted. Awaiting TALT approval.",
  "originalBooking": {
    "bookingId": "TR_0012",
    "status": "Pending (Postponement)"
  },
  "newBooking": {
    "bookingId": "TR_0089",
    "status": "Pending",
    "linkedBookingId": "TR_0012"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Postponement failed: Cannot modify a booking within 24 hours of its start time."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Postponement failed: The new slot must be at least 2 instructional days in advance."
}
```

```json
{
  "ok": false, "success": false,
  "error": "The new slot is not available."
}
```

```json
{
  "ok": false, "success": false,
  "error": "The new slot is not part of the teacher's schedule."
}
```

```json
{
  "ok": false, "success": false,
  "error": "You do not have permission to modify this booking."
}
```

#### **7.21 Function: `createLabOutage`** {#7.21-function:-createlaboutage}

**Description:** Creates a new lab outage record (e.g., for maintenance, hazards, or repairs) and automatically cancels any existing teacher bookings that conflict with the outage period. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "labId": "lab_01",
  "startDate": "2025-10-27",
  "endDate": "2025-10-29",
  "reason": "Flood repairs"
}
```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` has the role 'LabTech', 'TA', or 'HoD'. If not, return an authorization error.  
2. **Validation:** Ensure `startDate` is chronologically on or before `endDate`. Ensure `reason` is not empty.  
3. **Find Conflicts:** Query the **Transactions** sheet for any rows where `LabID` matches `labId`, the `Date` falls between `startDate` and `endDate` (inclusive), and the `Status` is 'Confirmed' (or 'Pending' if your system pre-assigns preferred labs).  
4. **Action: Auto-Cancel Conflicts:** Loop through all conflicting bookings found:  
   * Update their `Status` to "Cancelled (Admin)".  
   * Append to the `Remark` or `TechnicianRemark` column: "Lab unavailable: \[reason\]" (e.g., "Lab unavailable: Flood repairs").  
   * *Calendar Cleanup:* If the booking had a `GCalEventID`, call the Google Calendar API to delete the event.  
   * *Notify:* Trigger a "Cancelled (Admin)" notification email to the Teacher for each cancelled booking, clearly stating the outage reason.  
5. **Action: Create Outage Record:** Generate a new unique `OutageID`. Insert a new row into the **LabOutages** sheet:  
* `OutageID` \= (generated ID)  
* `LabID` \= `labId`  
* `StartDate` \= `startDate`, `EndDate` \= `endDate`  
* `Reason` \= `reason`  
* `CreatedByUserID` \= `loggedInUserId`  
* `Status` \= "Active"  
6. **Fetch & Return:** Retrieve the human-readable `labName` from the **Labs** sheet to enrich the response, alongside the count of how many bookings were auto-cancelled.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Outage created. 2 conflicting bookings were auto-cancelled.",
  "newOutage": {
    "outageId": "Outage_005",
    "labId": "lab_01",
    "labName": "Biology Lab 1",
    "startDate": "2025-10-27",
    "endDate": "2025-10-29",
    "reason": "Flood repairs",
    "status": "Active"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Outage creation failed: Invalid date range. End date must be on or after the start date."
}
```

#### **7.22 Function: `updateOutageStatus`**  {#7.22-function:-updateoutagestatus}

**Description:** Updates the current status of an existing lab outage. This is primarily used by technicians to toggle an outage to 'Resolved' when maintenance finishes early, allowing the room to be booked again, or reverting it to 'Active' if the issue persists. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "outageId": "Outage_005",
  "newStatus": "Resolved"
}
```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` has the role 'LabTech', 'TA', or 'HoD'. If not, return an authorization error.  
2. **Validation:** Ensure `newStatus` is a valid state (e.g., "Active" or "Resolved").  
3. **Fetch Record:** Query the **LabOutages** sheet using `outageId`. If the record cannot be found, return a not found error.  
4. **Action: Update Status:** Overwrite the target row's `Status` column with the value of `newStatus`. (Note: This function does *not* automatically reinstate previously cancelled bookings, as teachers may have already made alternative plans).  
5. **Fetch & Return:** Retrieve the updated outage record details to send back to the frontend UI.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Outage status successfully updated to Resolved.",
  "updatedOutage": {
    "outageId": "Outage_005",
    "labId": "lab_01",
    "status": "Resolved"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Update failed: You do not have permission to modify outages."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Update failed: Outage record not found."
}
```

#### **7.23 Function: `deleteLabOutage`** {#7.23-function:-deletelaboutage}

**Description:** Performs a hard deletion of an existing lab outage record from the database. This is typically used if an outage was created by mistake or with completely incorrect dates. (Note: It does not automatically reinstate any bookings that were auto-cancelled when the outage was originally created). 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "outageId": "Outage_005"
}
```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` has the role 'LabTech', 'TA', or 'HoD'. If not, return an authorization error.  
2. **Fetch Record:** Query the **LabOutages** sheet for the row matching `outageId`.  
3. **Race Condition / Missing Data Check:** If the record is not found (meaning it may have already been deleted by another TALT), return an "Outage not found" error.  
4. **Action: Delete Row:** Completely delete the matching row from the **LabOutages** sheet. **Response to Frontend (Success):**

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Outage Outage_005 has been permanently deleted."
}

```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Deletion failed: You do not have permission to delete outages."
}
```

```json
{
  "ok": false, "success": false,
  "error": "Deletion failed: Outage not found. It may have already been deleted."
}
```

#### **7.24 Function: `completeTutorial`** {#7.24-function:-completetutorial}

**Description:** Called when a user successfully completes the mandatory onboarding tutorial (e.g., clicking "Finish" or "Get Started"). It updates their user profile so the tutorial does not automatically trigger on future logins. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_05"
}
```

**Backend Logic:**

1. **Fetch Record:** Query the **Users** sheet for the row matching `loggedInUserId`.  
2. **Validation:** If the user row cannot be found, return a "User not found" error.  
3. **Action: Update Flag:** Set the value of the `hasCompletedTutorial` column for that specific user to `TRUE`.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Tutorial completion status successfully updated."
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Update failed: User not found. Could not save tutorial status."
}
```

#### **7.25 Function: `bulkApproveBatch`** {#7.25-function:-bulkapprovebatch}

**Description:** Approves a specific selection of bookings within a batch. This allows for "Partial Approval" where some sections of a batch are confirmed while others remain pending or are handled separately. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "batchId": "BATCH_009",
  "approvals": [
    { "bookingId": "TR_101", "labId": "lab_01", "assignedTaltId": "user_02" }, 
    { "bookingId": "TR_102", "labId": "lab_02", "assignedTaltId": "user_03" },
    { "bookingId": "TR_103", "labId": "lab_01", "assignedTaltId": "user_04" }
  ],
  "bypassWarning": false

```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` is TALT/HoD.  
2. **Individual Availability & Workload Check:** The backend loops through the `approvals` array. For **each** object, it verifies:  
* The `assignedTaltId` is actually free for that specific `bookingId`'s date/period.  
* The `assignedTaltId` hasn't hit their daily "Max Periods" or "Consecutive Periods" limit.  
3. **Bypass Check:** If any technician exceeds their daily/consecutive limit and `bypassWarning` is `false`, return the `BYPASS_REQUIRED` error with details on which technician/date triggered it.  
4. **Partial Processing:** Any `bookingId` belonging to the batch that is **not** in the `approvals` array (and not in a simultaneous `bulkDecline` call) remains in the "Pending" state.  
5. **Action: Commit:** For all validated entries:  
   * Update **Transactions**: Set `Status` to "Confirmed", assign the specific `LabID` and `AssignedTaltID`.  
   * **Calendar:** Create individual Google Calendar events for the assigned technicians.  
6. **Action: Notify:** Send one consolidated email to the teacher showing which sessions were confirmed (and who was assigned) and which are still pending or denied.  
* When the batch is processed (Confirmed or Denied), send one consolidated "Batch Processed" email. It may contain “All booking slots confirmed, Partial booking slots confirmed, None booking slots confirmed”.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Partial approval successful. 3 of 5 sessions confirmed.",
  "confirmedIds": ["TR_101", "TR_102", "TR_103"]
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Workload limit reached for assigned TALT. Proceed anyway?", "errorCode": "BYPASS_REQUIRED" } 
```

#### **7.26 Function: `bulkDeclineBatch`** {#7.26-function:-bulkdeclinebatch}

**Description:** Rejects a specific selection of bookings (or the entire batch) with a shared reason.

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "batchId": "BATCH_009",
  "bookingIds": ["TR_103"],
  "reason": "Staff meeting during this period; no TALT available."
}
```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` is TALT/HoD.  
2. **Action: Process Rejections:** Loop through the `bookingIds` array:  
   * Update **Transactions**: Set `Status` \= "Denied", `TechnicianRemark` \= `reason`, `ConfirmUserId` \= `loggedInUserId`.  
   * **Postponement Reversion:** If any of these IDs have a `LinkedBookingID`, revert the original booking to "Confirmed".  
3. **Action: Notify Teacher:** (Same consolidated email logic as `bulkApproveBatch`). 

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Successfully declined 1 section in batch BATCH_009."
}
```

**Response to Frontend (Error \- Stale Data):**

```json
{
  "ok": false, "success": false,
  "error": "Decline failed. Some sessions in this batch have already been confirmed or cancelled. Please refresh your view."
}
```

**Response to Frontend (Error \- Validation):**

```json
{
  "ok": false, "success": false,
  "error": "Decline failed. You must provide a rejection reason for the teacher."
}
```

#### **7.27 Function: `updateConfirmedBooking`** {#7.27-function:-updateconfirmedbooking}

**Description:** Allows a TALT or HoD to modify the assigned Lab or Technician for a booking that has already been confirmed. This avoids the "Cancel and Re-book" cycle for simple logistical changes. 

**Request from Frontend:**

```json
{
  "loggedInUserId": "user_02",
  "bookingId": "TR_0045",
  "newLabId": "lab_02",
  "newAssignedTaltId": "user_03",
  "bypassWarning": false
}
```

**Backend Logic:**

1. **Authorization:** Verify `loggedInUserId` has 'LabTech', 'TA', or 'HoD' permissions.  
2. **Fetch & Validate:** Query the **Transactions** sheet for `bookingId`. Verify the current `Status` is 'Confirmed'.   
3. **Availability & Workload Check:** If `newLabId` is provided, verify the lab is not blocked or double-booked. If `newAssignedTaltId` is provided, verify they are free and within workload limits.  
4. **Action: Update Record:** Update the row in **Transactions** with the new `LabId` and/or `AssignedTaltID`. Update the `BookingTimeStamp` to reflect the modification time.  
5. **Action: Calendar Update:** Update the Google Calendar event to reflect the new technician or lab location.   
* If only the lab changed: Update the existing GCal event's location/description.

**Response to Frontend (Success):**

```json
{
  "ok": true, "success": true,
  "message": "Booking assignment successfully updated.",
  "updatedBooking": {
    "bookingId": "TR_0045",
    "labId": "lab_02",
    "assignedTaltId": "user_03"
  }
}
```

**Response to Frontend (Error):**

```json
{
  "ok": false, "success": false,
  "error": "Update failed: The selected technician has reached their workload limit."
}
```

#### **7.28 Concurrency & Data Integrity.** {#7.28-concurrency-&-data-integrity.}

**Description:** To prevent "Race Conditions," all functions that modify the database (Write operations) must use the Google Apps Script **LockService**. This ensures that the system processes only one write-request at a time, maintaining a "single source of truth" for lab availability and technician workloads. 

**Technical Specification:**

* **Mechanism:** `LockService.getScriptLock()`  
* **Wait Timeout:** `30000` milliseconds (30 seconds).  
* **Placement:** The lock must be acquired **before** any data is read for validation and released **after** the final `SpreadsheetApp.flush()` or function completion.

**Logic Flow:**

1. **Request Lock:** The function attempts to acquire the script lock.  
2. **Wait:** If another user is currently writing to the sheet, this request waits in a queue for up to 30 seconds.  
3. **Critical Section (The "Safe Zone"):**  
   * Read the current state of the spreadsheet.  
   * Perform all validation checks (e.g., "Is the lab still free?").  
   * Execute the `appendRow` or `setValues` command.  
   * Call `SpreadsheetApp.flush()` to force the data into the cells immediately.  
4. **Release Lock:** The lock is released, allowing the next person in the queue to enter the "Safe Zone."

**Functions Requiring Implementation:** The LockService is **mandatory** for all Category 2 functions, specifically;  
Booking & Request Management

* `submitBookingRequest`  
* `submitMultiSectionRequest`  
* `createLabSupportBooking`  
* `cancelBooking`  
* `postponeBooking`

TALT Approval Workflow

* `approveBooking`  
* `declineBooking`  
* `bulkApproveBatch`  
* `bulkDeclineBatch`  
* `updateConfirmedBooking`

Lab Maintenance & Outages

* `createLabOutage`  
* `updateOutageStatus`  
* `deleteLabOutage`

User Profile Updates

* `completeTutorial`

**Response to Frontend (On Lock Timeout):** In the rare event that the 30-second timeout is exceeded (e.g., a massive bulk process is running), the system must return a "Busy" error instead of crashing.

```json
{
  "ok": false, "success": false,
  "error": "The system is currently busy processing another request. Please try again in 10 seconds."
}
```

#### **7.x Function: template** {#7.x-function:-template}

**Description:** 

**Request from Frontend:**

```json

```

**Backend Logic:**

1. 

**Response to Frontend (Success):**

```json

```

**Response to Frontend (Error):**

```json

```

# **8\. Release Criteria & Success Metrics** {#8.-release-criteria-&-success-metrics}

## **8.1 Release Criteria (The "Definition of Done")**  {#8.1-release-criteria-(the-"definition-of-done")}

The system will be considered ready for production rollout once the following conditions are met:

* **Functional Completion:** All features defined in Section 7 (Read/Write/Infrastructure) are implemented and pass User Acceptance Testing (UAT) with a pilot group of 2 Teachers and 1 TALT.  
* **Workflow Accuracy:**  
  * Teacher schedule lookups and "Availability" views match the master Google Sheet exactly.  
  * Reservation forms correctly capture input and auto-populate read-only fields (Teacher Name, Email).  
  * The `pending`/`confirmed`/`declined` icon statuses update immediately upon action or after a manual force-refresh.  
* **Zero Critical Defects:** No "Showstopper" or "Critical" bugs in core workflows (Submit, Approve, Cancel).  
* **Cross-Platform Stability:** Validated usability across major browsers (Chrome, Safari) used by Mahidol faculty.  
* **Documentation:** A basic TALT User Guide is complete, covering Batch Approvals and Outage Management.  
* **API Fidelity Check:** A formal review must be conducted to ensure that the implemented Google Apps Script functions match the technical signatures and business logic defined in **Section 7 (API Specifications)** exactly. No deviations in parameter naming or JSON response structure are permitted without a PRD version update.

## **8.2 Key Performance Indicators (KPIs)** {#8.2-key-performance-indicators-(kpis)}

Following the launch, the system’s success will be measured by the following targets: 

| Metric | Target Goal | Measurement Method |
| ----- | ----- | ----- |
| **Booking Time** | **\< 1 Minute** | Time from opening the app to "Submit Success" (Baseline: \~5 mins manual). |
| **Adoption Rate** | **93% of Science Faculty** | Measured by unique user logins within the first 2 months. |
| **TALT Response Time** | **\< 5 Minutes** | Average time between request notification and TALT action. |
| **Data Accuracy** | **\< 2 Conflicts/Month** | Manually reported double-bookings or scheduling errors. |
| **Teacher Satisfaction** | **\> 4.0 / 5.0** | Post-launch survey score regarding ease of use. |
| **Efficiency** | **Qualitative Improvement** | TALT team reports a reduction in manual conflict resolution via WhatsApp. |

# **9\. Timeline & Resources (High-level)** {#9.-timeline-&-resources-(high-level)}

## **9.1 Project Phases & Milestones** {#9.1-project-phases-&-milestones}

The total estimated time for project completion is **6–8 weeks**, broken down into the following key phases:

* **Phase 1: Discovery & Planning (Weeks 1–2)**  
  * Finalize PRD and Database Schema.  
  * Design UI Wireframes for the "Multi-Section Selected Slots" and "TALT Dashboard."  
* **Phase 2: Development & Alpha Testing (Weeks 3–5)**  
  * **Backend:** Implement all functions in Section 7 (Read, Write, and LockService).  
  * **Frontend:** Develop Modular HTML Components and integrate with Google Apps Script API.  
  * **Alpha:** Developer-led testing of core booking/approval cycles.  
* **Phase 3: UAT & Launch (Week 6\)**  
  * **User Acceptance Testing (UAT):** Conduct 1 week of testing with representative Teachers and TALTs.  
  * **Bug Fixing:** Resolve any "Showstopper" issues identified during UAT.  
  * **Deployment:** Live migration to the Mahidol production environment.  
* **Phase 4: Post-Launch & Support (Weeks 7–8)**  
  * Monitor system stability and LockService performance.  
  * Gather teacher feedback for potential V1.3 improvements.  
  * Ensure 100% tutorial completion among staff.

## **9.2 Resource Allocation** {#9.2-resource-allocation}

* **Primary Developer:** **Mek** (Full-stack development, database architecture, and deployment).  
* **Support Resources:**  
  * **TALT Team:** Responsible for UAT participation and providing feedback on technician workload logic.  
  * **Head of Department (HoD):** Responsible for faculty-wide communication, policy enforcement (Bypass usage), and high-level support.

# **10\. Assumptions, Constraints & Risks** {#10.-assumptions,-constraints-&-risks}

## **10.1 Assumptions** {#10.1-assumptions}

For the system to function as designed, the following must hold true:

* **Infrastructure Stability:** Google Workspace services (Sheets, Apps Script, Calendar, Gmail) will remain reliably available during school hours.  
* **Schedule Consistency:** The school’s A–E day cycle and bell schedule structure will remain consistent throughout the academic year.  
* **Data Integrity:** Master data (Schedules, Subjects, User Lists) will be accurately maintained in the designated Google Sheets by the TALT lead.  
* **User Behavior:** Teachers will have basic web literacy and will primarily access the app via desktop browsers during planning periods.

## **10.2 Constraints** {#10.2-constraints}

* **Technology Stack (Mandatory):** The project is strictly limited to the standard Google Workspace suite. Access to external platforms (Firebase, AWS) or advanced Cloud Services (Generative AI APIs) is disabled by the organization and cannot be used.  
* **Lead Time Requirement:** All booking requests must be made at least **2 instructional days** in advance (defined as any date with an A–E DayType).  
* **Authentication:** The system must exclusively use MUIDS Google Workspace accounts (`@mahidol.ac.th`).  
* **Resource Limit:** Development is a single-resource effort (**Mek**) performed alongside primary TALT duties.

## **10.3 Risks & Mitigation** {#10.3-risks-&-mitigation}

| Risk | Impact | Mitigation Strategy |
| ----- | ----- | ----- |
| **Performance Degradation** | High | Optimize Apps Script by minimizing sheet reads/writes and using setValues() for batch operations. Plan for data archiving at the end of each term. |
| **Double Bookings (Race Condition)** | High | **Mandatory implementation of LockService** (Section 7.28) for all write operations. |
| **Data Corruption (Manual Edits)** | Medium | Use **Range Protection** on Column A and critical IDs to prevent manual typing. Restrict direct sheet access to the Lead Developer and HoD only. |
| **Low User Adoption** | Medium | Implement the **Mandatory Onboarding Tutorial** (7.24) and clear communication championed by the HoD. |
| **Key Person Dependency** | High | Document all backend logic (this PRD) and provide basic operational training to a backup TALT to ensure system continuity. |
| **Scope Creep** | Medium | Strictly adhere to the V1.1 feature list. All new "nice-to-have" requests will be deferred to the V2 "Future Considerations" log. |

 

# **11\. Future Considerations** {#11.-future-considerations}

While V1.1 focuses on establishing a robust, conflict-free booking baseline, the following features have been identified as high-value additions for future iterations. 

## **11.1 Advanced Booking Workflows** {#11.1-advanced-booking-workflows}

* **Equipment & Resource Booking:** Expanding the booking form to include a specific "Resource Request" checklist (e.g., "Microscope x 15"). This would tie into a basic inventory table so TALTs can generate a daily "shopping list" of required lab materials.  
* **Multi-Period & Recurring Bookings:** Allowing teachers to book a single lab session that spans consecutive periods (e.g., P2 and P3) as one event, or recurring bookings (e.g., "Every 'A' Day, P1").  
* **Makeup Lab Booking:** A dedicated workflow allowing TALTs to book labs during non-standard times (e.g., Period 8 or after school) for makeup sessions, bypassing normal schedule validation.  
* **Instant-Book Labs:** An admin setting to designate low-conflict or low-prep rooms (e.g., "Computer Lab") as "Instant-Book," automatically confirming the request without requiring TALT approval.

## **11.2 Smart Scheduling & Automation** {#11.2-smart-scheduling-&-automation}

* **Smart Lab Allocation (Buffer Times):** A rules engine to prevent incompatible back-to-back bookings (e.g., a messy "Biology Dissection" followed immediately by a "Complex Chemistry" lab) by automatically injecting setup/cleanup buffer times between reservations.  
* **TALT-Suggested Alternatives:** When a TALT declines a request, the system could automatically query for the next 3 available slots for that teacher's subject (and section) and include them as clickable "One-Click Rebook" suggestions in the decline email.  
* **Automated Reminder Emails:** Utilizing Google Apps Script time-driven triggers to send automated reminders to teachers 24 hours before their lab, and to TALTs for any requests left "Pending" for more than 48 hours.

## **11.3 Data, Analytics & Administration** {#11.3-data,-analytics-&-administration}

* **Centralized Admin Panel:** A dedicated web interface for administrators to safely manage Users, Subjects, and Calendar uploads without directly editing the raw Google Sheets, reducing the risk of data corruption.  
* **Advanced Analytics Dashboard:** A visual reporting tool for HoDs and TALTs tracking key metrics: Lab utilization rates, TALT workload distribution (to spot burnout), peak booking times, and a chart of common "Denial Reasons" to fix systemic issues.  
* **TALT Post-Event Commenting:** Allowing TALTs to append internal notes to a booking after it has occurred (e.g., "Teacher was a no-show," "Lab left untidy"), ensuring better accountability.  
* **Post-Lab Feedback System:** A private 1-5 star rating prompt for teachers after a booking is completed, providing a continuous feedback loop to the TALT team on lab prep quality.

## **11.4 System Integrations & Accessibility**  {#11.4-system-integrations-&-accessibility}

* **Mobile-Optimized TALT View:** A Progressive Web App (PWA) interface designed specifically for mobile screens, allowing TALTs to approve/decline requests on the go.  
* **School Management Integration:** Connecting the booking app to the school's main systems (e.g., Google Classroom, ATLAS, PrimeTimeTable) to automatically sync master schedules or post lab announcements to student feeds.  
* **Substitution Management:** A specialized workflow to handle bookings when the scheduled Teacher or assigned TALT is absent, allowing for temporary ownership transfers.

## **11.5 Immediate (v1.1) Maintenance** {#11.5-immediate-(v1.1)-maintenance}

* **Health Check:** Build `System_HealthCheck.gs` to verify sheet permissions and GCal access on startup.  
* **Validation:** Use Google Sheets "Data Validation" rules for the LabID and TALTID columns as a secondary defense.  
* **Backup:** the admin can export data to preserve the data collected. This is for archiving, and restoring the state of the app under maintenance or updates.

## **11.6 Roadmap (v1.2) Planning**  {#11.6-roadmap-(v1.2)-planning}

* **Caching:** Use `CacheService` to store the Teacher Timetable for 25 minutes to reduce sheet read calls.  
* **Archiving:** Implement an "End of Semester" script to move past bookings to an `Archive_Sheet`.

# **12\. Appendices** {#12.-appendices}

This section contains links to supplementary documents, external design files, technical scripts, and a glossary of terms relevant to the project. 

## **12.1 Glossary of Terms**  {#12.1-glossary-of-terms}

* **A–E Day Cycle:** The rotating 5-day academic schedule used by the school, which dictates the timetable independent of the standard Monday–Friday week.  
* **Instructional Day:** Any valid school date that is actively mapped to an 'A', 'B', 'C', 'D', or 'E' DayType in the master calendar (excludes weekends and holidays).  
* **TALT:** Teaching Assistant / Lab Technician. The primary administrative users responsible for managing labs, prepping materials, and approving bookings.  
* **HoD:** Head of Department. Holds administrative override privileges (e.g., bypass limits, system-wide cancellations).  
* **Lab Support:** A specific type of booking where a teacher requires a TALT to be physically present to assist during the lab session.  
* **Master Dashboard:** The primary UI view for TALTs and HoDs to see all incoming requests, batches, and daily workloads.  
* **My Timeline:** The primary UI view for Teachers to see their own schedules and the status of their submitted bookings.  
* **Status Flags:**  
  * Pending: A booking request successfully submitted but awaiting TALT review.  
  * Confirmed: A booking that has been approved with a specific Lab Room and TALT assigned.  
  * Declined: A booking rejected by a TALT (requires a technician remark).

## **12.2 Design & UI References** {#12.2-design-&-ui-references}

* **Google Slides Design Project: [https\://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc\_3lUmaRRo/edit?usp=sharing](https://docs.google.com/presentation/d/1m5Fl9ZsCkrMt7deLiV1GOSTjrxVAeD8SWc_3lUmaRRo/edit?usp=sharing)**   
* **User Interface Mockup (PDF): \[Placeholder \- Add Link Here\]**

## **12.3 Technical Documentation & Tooling** {#12.3-technical-documentation-&-tooling}

* **Database Schema Reference**: Full headers and structural definitions for all Google Sheets (`Transactions`, `Users`, `Calendar`, `Labs`, `Subjects`). *(See standalone Technical Appendix Document)*  
* **Apps Script Repository (**`Calendarize.gs`**)**: The core automation scripts, time-driven triggers, and LockService implementations used to connect the Google Sheets backend with the Modular HTML Components frontend.  
* **Google Calendar Integration:** Configuration settings, Calendar IDs, and API scopes required for the automated event generation upon booking confirmation.  
* **Data Ingestion Tools (Gemini Bell Schedule Tabulator):** Documentation for the custom prompt/tooling used to ingest the raw school A-E day timetable and convert it into the strict, flat JSON format required by the Google Sheets `Calendar` database.

# **13\. Changelogs & Version History** {#13.-changelogs-&-version-history}

## **13.1 Version History Table** {#13.1-version-history-table}

| Version | Date | Author | Description of Change |
| ----- | ----- | ----- | ----- |
| **1.0.0** | Sep 23, 2025 | Mek | Initial draft of the Lab Booking App PRD. |
| **1.0.1** | Oct 19, 2025 | Mek | Applied Spec-Driven Development (SDD); Added Data Models, API Specs, and detailed User Flows. |
| **1.0.2** | Oct 23, 2025 | Mek | Initial comprehensive draft focused on original "Teacher Selects Lab" workflow. |
| **1.1.0** | Oct 28, 2025 | Mek | **Major Revision:** Restructured to TALT-centric assignment model. Introduced Selected Slots staging area, Proxy Mode, and Outage Management. |
| **1.1.1** | May 2, 2026 | Mek | **Database Schema Refinement:** Standardized IDs (2-digit), expanded Outages table to 10 columns, and optimized P2 BellType formulas. |
| **1.1.2** | May 6, 2026 | Mek | **API & Infrastructure Finalization:** Implemented LockService (7.28), Workload Bypass logic, and Internal Update (7.27) protocols. |
| **1.1.3** | May 14, 2026 | Mek | **Update sections 8-12. Added** 14\. User Acceptance Testing (UAT) Plan 15\. Project Roadmap & AI-Development Strategy 16\. Disaster Recovery 17\. Deployment & Environment Strategy **Architecture & Security Hardening:** \* Decoupled administrative backend logic by introducing `API_TALT.gs` to isolate high-permission functions (Approvals, Outages, Batch Management) from standard teacher logic (`API_Write.gs`). Replaced all legacy references to "React components" with "Modular HTML Components" to align with native Google Apps Script capabilities. Added `System_HealthCheck.gs` and `Utils.gs` for foundational environment verification. **AI-Development Strategy Formalization:** \* Defined the "Tag-Team" multi-AI protocol (Section 15\) using Gemini Gems (Spec Describer & Wireframe Designer) for architecture/design and Claude 3.5 Sonnet as Lead Engineer. Introduced the "Component-Driven Architecture" file structure (Section 15.3) and strict File Header Protocols to prevent AI hallucinations during coding. **Deployment & Environments:** \* Added Section 17 (Deployment Strategy), establishing strict DEV/PROD environment separation and defining the **1:1 Mirror Promotion Protocol** to ensure safe deployments without code stitching. **UI/UX & Safety Enhancements:** \* Specified Desktop Web View as the primary "Must-Have" target, moving "Mobile-Smart" layouts to a secondary priority. Added `Modal_Workload.html` to visualize TALT session limits using dynamic progress bars. Standardized the Proxy Mode safety feature with the "Acting As \[Teacher Name\]" global banner (`bg-amber-500`). Added a Manual Revalidation (Sync/Refresh) icon to the header for real-time state fetching. **\*Configuration Decoupling:** Deprecated hardcoded configuration constants in favor of a dynamic Key-Value spreadsheet tab (\`System\_Config\`). Re-architected \`Utils.gs\` to pull calendar tokens, business parameters, and email templates on-demand via an environment-agnostic lookup engine to support seamless 1:1 workbook copying and archiving. |
| **1.1.3b** |  |  |  |
| **1.1.3c** | Jul 09, 2026 | Mek | Document-wide terminology alignment patch. Upgraded all e-commerce terminology to scheduling-native language (**Selected Slots** / **Batch** equivalents) to enforce proper system ubiquitous language. |

## **13.2 Key Architectural Decisions (Oct 31 Revision)** {#13.2-key-architectural-decisions-(oct-31-revision)}

The following strategic pivots were made to ensure system scalability and TALT team efficiency:

* **TALT-Centric Assignment:** Teachers now request **Subject \+ Time**; TALTs assign the specific **Lab Room** during approval. This prevents teachers from booking rooms they aren't authorized for.  
* **The "Selection Slots" Model:** Replaced "Multi-Book Mode" with a fluid, native staging UI. Users click multiple slots and submit one consolidated Batch request.  
* **Workload Bypass Protocol:** TALT workload limits (daily/consecutive) are now "soft" blocks. TALTs can bypass warnings, which triggers an automated accountability email to the HoD.  
* **Backend P2 Resolution:** Added a `Grade` column to the Subjects sheet. The API now uses this to automatically resolve the split-break logic for Period 2, removing the burden of choice from the user.  
* **API-Generated IDs:** All `BookingID` and `BatchID` keys are now generated via `Utilities.getUuid()` in the backend. This prevents data corruption previously caused by fragile Google Sheet formulas.  
* **Granular Outage Management:** Replaced the simple "Lab On/Off" toggle with a dedicated `LabOutages` table, allowing for partial-day blocks and automatic conflict cancellation.

## **13.3 Detailed Revision Log (v1.1.1 \- v1.1.2)** {#13.3-detailed-revision-log-(v1.1.1---v1.1.2)}

### **13.3.1 Backend & Security Optimization** {#13.3.1-backend-&-security-optimization}

* **ID Migration:** Shifted all API communication from raw emails to Primary Key IDs (e.g., `user_01`).  
* **Proxy Authorization:** Implemented rigid permission checks; only 'LabTech', 'TA', or 'HoD' roles can view schedules on behalf of other users.  
* **Concurrency Control:** Integrated `LockService` with a 30-second timeout and `SpreadsheetApp.flush()` to prevent race conditions during peak booking times.

### **13.3.2 Function & UI Enhancements** {#13.3.2-function-&-ui-enhancements}

* **Separation of Concerns:** Split `getCalendarData` (static schedules) from `getWeeklySchedule` (dynamic data) to improve frontend load times.  
* **Workload Transparency:** Upgraded `getAvailableTALTsForBooking` to return availability flags rather than hiding names, allowing for better human-in-the-loop decision-making.  
* **Logistical Flexibility:** Created `7.27 updateConfirmedBooking` for internal TALT/Lab swaps, explicitly omitting teacher notifications to reduce "inbox noise."  
* **Postponement Safety:** Changed `7.20 postponeBooking` to a "Two-State" logic. The original booking remains valid until the new postponement slot is officially confirmed.

## **13.4 Critical Architectural Wins** {#13.4-critical-architectural-wins}

* **BatchID:** Groups multiple lab periods into one "Request" for unified approval/emailing, significantly reducing teacher inbox fatigue.  
* **Two-State Postponement:** By keeping the original booking "Confirmed" until the new one is approved, we ensure no lab time is accidentally "lost" during a rescheduling attempt.  
* **TimeSlotID:** Using a composite key (Date \+ Period \+ LabID) prevents duplicate bookings at the database level.

# **14\. User Acceptance Testing (UAT) Plan** {#14.-user-acceptance-testing-(uat)-plan}

## **14.1 Core Booking & Selected Slots** {#14.1-core-booking-&-selected-slots}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **1.1** | **Single Slot Booking** | 1\. Click an "Available" slot on the timeline. 2\. Fill in Lab Title, Subject, and Location. | Booking button appears as "Book Selected (1)". Form pre-populates subject/section based on the slot. |
| **1.2** | **Selection Slots (Batch)** | 1\. Click multiple "Available" slots for the same teacher. 2\. Try to click a slot for a *different* subject. | "Smart Section-Blocking" prevents selecting different subjects. Selected slots container updates to "Book Selected (\#)". |
| **1.3** | **Quick-Book Template** | 1\. Select a saved template from the booking form. | Subject, Section, and Period auto-fill. Only Date needs to be selected. |
| **1.4** | **P2 Split-Bell Resolution** | 1\. Book a Period 2 slot for a Grade 11 teacher. 2\. Book a Period 2 slot for a Grade 10 teacher. | System correctly identifies Grade 11 vs 10/12 and assigns the correct Start/End times from the Bell Table. |

## **14.2 Validation & Conflict Handling** {#14.2-validation-&-conflict-handling}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **2.1** | **Teacher Conflict** | 1\. Attempt to book a lab for a teacher at a time they are scheduled in a different classroom. | Warning icon (ⓘ or \!) appears. Message: "Teacher is scheduled for \[Class\] in Room \[X\]". |
| **2.2** | **Lab Room Conflict** | 1\. Attempt to book a Lab Room that is already occupied on Google Calendar. | Warning: "Lab Room already booked for \[Event Name\]". |
| **2.3** | **TALT Overload Bypass** | 1\. Assign a TALT who has exceeded 5 blocks for that day. 2\. Click "Approve". | System shows "BYPASS\_REQUIRED". TALT confirms; HoD receives notification email. |
| **2.4** | **Smart Suggestions** | 1\. Create a conflict (Room booked). 2\. Click "Suggest Alternatives". | Modal displays the next 3 available time slots for that specific section. |

## **14.3 Automation & Integrations** {#14.3-automation-&-integrations}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **3.1** | **Shared Calendar Sync** | 1\. Complete a booking approval. | Event appears on the "MUIDS Shared Lab Calendar" with the correct subject color. |
| **3.2** | **Technician Invitation** | 1\. Check the personal Google Calendar of the assigned TALT. | TALT appears as a "Guest" on the event. Event is visible on their mobile GCal. |
| **3.3** | **Batch Notification** | 1\. Approve a batch of 3 requests at once. | Teacher receives **one** consolidated email summarizing all 3 sessions instead of 3 emails. |
| **3.4** | **Postponement Safety** | 1\. Click "Postpone" on a Confirmed booking. 2\. Cancel the postponement request. | Original booking stays "Confirmed" throughout. Only reverts if the *new* slot is approved. |

## **14.4 TALT Dashboard & Proxy Mode** {#14.4-talt-dashboard-&-proxy-mode}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **4.1** | **Master Dashboard Filters** | 1\. Filter the dashboard by "Biology Lab 1" or "Teacher X". | View updates instantly to show only relevant lab/teacher rows. |
| **4.2** | **Proxy Mode Safety** | 1\. Click "Book for a Teacher". 2\. Select a teacher from the modal. | A high-visibility banner appears: **"Acting as \[Teacher Name\]"**. |
| **4.3** | **Batch Management** | 1\. Open a Pending request that has a BatchID. | A workspace opens allowing different Labs/TALTs to be assigned to each row before one "Final Submit". |

## **14.5 Data Integrity & Maintenance** {#14.5-data-integrity-&-maintenance}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **5.1** | **Primary Key Lock** | 1\. Attempt to type into Column A of the Transactions Sheet. | Google Sheets Range Protection prevents editing. |
| **5.2** | **Manual Re-validation** | 1\. Manually change a teacher's schedule in the TeacherTimeTables sheet. 2\. Run 7.3.1 triggerManualRevalidation. | Conflicting future bookings are flagged as "Action Required" on the Dashboard. |

## **14.6 User Interface (UI/UX)** {#14.6-user-interface-(ui/ux)}

| ID | Test Scenario | Steps to Execute | Expected Result |
| ----- | ----- | ----- | ----- |
| **6.1** | **Dark Mode Toggle** | 1\. Flip the Dark Mode switch. | Entire background, sidebar, and modals shift to a dark theme. |
| **6.2** | **Mobile Layout** | 1\. Open the app on a smartphone or "Inspect" in mobile view. | Sidebar collapses into a hamburger menu; tables become scrollable or transform into cards. |
| **6.3** | **Search Bar** | 1\. Type a specific Lab Title into the dashboard search. | The calendar highlights or filters to that specific booking. |

---

## **How to use this checklist during UAT:** {#how-to-use-this-checklist-during-uat:}

1. **Tester Role:** Assign 1 Technician and 2 Teachers to follow these specific IDs.  
2. **Success Criteria:** A feature is "Passed" only if the "Expected Result" matches the app behavior exactly.  
3. **Bug Reporting:** If a test fails, the tester should record the **ID**, the **Browser** used, and the **Error Message** received.

## **Deployment Checklist** {#deployment-checklist}

- [ ] Confirm all Sheet IDs in `Utils.gs` match the production sheet.  
- [ ] **Calendar Sharing:** Confirm the "Lab Booking Calendar" is shared with 'Write' access to all TALTs.   
- [ ] **Timezone Sync:** Verify all scripts and the spreadsheet are set to `(GMT+7) Bangkok`.   
- [ ] **Email Permissions:** Test that the `talt.muids@mahidol.ac.th` alias has "Send-as" permissions for the script owner.  
- [ ] **Formula Validation:** Validate that all `XLOOKUP` references in the master sheets are pointing to the correct local tabs, not external DEV sheets.   
- [ ] **Database Integrity:** Ensure **Range Protection** is active on Column A of all sheets to prevent manual ID deletion.

# **15\. Project Roadmap & AI-Development Strategy** {#15.-project-roadmap-&-ai-development-strategy}

## **15.1 Phase-Based Roadmap** {#15.1-phase-based-roadmap}

Development will proceed in six distinct phases to ensure each layer of the "brain" is tested before the "face" (UI) is built.

| Phase | Goal | Key Deliverables | AI Prompt Focus |
| ----- | ----- | ----- | ----- |
| **0\. Setup** | **Context Injection**  | 3 Custom Gemini Gems | "Upload PRD v1.1.3c and set System Instructions." |
| **1\. Structure** | **Framework Setup** | Boilerplate .gs and .html files; include() logic. | "Set up the boiler-plate structure and the include() logic for modular HTML." |
| **2\. Design** | **Visual Blueprint** | Tailwind-based UI Spec & "Code-Wireframes." | **Gemini Designer Gem:** Generate Tailwind blueprint.  "Generate a Tailwind CSS theme and layout blueprint using Mahidol Blue." |
| **3\. API Data** | **Data Retrieval** | API\_Read.gs, GCalService | **Claude 3.5:** "Write `API_Read.gs` based on Section 7.1-7.13."  |
| **4a. API Write (Teacher)** | **Core booking submission logic.**  | API\_Write.gs | **Claude 3.5:** "Write `API_Write.gs` using Section 7.14, 7.15,7.19 and 7.27.” |
| **4b. API TALT (Admin)** | **Approval, Outage, and Batch logic.**  | API\_TALT.gs, LockService | **Claude 3.5:** "Write `API_TALT.gs` using Section 7.16-7.26 and LockService." |
| **5\. Frontend** | **User Interface** | Modular HTML/JS components injected into `Index.html`. | **Claude 3.5:** "Build `JS_Modals.html` based on Gemini’s Design Spec."1 |
| **6\. Integration** | **Full Loop** | UAT Checklist Execution & GCal Sync testing. | "Perform a logic audit on CalendarService.gs to ensure Guest invitations work." |

## **15.2 Backend Modularization (The .gs Strategy)**  {#15.2-backend-modularization-(the-.gs-strategy)}

To prevent the AI from overwriting verified logic, the backend is split into specialized files. **Rule:** Only provide the AI with the code for the specific file being edited. 

* **`Main.gs`**: Contains `doGet()` and the `include(filename)` utility.  
* **`Auth.gs`**: Logic for `getUserInfo` and permission levels.  
* **`API_Read.gs`**: All functions that only read from Sheets (e.g., fetching schedules).  
* **`API_Write.gs`**: All functions that write to Sheets (e.g., submitting bookings).  
* **`API_TALT`**: All administrative write functions (Batch approvals, Lab Outages) requiring TALT role verification.   
* **`CalendarService.gs`**: Google Calendar API logic and Guest invitations.  
* **`EmailService.gs`**: GmailApp notification logic and batch email formatting.  
* **`Utils.gs`**: `LockService` wrappers, UUID generators, and Date formatters.  
  * The system core configuration engine. It is strictly forbidden from hardcoding environment IDs (Spreadsheet ID, Calendar ID, Emails) or business limits.   
  * **Mechanism:** Uses \`SpreadsheetApp.getActiveSpreadsheet()\` to remain completely environment-agnostic.  
  * **Core Helper:** Implements \`getConfigValue(key)\`, which searches the \`System\_Config\` tab to return values dynamically on demand.  
  * **Concurrency Control:** Houses the global \`withLock(callback)\` wrapper for clean \`LockService\` execution across writing files. 

## **15.3 Frontend Modularization (Component-Driven Architecture)** {#15.3-frontend-modularization-(component-driven-architecture)}

To achieve absolute isolation and prevent AI hallucinations, and to ensure the AI operates within strict boundaries, the frontend will use a highly granular "Component-by-Component" approach. Every file follows a "Single Responsibility Principle." 

* **The Rule of Isolation:** Every major UI element (especially Modals) will have its own `.html` file containing *both* its HTML layout and its specific JavaScript listener functions.   
* **Naming Convention:** Because the GAS Editor lacks folders, files must be strictly prefixed to group alphabetically (e.g., `Modal_SelectedSlots.html, Modal_Approve.html, UI_Sidebar.html`).  
* **Global Assembly:** The `Index.html` file will serve purely as a skeleton, using the `<?!= include('Filename'); ?>` helper to stitch the components together at runtime.  
* **AI Prompting Benefit:** When updating a specific UI element, the AI will only be provided the specific `Modal_X.html` file, guaranteeing that surrounding application logic remains untouched.

**The Helper (in `Main.gs`):**

```js
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

**The File Structure:**

**Core UI:**

* **`Index.html`**: Main skeleton with \<?\!= include() ?\> assembly.  
* **`Styling.html`**: Tailwind CDN and custom \<style\> overrides.  
* **`JS_Headers.html`**: Manages the "Top of the House" interactivity.   
* **`JS_Utilities.html`**: The centralized library for all cross-component visual effects and data transformations. 

**Logic Layers:**

* **`JS_Core.html`**: Global state management (User role, current week selection).  
* **`JS_TeacherView.html`**: UI logic specifically for teacher-facing timelines.  
* **`JS_TaltView.html`**: UI logic for the Master Dashboard and TALT filters.

**Visual Components:**

* **`UI_Sidebar.html`**: Left sidebar component for TALT filters  
* **`UI_Dashboard.html`**: Main calendar/timeline display area  
* **`UI_Unauthorized.html`**: Landing page for unauthorized users

**Modals (The Popups):**

* **`JS_Modals.html`**: Global UI listeners for modals (e.g., "Click outside to close", "Press ESC to close", locking background scroll)  
* **`Modal_SelectedSlots.html`**: Selected Slots modal (booking multiple slots)  
* **`Modal_BatchAction.html`**: The specialized interface for Batch Actions  
* **`Modal_Approval.html`**: TALT approval/decline interface  
* **`Modal_Details.html`**: Booking details popup  
* **`Modal_Outage.html`**: Manage lab outages  
* **`Modal_Worklaod.html`**: Displays daily/consecutive workload capacity limits for TALTs  
* **`Modal_Welcome.html`**: First-time user onboarding and UI spotlight walkthrough  
* **`Modal_EmailEditor.html`**: Interactive Template Configuration Control Panel 

### **15.3.1 Core UI & Global Assets** {#15.3.1-core-ui-&-global-assets}

| File Name | Functional Scope & Responsibility |
| ----- | ----- |
| **`Index.html`** | The HTML5 Skeleton. Responsible for the `<head>`, global metadata, and the `<?!= include(); ?>` sequence that assembles the app. |
| **`Styling.html`** | Centralized CSS. Contains the Tailwind CDN link and custom `@layer` overrides for "Outage" patterns and glassmorphism effects. |
| **`JS_Header.html`** | Logic for the navigation bar, the Week/Day-Type selector, and the visibility of the "Proxy Mode" status banner. |
| **`JS_Utilities.html`** | Global UI Toolkit. Contains shared functions for `showToast()`, `triggerShimmer()`, icon rendering, and date formatting. |

### **15.3.2 Logic Layers (Controllers)** {#15.3.2-logic-layers-(controllers)}

| File Name | Functional Scope & Responsibility |
| ----- | ----- |
| **`JS_Core.html`** | **The Source of Truth. Manages global state: `userRole`, `currentWeek`, and initialized `labData`. All other JS files pull from here.** |
| **`JS_TeacherView.html`** | Handles click interactions on the timeline, cell highlighting for teachers, and **"Select Slot"** logic.  |
| **`JS_TaltView.html`** | Handles administrative logic: Conflict detection, filtering labs by technician, and the "Batch Manager" toggle. |

### **15.3.3 Visual Components (The Layout)** {#15.3.3-visual-components-(the-layout)}

| File Name | Functional Scope & Responsibility |
| ----- | ----- |
| **`UI_Sidebar.html`** | The TALT Filter Panel. Controls which labs and technician workloads are currently visible on the Dashboard. |
| **`UI_Dashboard.html`** | The Grid Engine. Renders the actual table/flexbox structure of the timeline for both Teachers and TALTs. |
| **`UI_Unauthorized.html`** | Polite guest landing page served exclusively to unlisted users, blocking access to core system code and directing them to the registration protocol.  |

### **15.3.4 Modals (The Interactive Popups)** {#15.3.4-modals-(the-interactive-popups)}

| File Name | Functional Scope & Responsibility |
| :---- | :---- |
| **`JS_Modals.html`** | Shared Modal logic: handling "Click-Outside-to-Close," locking body scroll when active, and opening/closing transitions. |
| **`Modal_SelectedSlots.html`** | The Teacher's staging area. Lists selected slots and handles the "Submit Booking" validation before calling `API_Write.gs`. |
| **`Modal_BatchAction.html`** | The TALT "Inbox." Displays pending bookings in a table for bulk approval/rejection. |
| **`Modal_Approval.html`** | Individual booking workflow. UI for assigning technicians and room numbers to a single request. |
| **`Modal_Details.html`** | The "View Mode" popup. Shows details for an existing booking (Subject, Teacher, Equipment notes). |
| **`Modal_Outage.html`** | Administrative tool for blocking lab slots for maintenance or cleaning. |
| **`Modal_Workload.html`** | Displays real-time TALT daily and consecutive session limits using dynamic progress bars to prevent assignment overload.  |
| **`Modal_Welcome.html`** | Drives the first-time user experience (FTUX) by guiding users through an interactive UI spotlight walkthrough to introduce core features and navigation.  |
| **`Modal_EmailEditor.html`** | This component serves as the layout wrapper for the text editing interface.  |

## **15.4 AI Prompting & Design Specification Workflow** {#15.4-ai-prompting-&-design-specification-workflow}

Instead of using Figma, we will use **"Code-Wireframes"** (via Google Slides) and high-detail text specs to guide the AI.

### **15.4.1 Theme & Layout Principles** {#15.4.1-theme-&-layout-principles}

* **The Palette:** Use **Mahidol Blue** as the primary brand color.  
  * *Status Colors:* Pending (Yellow), Booked (Green), Denied (Red), N/A (Grey).  
* **The Layout:** Responsive grid. Sidebar for TALT filters (left), Navigation on top, Calendar/Timeline in the center.  
* **UI Safety Features:** \* **"Acting as" Banner:** High-visibility (Bright Yellow/Orange) at the top of the screen when in Proxy Mode.  
  * **Loading States:** Use "Skeleton" screens while `API_Read` functions are fetching data.

### **15.4.2 The "Code-Wireframe" Prompt Template** {#15.4.2-the-"code-wireframe"-prompt-template}

> *"Generate a description of the 'Selected Slots' UI. Use a table to show the 'Before Click' and 'After Click' states. List the Tailwind classes that should be used for the 'Selected' slot (e.g., `bg-blue-100 ring-2 ring-blue-500`)."*

## **15.5 AI Collaboration & Copy-Paste Protocol** {#15.5-ai-collaboration-&-copy-paste-protocol}

To maintain version control during manual copy-pasting, the following protocols are mandatory:

### **15.5.1 The "System Instruction" for AI** {#15.5.1-the-"system-instruction"-for-ai}

* **Editing:** \> "When I ask for a change, please only provide the code for the specific file I am working on. Do not suggest changes to other files unless I ask. Always provide the full code for that specific file so I can copy-paste it directly to the Google Apps Script editor."  
* **Instruction for Claude:** \> "You are an expert Google Apps Script developer. You are building the MUIDS Lab Booking App. You will be provided with modular files and design specs from a Gemini Designer Gem. **Strictly follow the file-splitting strategy in PRD Section 15\.** Do not combine files. Use Tailwind CSS for all UI elements. Your primary goal is to turn Gemini's wireframe descriptions into functional, error-resistant code." 

### **15.5.2 Version Headers** {#15.5.2-version-headers}

Every file in the GAS editor must begin with a version header to track sync status: `// File: API_Write.gs | Version: 1.1.3c | Last Edit: [Date]`

### **15.5.3 The Gemini-to-Claude Hand-off Protocol** {#15.5.3-the-gemini-to-claude-hand-off-protocol}

To prevent code regressions, the following workflow is mandatory: 

* **The Context Injection:** At the start of every new Claude project or long chat, upload the **Full PRD v1.1.3c** and the **Google Slides Export (PDF)**. Paste the **Section 15.7 System Prompt** as the first message to "prime" the AI.   
  1. The Component Header (For Modals & UI Fragments)  
     Use this for files like `Modal_SelectedSlots.html`, `UI_Sidebar.html`, etc. These files should **not** contain `<html>` or `<body>` tags, as they are "injected" into the main skeleton.

```html
<div id="[Component-ID]" class="hidden fixed inset-0 z-50 ...">
  </div>

<script>
  /**
   * Component-Specific Logic
   * Note: Global state is handled in JS_Core.html
   */
   function handle[ComponentName]Action() {
     // JS Logic here
   }
</script>
```

  2. The Main Skeleton Header (`Index.html`)  
     This is the only file that contains the standard HTML structure. It acts as the "Glue."

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <?!= include('Styling'); ?>
  </head>
  <body class="bg-slate-50 text-slate-900">
    
    <div id="proxy-banner" class="hidden bg-amber-400 p-2 text-center font-bold">
      Acting as: <span id="proxy-user-name"></span>
    </div>

    <div id="app-container" class="flex h-screen overflow-hidden">
      <?!= include('UI_Sidebar'); ?>
      
      <main class="flex-1 overflow-y-auto p-6">
        <?!= include('UI_Dashboard'); ?>
      </main>
    </div>

    <?!= include('Modal_SelectedSlots'); ?>
    <?!= include('Modal_Approval'); ?>

    <?!= include('JS_Core'); ?>
  </body>
</html>
```

  3. Why this Header matters for non-Pro users  
     When you paste an existing file into a new Claude chat, Claude will read that top comment and immediately know:  
     * **The Version:** (v1.1.3c) so it doesn't suggest old v1.0 logic.  
     * **The Module:** So it doesn't try to add Sidebar logic into a Modal file.  
     * **The Logic Reference:** If it sees "Section 7.14," it will look at that specific part of your uploaded `prd.md` to ensure the function names match.  
* **Plan with Gemini:** Ask the Gemini Wireframe Designer Gem: *"Using PRD Section 7.17, describe the visual behavior of the Approval Modal and provide a Code-Wireframe using Tailwind classes."*  
* **Code with Claude:** Copy Gemini’s output and paste it into Claude: *"I am working on `JS_Modals.html`. Based on this design spec from Gemini \[Paste Spec\], write the code for the Approval Modal. Ensure it calls `google.script.run.approveBooking()`."*  
* **Step 0 (Context Injection):** Before any Claude coding session, upload the **PRD v1.1.3c** and the **Google Slides PDF**. Paste the **Section 15.7 System Prompt** as the first message to "prime" the AI.

## **15.6 AI Agent Configuration & Multi-AI Workflow** {#15.6-ai-agent-configuration-&-multi-ai-workflow}

To ensure consistency, two specialized Gemini Gems will be created. These Gems act as the "Visionary" and "Strategist" while Claude 3.5 Sonnet acts as the "Lead Engineer."

### **15.6.1 Gemini’s Gem: The Spec Describer** {#15.6.1-gemini’s-gem:-the-spec-describer}

* **Platform:** Google Gemini.  
* **Role:** UX/UI Analyst and Wireframe Designer.  
* **Knowledge Base:** PRD v1.1.3c \+ Google Slides Design Spec.  
* **Description:** Describing visual layouts, translating functional requirements into "Code-Wireframes," and providing step-by-step instructions for Google Slides creation.  
* **Instructions:**  
  * **Identity & Goal:** You are the "Spec Describer," a Senior UX/UI Analyst for the MUIDS Lab Booking App. Your sole purpose is to act as the bridge between the functional requirements in the PRD and the code implementation by Claude (the Engineer). You translate "what the app does" into "exactly how the app looks and feels" using Tailwind CSS and Google Slides layouts.  
  * **Knowledge Base:**  
    * **Primary:** PRD v1.1.3c (.md file).  
    * **Secondary:** Google Slides Design Spec (Visual reference).  
  * **Core Principles (from Section 4.4.1):**  
    * **Clarity:** Prioritize unambiguous info (lab availability, status).  
    * **Efficiency:** Minimize clicks (Selected Slots / Batch flows).  
    * **Consistency:** 8px grid system, Mahidol Blue theme.  
    * **Safety:** High-visibility "Acting As" banner in Proxy Mode (Bright Yellow/Orange).  
    * **Accessibility:** Use icons \+ colors for status (Pending: Yellow, Booked: Green, Denied: Red).  
  * **Your Task Workflow:** When the user asks about a feature or a Section 7 API function, you must provide:  
    * **Spatial Hierarchy:** Describe where the element sits on the screen (e.g., "Centered Modal," "Fixed Top Banner," "Left Sidebar").  
    * **The "Code-Wireframe" (Section 15.4.2):**  
      * Provide a table showing the UI state "Before Interaction" vs "After Interaction."  
      * List the specific Tailwind CSS classes for the primary elements.  
    * **Claude-Ready Instructions:**  
      * Write a sUse flex-col for the pecific "Design Spec" block that the user can copy/paste to Claude.  
      * Example: "Use flex-col for the selected slots list, bg-blue-50 for selected slots, and animate-pulse for loading states."  
  * **Mandatory Rules:**  
    * **No Figma:** Do not suggest Figma. Always suggest Google Slides or direct Tailwind descriptions.  
    * **Modular Awareness:** Remind the user which file they should be working on (e.g., Modal\_SelectedSlots.html or JS\_TeacherView.html) based on Section 15.3.  
    * **Version Control:** Always reference that these specs are for v1.1.3c.  
  * **Example Response Style:** "For Function 7.14 (Submit Batch), the UI should be a 'Confirmation Modal.  
    * **Layout:** 400px width, rounded-lg, backdrop-blur.  
    * **Tailwind:** bg-white p-6 shadow-xl border-t-4 border-muids-blue.  
    * **Interaction:** The 'Confirm' button should transition to cursor-not-allowed and show a spinner upon click.”

### **15.6.2 Gemini’s Gem: The Wireframe Designer** {#15.6.2-gemini’s-gem:-the-wireframe-designer}

* **Platform:** Google Gemini.  
* **Role:** UX/UI Analyst and Designer  
* **Knowledge Base:** PRD v1.1.3c \+ Desing Spec  
* **Description:** Specialized Layout Strategist for the MUIDS Lab Booking App. This Gem translates PRD functional requirements into visual spatial arrangements within Google Slides. It provides step-by-step instructions and 'Gemini in Slides' prompts to create functional wireframes based on an 8px grid and Mahidol Blue branding.  
* **Given Instructions:**   
  * **Identity & Role:** You are the "Wireframe Designer." Your role is to guide the user in creating a visual "Source of Truth" in Google Slides. You understand that these slides will later be interpreted by Claude (the Engineer), so visual accuracy and spatial consistency are paramount.  
  * **Knowledge Base:**  
    * Primary: PRD v1.1.3c (.md file).  
    * Secondary: Design\_Spec (.md file \- once available).  
  * **Visual Standards (Section 4.4.1 & 4.4.3):**  
    * **Grid:** Everything must align to an **8px grid**.  
    * **Branding:** Primary color is **Mahidol Blue** (Hex codes in Section 4.4.2).  
    * **Dark Mode:** Always provide a high-contrast dark version description for every screen.  
    * **Feedback:** Ensure every wireframe accounts for **Progressive Loading States** (Skeletons for the calendar, spinners for buttons).  
  * **Your Task Workflow:** When asked to design a specific screen or modal from the PRD, you must provide:  
    * **Layout Strategy:**  
      * Define the "Z-index" (what's on top).  
      * Describe the layout (e.g., "3-column layout for the Dashboard," "Overlay Modal for the Selected Slots staging container").  
    * **"Gemini in Slides" Prompts:**  
      * Provide exact text prompts the user can paste into the "Help me create an image" or layout tool in Google Slides.  
      * Example: *"Generate a clean, professional sidebar UI for a school app, using a dark blue theme with icons for 'Calendar', 'History', and 'Settings'."*  
    * **Component Placement (Step-by-Step):**  
      * **Step 1:** "Place a fixed banner at the top (height: 60px) for the 'Acting As' notification."  
      * **Step 2:** "Create a 7-column grid for the weekly schedule."  
      * **Step 3:** "Add a floating action button (FAB) in the bottom right for 'Add New Booking'."  
    * **The "Safety" Check:**  
      * Always ensure the **"Acting As" Banner** is prominently visible in any TALT/Proxy-mode wireframe.  
      * Check for **Error States**: Remind the user to create a slide showing what happens when the GCal API fails.  
  * **Mandatory Rules:**  
    * **No Fluff:** Keep instructions surgical and easy to follow while clicking around in Google Slides.  
    * **AI-Collaboration:** Remind the user that these slides will eventually be used to generate "Code-Wireframes" for Claude.  
    * **Consistency:** If the user asks for a button, ensure you specify the "Mahidol Blue" hex and the rounded-corner radius (e.g., `rounded-md`).

**15.6.3 Claude 3.5 Sonnet (The Engineer)**

* **Platform:** Anthropic Claude.  
* **Role:** Lead Google Apps Script Developer.  
* **Focus:** Writing the actual `.gs` and `.html` code.  
* **Collaboration Protocol:** Claude will receive the **Design Specs** generated by the Gemini Designer Gem. Claude is instructed to follow the modular file structure defined in Section 15.2.

## **15.7 Claude Lead Engineer System Prompt** {#15.7-claude-lead-engineer-system-prompt}

"You are an expert Google Apps Script developer building the MUIDS Lab Booking App. You will be provided with specific Design Specs from Gemini Designer Gems.

1. **Modular Architecture:** Strictly adhere to the file structure in PRD Section 15.2. Never combine files.  
2. **Scope Control:** Only rewrite the specific file or function requested to prevent hallucinations.  
3. **UI Engine:** Use Tailwind CSS for all elements.  
4. **Logic Priority:** Refer to PRD Section 7 for all API logic and Section 13.3 for concurrency (LockService)."  
5. **Design Fidelity:** When a Gemini Design Spec is provided, treat the Tailwind classes and spatial descriptions as a **hard requirement**. Do not use default HTML styling if a Tailwind alternative is specified"   
6. Initial prompt:  
   1. **Role:** You are the **Lead Engineer (Claude 3.5 Sonnet)** for the MUIDS Lab Booking App. I have uploaded the **PRD v1.1.3c** as your primary knowledge base.  
   2. **Your Mission:** To build a modular, high-performance Google Apps Script application using Tailwind CSS, following the specific architectural rules in Section 15\.  
   3. **Core Operating Instructions:**  
      1. **Modular Architecture (Section 15.2/15.3):** You must strictly follow the file-splitting strategy. If I ask for a feature, identify which specific `.gs` or `.html` file it belongs to. Do NOT combine files.  
      2. **Design Fidelity:** I will provide "Design Specs" from my Gemini Designer Gem. You must treat these as hard requirements, especially Tailwind classes and spatial hierarchy.  
      3. **Logic Priority:** Section 7 is the absolute source of truth for API logic. Section 13.3 is the source of truth for concurrency (LockService).  
      4. **No Hallucinations:** If a functional requirement is missing from the PRD, ask me for clarification rather than guessing.  
      5. **Admin Isolation:** Administrative functions (Approvals/Outages) must reside in `API_TALT.gs`. Use the `admin` prefix for these functions to distinguish them from standard teacher requests in `API_Write.gs`.   
   4. **Immediate Action:** Please acknowledge that you have read the PRD. Briefly summarize the **"1:1 Mirror Promotion Protocol" (Section 17.2)** and the **"Frontend Component-Driven Architecture" (Section 15.3)** to demonstrate you understand how we will maintain code safety.  
   5. **Once confirmed, wait for my first task: The System Health Check.**

## **15.8 File Header Protocol** {#15.8-file-header-protocol}

Every file generated by Claude must begin with a comment block to maintain context during "Context Injection" resets.

### **15.8.1 For .gs files** {#15.8.1-for-.gs-files}

`// File: [Filename].gs | Project: MUIDS Lab Booking App | Module: [API/Service/Core]`

### **15.8.2 For .html files** {#15.8.2-for-.html-files}

* The Component Header (For Modals & UI Fragments)

Use this for files like `Modal_Cart.html`, `UI_Sidebar.html`, etc. These files should **not** contain `<html>` or `<body>` tags, as they are "injected" into the main skeleton.

```html
<div id="[Component-ID]" class="hidden fixed inset-0 z-50 ...">
  </div>

<script>
  /**
   * Component-Specific Logic
   * Note: Global state is handled in JS_Core.html
   */
   function handle[ComponentName]Action() {
     // JS Logic here
   }
</script>
```

* The Main Skeleton Header (`Index.html`)

This is the only file that contains the standard HTML structure. It acts as the "Glue."

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <?!= include('Styling'); ?>
  </head>
  <body class="bg-slate-50 text-slate-900">
    
    <div id="proxy-banner" class="hidden bg-amber-400 p-2 text-center font-bold">
      Acting as: <span id="proxy-user-name"></span>
    </div>

    <div id="app-container" class="flex h-screen overflow-hidden">
      <?!= include('UI_Sidebar'); ?>
      
      <main class="flex-1 overflow-y-auto p-6">
        <?!= include('UI_Dashboard'); ?>
      </main>
    </div>

    <?!= include('Modal_Cart'); ?>
    <?!= include('Modal_Approval'); ?>

    <?!= include('JS_Core'); ?>
  </body>
</html>
```

* Why this Header matters for non-Pro users

When you paste an existing file into a new Claude chat, Claude will read that top comment and immediately know:

1. **The Version:** (v1.1.3c) so it doesn't suggest old v1.0 logic.  
2. **The Module:** So it doesn't try to add Sidebar logic into a Modal file.  
3. **The Logic Reference:** If it sees "Section 7.14," it will look at that specific part of your uploaded `prd.md` to ensure the function names match.

# **16\. Disaster Recovery** {#16.-disaster-recovery}

## **16.1 Error Recovery Scenarios** {#16.1-error-recovery-scenarios}

* **GCal Sync Failure:** If `Service_GCal` fails during approval, the Transaction status is set to "Error (Calendar)". A manual "Retry Sync" button will appear on the TALT Dashboard.  
* **Sheet Corruption:** The system relies on Google Drive's "Version History." In case of accidental data deletion, TALTs should revert the spreadsheet to the last hourly backup.  
* **Lock Conflict:** If `LockService` times out, the user receives a "System Busy" toast and is prompted to wait 10 seconds before retrying.

# **17\. Deployment & Environment Strategy** {#17.-deployment-&-environment-strategy}

## **17.1 Environment Separation** {#17.1-environment-separation}

The system will maintain two identical Google Cloud/Apps Script environments:

1. **DEVELOPMENT (DEV):** Linked to a "Test Lab Sheet." All new AI-generated features and UI changes are implemented and tested here first.  
2. **PRODUCTION (PROD):** The live system used by teachers. No code is ever written directly in PROD.

## **17.2 The 1:1 Mirror Promotion Protocol** {#17.2-the-1:1-mirror-promotion-protocol}

To move a feature from DEV to PROD after successful UAT:

* **No Merging:** Do not manually combine or "stitch" code chunks.  
* **File Replacement:** Copy the full content of the modular file (e.g., `API_Write.gs`) from the DEV project.  
* **Total Overwrite:** Paste it into the corresponding file in the PROD project, overwriting the old version entirely.  
* **Verification:** Run the `System_HealthCheck.gs` in PROD immediately after promotion.

