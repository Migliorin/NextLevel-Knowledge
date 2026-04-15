# Design System Document: The Intelligent Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Scholar"**
This design system moves away from the "busy" nature of traditional SaaS dashboards and toward a high-end, editorial experience. We are not building a tool; we are crafting a digital workspace that feels like a quiet, sunlit library. 

To break the "template" look, we utilize **The Architectural Scholar** philosophy: 
- **Intentional Asymmetry:** Important actions are offset, using negative space to draw the eye rather than loud banners.
- **Tonal Depth:** We abandon 1px borders in favor of "Paper-on-Stone" layering, where depth is communicated through shifts in surface temperature.
- **Editorial Authority:** Leveraging a sophisticated mix of `Manrope` for display and `Inter` for utility creates a sense of high-value intelligence.

---

## 2. Colors: Tonal Architecture
The palette is built on deep, authoritative blues (`primary`) and a sophisticated range of cool grays (`surface`).

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section off the interface. Boundaries must be defined solely through background color shifts or tonal transitions. 
*   *Example:* A sidebar should be `surface_container_low` sitting against a `background` main stage.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine vellum.
- **Base Layer:** `surface` (#f8fafb)
- **Primary Containers:** `surface_container_low` (#f2f4f5)
- **Elevated Interactive Zones:** `surface_container_lowest` (#ffffff) for the highest contrast.
- **Inset Metadata/Search:** `surface_container_high` (#e6e8e9) to create a "carved" look.

### The Glass & Signature Texture Rule
For floating AI elements or Chat Bubbles, use **Glassmorphism**:
- **Background:** `surface_container_lowest` at 80% opacity.
- **Effect:** `backdrop-blur: 12px`.
- **Signature Gradient:** For primary CTAs (e.g., "Analyze PDF"), use a subtle linear gradient from `primary` (#00346f) to `primary_container` (#004a99) at a 135-degree angle. This adds a "soul" to the action that flat hex codes lack.

---

## 3. Typography: The Editorial Scale
We use two distinct typefaces to balance character with functional clarity.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-intellectual" feel.
    *   `display-lg`: 3.5rem (Use for hero statements and empty-state invites).
    *   `headline-sm`: 1.5rem (The standard for PDF titles and Chatbot names).
*   **Utility & Reading (Inter):** Chosen for its extreme legibility at small sizes.
    *   `title-md`: 1.125rem (Medium weight for primary navigation and button labels).
    *   `body-md`: 0.875rem (The workhorse for AI chat responses and document summaries).
    *   `label-sm`: 0.6875rem (Used for "Document Metadata" or "Last Modified" timestamps).

---

## 4. Elevation & Depth: Tonal Layering
Traditional box-shadows are often clumsy. We use **Ambient Depth**.

*   **The Layering Principle:** To lift a card, do not add a shadow immediately. First, place a `surface_container_lowest` card on a `surface_container_low` background. The subtle contrast is enough for the human eye.
*   **Ambient Shadows:** For "Floating Action Buttons" or "Active Chat Modals," use a shadow with a 24px blur, 0px offset, and 4% opacity using the `on_surface` color.
*   **The "Ghost Border" Fallback:** If a container requires definition against an identical background (e.g., a white tooltip on a white document), use `outline_variant` (#c2c6d3) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components: Functional Elegance

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`), `xl` roundedness (0.75rem). No border.
- **Secondary:** `surface_container_high` background with `on_surface` text. This feels like a "part of the page" rather than an added element.
- **Tertiary:** Pure text using `primary_fixed_variant` with a soft `surface_container` hover state.

### File Upload Zones (The "Canvas")
- **Style:** Instead of a dashed line, use a large area of `surface_container_low` with `xl` rounding.
- **Interaction:** On drag-over, transition the background to `primary_fixed` (#d7e2ff) with a "Ghost Border" of `primary` at 20%.

### Chat Bubbles & AI Interaction
- **User Bubbles:** `surface_container_highest` (#e1e3e4). This keeps user input feeling grounded.
- **AI Bubbles:** `surface_container_lowest` (#ffffff) with a 2px left-accent bar of `surface_tint`. This distinguishes the AI as the "active light" in the conversation.
- **Separation:** Forbid dividers. Use 24px of vertical white space between message clusters.

### Input Fields
- **Resting:** `surface_container_low` background, no border, `md` roundedness. 
- **Active:** Background remains, but add a 1px "Ghost Border" of `primary` at 40% and a subtle glow using `primary_fixed`.

---

## 6. Do's and Don'ts

### Do:
- **Do** prioritize white space over lines. If you think you need a divider, try adding 16px of padding instead.
- **Do** use `tertiary` (#5f2200) sparingly for "Insight" highlights—small chips that denote an AI-found "Key Takeaway."
- **Do** align typography to a strict baseline grid to maintain the editorial "Scholar" feel.

### Don't:
- **Don't** use pure black (#000000). Use `on_surface` (#191c1d) for all text to keep the interface feeling premium and soft.
- **Don't** use `DEFAULT` (0.25rem) rounding for large containers. Use `xl` (0.75rem) to maintain a modern, friendly silhouette.
- **Don't** stack more than three levels of surface nesting. If you need a fourth level, use a Glassmorphism overlay.

### Accessibility Note:
While we utilize tonal shifts, ensure the contrast between `on_surface` and its containing `surface` meets WCAG AA standards. When in doubt, increase the contrast by moving one step down the surface tier (e.g., move the background from `low` to `dim`).