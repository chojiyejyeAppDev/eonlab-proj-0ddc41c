# Design Specification

Generated: 2026-03-04 15:21
---

# Design Specification: 추론 탐정 (Inference Detective)

## Layout

### Overall Structure
The application employs a consistent two-column layout for core gameplay on larger screens, adapting to a single-column or tabbed layout on smaller devices. A persistent header provides navigation and user status, while modals handle specific interactions like hints, feedback, and monetization prompts.

*   **Header (Persistent):** Top of the screen. Contains app logo, user avatar/nickname, current level, hint point display, and main navigation links (e.g., Home, Dashboard, My Page).
*   **Main Content Area:** Below the header.
    *   **Gameplay Screen (Desktop/Tablet):**
        *   **Left Pane (Passage Area):** Occupies ~40-50% width. Displays the non-fiction passage and conclusion statement.
        *   **Right Pane (Inference Path Assembly Area):** Occupies ~50-60% width. Contains the draggable sentence slots, logical connection feedback, and action buttons.
    *   **Dashboard/Other Screens:** Full width, with content arranged in a grid or list format.
*   **Modals:** Overlays the main content for focused interactions (e.g., Hint, Level Up, Daily Limit, Error Feedback).

### Component Hierarchy

**1. Main Game Screen (`/play/:levelId/:problemId`)**
*   `Header`
    *   `App Logo`
    *   `User Avatar`
    *   `User Nickname`
    *   `Level Indicator`
    *   `Hint Point Display`
    *   `Navigation Menu`
*   `Game Container` (Flexbox/Grid for two panes)
    *   `Passage Area` (Left Pane)
        *   `Problem Title/Level`
        *   `Passage Text`
            *   `Sentence Card` (Multiple, draggable)
        *   `Conclusion Statement`
    *   `Inference Path Assembly Area` (Right Pane)
        *   `Path Slots Container`
            *   `Inference Slot` (Multiple, droppable)
                *   `Sentence Card` (When placed)
            *   `Logical Connection Indicator` (Between slots)
        *   `Action Buttons Container`
            *   `Hint Button`
            *   `Submit Path Button`
*   `Modal Container` (Hidden by default, for various modals)

**2. Growth Dashboard (`/dashboard`)**
*   `Header`
*   `Dashboard Container`
    *   `Dashboard Navigation` (e.g., Accuracy, Errors, Hint Usage)
    *   `Performance Chart` (e.g., Line graph for accuracy)
    *   `Error Pattern Analysis Card`
    *   `Hint Dependency Chart`
    *   `Inference Style Report Card`

**3. Daily Limit Exceeded Modal (Global)**
*   `Modal Overlay`
    *   `Modal Content`
        *   `Title: "오늘 분량을 다 사용했어요!"`
        *   `Description: "아래 방법으로 문제를 더 풀 수 있어요."`
        *   `Call to Action Button: "친구 초대"`
        *   `Call to Action Button: "광고 시청"`
        *   `Call to Action Button: "구독 전환"`

## Components

### Header
*   **Purpose:** Global navigation, branding, and status display.
*   **Visual Description:** Fixed at the top. Dark background with light text/icons. App logo on the left. User info (avatar, nickname, level, hint points) on the right. Clear separation of elements.
*   **States:**
    *   **Default:** Displays all elements.
    *   **Hover (Navigation Items):** Subtle background change or underline.
    *   **Active (Navigation Items):** Distinct highlight to indicate current page.
*   **Responsive Behavior:**
    *   **Desktop/Tablet:** Full width, all elements visible. Navigation could be a set of links.
    *   **Mobile:** Logo, minimal user info (e.g., avatar, level), and a hamburger menu icon for navigation. Hint points might be condensed or moved into the menu.

### Passage Area
*   **Purpose:** Display the non-fiction text for analysis.
*   **Visual Description:** A scrollable container with a light background. Passage sentences are clearly delineated, each acting as a draggable element. The conclusion statement is presented prominently below the passage.
*   **States:**
    *   **Default:** Sentences are plain text.
    *   **Sentence Hover:** Subtle background highlight (e.g., `brand-primary-light` or `gray-100`).
    *   **Sentence Dragging:** `Sentence Card` component takes over visual.
    *   **Hint Highlight (Level 1-2):** Specific sentences highlighted with a distinct background color (e.g., `brand-secondary-light`).
*   **Responsive Behavior:**
    *   **Desktop/Tablet:** Occupies left pane. Fixed width or flexible within its container.
    *   **Mobile:**
        *   Option A (Tabbed): Entirely hidden behind a "Passage" tab, with the "Inference Path" tab active for assembly.
        *   Option B (Vertical Scroll): Stacks above the Inference Path Assembly Area, occupying full width. User scrolls to read, then scrolls down to interact with slots.

### Sentence Card (Draggable)
*   **Purpose:** Represents an individual sentence from the passage that can be dragged into inference slots.
*   **Visual Description:** A rectangular card with a subtle border and background. Contains the sentence text.
*   **States:**
    *   **Default (in Passage):** `background-light`, `text-primary`, `border-subtle`.
    *   **Hover (in Passage):** `background-brand-primary-light`, `text-primary`.
    *   **Dragging:** Slightly reduced opacity, a subtle drop shadow, and follows the cursor.
    *   **Placed (in Slot):** `background-brand-primary-dark`, `text-on-primary`, `border-none`. Slightly smaller font size to fit.
    *   **Error (Post-submission):** `background-error-light`, `text-error-dark`, `border-error`.
*   **Responsive Behavior:**
    *   **All:** Adjusts width to fit container. Font size scales appropriately.

### Inference Slot (Droppable)
*   **Purpose:** A placeholder for placing a sentence as part of the inference path.
*   **Visual Description:** A rectangular container with a dashed border when empty. When a sentence is dragged over it, it highlights as a valid drop target. When filled, it contains a `Sentence Card`.
*   **States:**
    *   **Empty:** `background-gray-100`, `border-dashed-gray-400`, `text-gray-500` ("문장을 드래그하세요").
    *   **Drag Over:** `background-brand-primary-light`, `border-solid-brand-primary`.
    *   **Filled:** Contains a `Sentence Card`.
    *   **Error (Post-submission):** `border-error-dark`.
*   **Responsive Behavior:**
    *   **Desktop/Tablet:** Arranged vertically.
    *   **Mobile:** Arranged vertically, potentially taking up full width.

### Logical Connection Indicator
*   **Purpose:** Provide real-time visual feedback on the logical strength between two adjacent sentences in the inference path.
*   **Visual Description:** A vertical line or arrow connecting two `Inference Slots`. Displays a color-coded icon (🟢🟡🔴) and optionally a short text label.
*   **States:**
    *   **Strong Connection (🟢):** `color-success`, icon: green circle/checkmark. Text: "강한 연결"
    *   **Weak/Moderate Connection (🟡):** `color-warning`, icon: yellow triangle/exclamation. Text: "약한 연결"
    *   **Logical Disconnect (🔴):** `color-error`, icon: red cross/circle. Text: "논리 단절"
    *   **Empty:** Not displayed or a neutral gray line.
*   **Responsive Behavior:**
    *   **All:** Positioned centrally between slots.

### Hint Button
*   **Purpose:** Allows users to request a hint for the current step.
*   **Visual Description:** A distinct button, often with an icon (e.g., lightbulb, question mark). Displays current hint points.
*   **States:**
    *   **Default:** `background-brand-secondary`, `text-on-secondary`.
    *   **Hover:** `background-brand-secondary-darker`.
    *   **Disabled (No points or Level 7):** `background-gray-300`, `text-gray-500`, cursor: `not-allowed`.
*   **Responsive Behavior:**
    *   **All:** Positioned near the `Inference Path Assembly Area`.

### Submit Path Button
*   **Purpose:** Submits the assembled inference path for validation.
*   **Visual Description:** Primary call to action button.
*   **States:**
    *   **Default:** `background-brand-primary`, `text-on-primary`.
    *   **Hover:** `background-brand-primary-darker`.
    *   **Disabled (Path incomplete):** `background-gray-300`, `text-gray-500`, cursor: `not-allowed`.
    *   **Active (Click):** Briefly shows a pressed state.
*   **Responsive Behavior:**
    *   **All:** Prominently displayed at the bottom of the `Inference Path Assembly Area`.

### Level Up Modal
*   **Purpose:** Celebrate user achievement upon leveling up.
*   **Visual Description:** A full-screen or large modal overlay with an animated background (e.g., sparkling, rising particles). Prominent "Level Up!" text, new level number, and a short celebratory message.
*   **States:**
    *   **Active:** Appears after fulfilling level-up conditions.
*   **Responsive Behavior:**
    *   **All:** Full-screen overlay. Animations adapt to screen size.

### Daily Limit Exceeded Modal
*   **Purpose:** Inform free users they've reached their daily problem limit and offer options for continued play or upgrade.
*   **Visual Description:** A centrally positioned modal with a clear title, descriptive text, and three distinct call-to-action buttons. Buttons are designed to be persuasive but not overly aggressive.
*   **States:**
    *   **Active:** Appears when a free user tries to access a problem after exhausting their daily limit.
*   **Responsive Behavior:**
    *   **All:** Centered modal, buttons stack vertically on mobile.

### Growth Dashboard Components (Charts, Cards)
*   **Purpose:** Visualize user progress and provide insights.
*   **Visual Description:**
    *   **Charts:** Clean, minimalist line or bar graphs with clear labels, legends, and tooltips on hover. `brand-primary` for primary data, `brand-secondary` for comparison.
    *   **Cards:** Rectangular containers with titles, summary metrics, and detailed insights.
*   **States:**
    *   **Default:** Displays data.
    *   **Hover (Chart Data Point):** Shows tooltip with specific values.
    *   **Loading:** Displays a spinner or skeleton loader.
*   **Responsive Behavior:**
    *   **Desktop/Tablet:** Arranged in a grid (e.g., 2 or 3 columns).
    *   **Mobile:** Stacked vertically, full width. Charts may simplify or become scrollable horizontally.

## Design Tokens

### Colors
*   **Primary (Brand):**
    *   `--color-brand-primary-darker`: #2C3E50 (Dark Blue - for deep accents, text on light backgrounds)
    *   `--color-brand-primary`: #34495E (Medium Dark Blue - main action buttons, active states)
    *   `--color-brand-primary-light`: #ECF0F1 (Light Gray-Blue - subtle backgrounds, hover states)
*   **Secondary (Accent/Hint):**
    *   `--color-brand-secondary`: #E67E22 (Orange - for hints, secondary actions)
    *   `--color-brand-secondary-darker`: #D35400 (Darker Orange)
*   **Background:**
    *   `--color-background-page`: #F8F9FA (Very Light Gray - overall page background)
    *   `--color-background-component`: #FFFFFF (White - for cards, modals, content panes)
    *   `--color-background-header`: #212F