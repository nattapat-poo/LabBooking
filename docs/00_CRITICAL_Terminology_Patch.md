# **Terminology Override Protocol: "Cart" to "Slots/Batch"**

**Date:** Immediate Effect  
**Target:** All AI Agents (Lead Engineer, Auditor, Spec Describer)  
**Context:** The MUIDS Lab Booking Application V1.1.3b is deprecating all e-commerce terminology ("Cart", "Checkout") in favor of scheduling-native terminology ("Slots", "Batch"). 

## **1. The Core Replacement Dictionary**

All future analysis, PRD referencing, Design Spec writing, and Code Generation must strictly adhere to the following terminology swaps, regardless of what is currently written in the base PRD or Design Spec text:

| Old Terminology (Deprecated) | New Terminology (Active) | Context / Usage |
| :--- | :--- | :--- |
| **Selection Cart** | **Selected Slots** | The UI staging area / container where users accumulate slots before submission. |
| **Cart** | **Batch** | The data payload / transaction type when submitting multiple slots to the server. |
| **Add to Cart** | **Select Slot** | The action/button of adding a time block to the staging area. |
| **Checkout / Submit Cart** | **Submit Batch** | The action/button of sending the selected slots to the backend API. |

## **2. Codebase & Architectural Directives (For Lead Engineer)**

When writing or reviewing code, the Engineer must enforce this naming convention across the entire stack:

* **Frontend Files:** Do not use `View_Cart.html`. Use `View_SelectedSlots.html`.
* **State Management (JS):** * `let cart = [];` ❌ (Prohibited)
    * `let selectedSlots = [];` ✅ (Approved)
* **Function Naming:**
    * `addToCart(slotId)` ❌ (Prohibited)
    * `toggleSlotSelection(slotId)` ✅ (Approved)
    * `submitCart()` ❌ (Prohibited)
    * `submitBatchBooking()` ✅ (Approved)
* **Backend Naming (Apps Script):** * Server payloads should expect a `batch` array, not a `cart` array.

## **3. Compliance Mandate (For Auditor & Spec Describer)**

* **Zero Regression:** If any agent detects the word "Cart" in newly generated code, UI mockups, or documentation, it must immediately flag it as a **Severity 1** violation of the Ubiquitous Language protocol.
* **Mental Mapping:** When reading PRD 1.1.3b or Design Spec 1.1.3b, agents must dynamically translate "Selection Cart" to "Selected Slots" in their working memory. Do not explicitly point out the discrepancy in every prompt; just output the new terminology seamlessly.

## **4. Universal Response Envelope Protocol (`gas-best-practices` Standard)**

All backend APIs and client wrappers must strictly enforce the `gas-best-practices` `Result<T>` envelope standard:
* **Server Return Payload (Success):** `{ ok: true, success: true, ...data/payload, message: "..." }`
* **Server Return Payload (Failure):** `{ ok: false, success: false, message: "...", error: "..." }`
* **Client Handlers:** Always evaluate `res.ok` (or `res.ok || res.success`) to branch logic.
* **Exception Boundary:** Never allow unhandled raw exceptions to escape server methods across `google.script.run`. Catch all exceptions and return the standard failure envelope.