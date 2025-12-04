# Design Guidelines: RFP Automation Platform

## Design Approach
**System-Based Approach** inspired by Linear and Notion - modern productivity tools optimized for data clarity and workflow efficiency. This is a utility-focused application prioritizing information density, clean data presentation, and professional workflows over visual storytelling.

**Reference Products**: Linear (clean productivity UI), Notion (data organization), Asana (task management), Airtable (data tables)

**Core Principle**: Maximize information clarity and workflow efficiency through systematic design, not decorative elements.

---

## Typography System

**Font Stack**: Inter via Google Fonts CDN
- **Headlines/Titles**: font-bold, text-2xl to text-4xl
- **Section Headers**: font-semibold, text-xl
- **Body Text**: font-normal, text-base (16px)
- **Labels/Meta**: font-medium, text-sm
- **Micro/Helper Text**: font-normal, text-xs

**Hierarchy Rules**:
- Page titles: text-3xl font-bold
- Card/section titles: text-xl font-semibold
- Data labels: text-sm font-medium uppercase tracking-wide
- Table headers: text-xs font-semibold uppercase

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing: p-2, gap-2, m-2
- Standard spacing: p-4, gap-4, m-4
- Section spacing: p-8, py-12, my-16
- Card padding: p-6
- Page margins: px-8 py-6

**Grid Structure**:
- Main layout: Sidebar (280px fixed) + Content area (flex-1)
- Content max-width: max-w-7xl mx-auto
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Form layouts: max-w-2xl for single column forms

---

## Component Library

### Navigation & Layout
**Sidebar Navigation** (Left, Fixed):
- Width: w-70 (280px)
- Contains: Logo, main nav items (Dashboard, Create RFP, Vendors, RFPs), user profile at bottom
- Nav items: py-3 px-4, icons + text, rounded-lg on hover
- Active state: distinct background treatment

**Top Bar**:
- Minimal: page title (left), breadcrumb trail, action buttons (right)
- Height: h-16, px-8
- Sticky: sticky top-0 with backdrop blur

### Cards & Containers
**Base Card**: 
- rounded-xl, border, p-6
- Hover state: subtle shadow lift
- Use for: vendor cards, RFP cards, proposal cards

**Data Card** (for stats/metrics):
- Compact: p-4, displays label (text-sm) + value (text-2xl font-bold)
- Grid layout: 3-4 across on desktop

**Comparison Cards**:
- Side-by-side layout in grid
- Clear visual separation between vendors
- Highlighted recommended vendor with distinct border treatment

### Forms & Inputs

**Text Inputs/Textareas**:
- Height: h-10 for inputs, min-h-32 for textareas
- Padding: px-4 py-2
- Border: rounded-lg with focus ring
- Labels: text-sm font-medium mb-2

**Chat-like NL Input** (RFP Creation):
- Large textarea: min-h-48, rounded-xl
- "Send" button positioned bottom-right
- Shows typing indicator during AI processing
- Display parsed result in adjacent panel (split 50/50 on desktop, stacked on mobile)

**Select/Dropdowns**:
- Match text input styling
- Multi-select for vendors: tag-based chips with remove icons

### Tables

**Data Tables**:
- Zebra striping for rows
- Sticky header: sticky top-0
- Column headers: text-xs font-semibold uppercase, py-3, px-4
- Cells: py-4 px-4, align content appropriately (numbers right-aligned)
- Sortable columns: include sort indicator icons

**Comparison Table** (Proposals):
- Fixed first column (vendor name)
- Horizontal scroll on mobile
- Color-coded cells for best/worst values
- Summary row at bottom

### Buttons & Actions

**Primary Button**:
- px-6 py-2.5, rounded-lg, font-medium
- Use for: Send RFP, Create, Save actions

**Secondary Button**:
- px-6 py-2.5, rounded-lg, font-medium
- Border variant for less prominent actions

**Icon Buttons**:
- w-10 h-10, rounded-lg
- Use in tables for row actions (edit, delete)

**Button Groups**:
- Segment controls for view toggles
- Flush buttons: rounded-none with border-r between

### Data Display

**Status Badges**:
- px-3 py-1, rounded-full, text-xs font-medium
- States: Draft, Sent, Received, Compared
- Semantic treatment per state

**Metric Display**:
- Large number (text-3xl font-bold) + label (text-sm)
- Optional trend indicator (arrow + percentage)

**AI Result Display**:
- Distinct container with subtle background
- Icon indicator for AI-generated content
- Editable fields with inline edit capability

**Score Visualizations**:
- Progress bars for weighted scores
- Numeric score: large (text-2xl) with denominator (out of 100)
- Breakdown: mini bars showing component scores (price, delivery, warranty, etc.)

### Lists & Items

**Vendor List Items**:
- Flex layout: avatar/icon (left), name + email (center), rating + tags (right), actions (far right)
- py-4 px-4, border-b
- Selectable state for multi-select

**RFP List Items**:
- Card-based grid layout
- Shows: title, date, vendor count, status badge
- Click entire card to navigate

**Proposal Items**:
- Expandable/collapsible sections
- Header shows vendor + total price
- Expanded view shows line-item table

### Overlays

**Modal Dialogs**:
- max-w-2xl, centered, rounded-xl
- Backdrop: semi-transparent with blur
- Header (title + close), body (p-6), footer (actions right-aligned)
- Use for: vendor creation, RFP editing

**Toast Notifications**:
- Fixed bottom-right, w-96
- Auto-dismiss after 5s
- Types: success, error, info

---

## Page-Specific Layouts

**Dashboard**:
- Stats row: 4 metric cards across (grid-cols-4)
- Recent RFPs section: card grid (grid-cols-3)
- Activity feed: single column list on right sidebar (or below stats)

**Create RFP**:
- Split view: NL input (left 50%) | Parsed JSON/form (right 50%)
- Sticky header with page title + "Create RFP" button (disabled until valid)
- Vendor selection: multi-select dropdown or modal picker

**Vendors Page**:
- Top bar: search input (left), "Add Vendor" button (right)
- Grid of vendor cards OR table view toggle
- Each vendor shows: name, email, rating stars, capability tags, last contacted

**RFP Detail**:
- Header: RFP title, status badge, date
- Tabs: Details | Sent Vendors | Proposals Received
- Details tab: clean key-value pairs or two-column layout
- Proposals tab: list of received proposals with expand/collapse

**Comparison Page**:
- Header: RFP title + comparison count
- Side-by-side proposal cards (2-3 across on desktop)
- AI recommendation panel: prominent callout with explanation
- Detailed comparison table below cards
- Score breakdown visualizations

---

## Animations
**Minimal & Purposeful Only**:
- Hover states: subtle scale/shadow on cards
- Loading states: spinner for AI processing, skeleton screens for data fetching
- Modal entrance: fade + slight scale
- NO scroll-triggered animations, NO decorative motion

---

## Images
**No Images Required**: This is a data-focused productivity application. All visual communication through typography, layout, and data visualization. Use icons from Heroicons (outline style) throughout for navigation, actions, and status indicators.