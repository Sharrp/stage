# AI-Assisted Pricing Decision Support System - Interactive Prototype

## Overview

A fully clickable prototype demonstrating a **workflow management interface** for navigating complex pricing changes with AI assistance. The system guides users through structured decision-making while maintaining transparency about who (AI/human) owns each task.

**Live at:** `http://localhost:3000`

## Key Features

### 1. **8 Interactive Screens**
- **Screen 1: Problem Intake** - Capture pricing intent, involvement level
- **Screen 2: Context Checklist** - Identify available data with status tracking
- **Screen 3: Plan Review** - Approve/modify execution plan
- **Screen 4: Live Workspace** - Monitor progress, view artifact previews
- **Screen 5: Checkpoint Review** - Make strategic decisions
- **Screen 6: Escalation Handler** - Resolve blockers (missing data)
- **Screen 7: Final Package** - Download deliverables
- **Screen 8: Role Reference** - Always-visible "who does what" guide

### 2. **Modern UI Design**
- **Aesthetic**: Dark slate background (Linear-inspired), professional
- **Typography**: DM Sans font family (modern, clean)
- **Color Scheme**: Neutral slate base with blue/indigo accents
- **Motion**: Framer Motion animations (smooth transitions, hover states)
- **Responsive**: Sidebar layout in workspace, grid layouts on cards

### 3. **Interactive Elements**
- Text input with quick-start suggestions
- Multi-select checkboxes with upload zones
- Collapsible plan phases with inline editing
- Live progress bars updating in real-time
- Artifact preview cards with expandable sections
- Modal dialogs for role reference

### 4. **State Management**
- React Context (WorkflowContext) tracks workflow state
- Persists user input as they navigate screens
- Supports reset/restart

## Prototype Workflow

### User Journey
```
1. Problem Intake
   ↓ (User describes situation, picks driver, sets involvement level)
2. Context Checklist
   ↓ (User uploads available data, marks gaps)
3. Plan Review
   ↓ (User approves execution plan)
4. Live Workspace
   ↓ (System shows live progress, artifact builds)
   ├→ Checkpoint Review (user makes strategic choice)
   ├→ Escalation Screen (resolve missing data)
   └→ loops until complete
5. Final Package
   ↓ (User reviews and downloads)
```

## Screen Descriptions

### Screen 1: Problem Intake
**Purpose:** Establish context and involvement level

**Interactive Elements:**
- Large textarea for situation description
- Quick-start buttons ("Raising prices 20%", "Seat → usage model")
- Radio buttons for primary driver (revenue, margin, competitive, fairness)
- Slider-like buttons for involvement level (High-touch, Checkpoint, Executive)
- Continue button (disabled until situation entered)

**Try It:**
1. Type a pricing scenario or click a quick-start
2. Select a driver (notice descriptions appear)
3. Choose involvement level
4. Click Continue

---

### Screen 2: Context Checklist
**Purpose:** Identify data gaps and manage user expectations

**Interactive Elements:**
- Two sections: "Required" and "Nice-to-Have"
- Status icons: ✓ uploaded, ○ missing, ⊘ blocked
- File upload inputs for each item
- Shows why each data source matters (tooltips)
- "Continue anyway" button (visible even with gaps)

**Try It:**
1. Click "Upload" on any item
2. Select a file (mock upload shows filename)
3. Notice status changes to green ✓
4. Check items to "blocked" state
5. Continue with gaps visible

---

### Screen 3: Plan Review
**Purpose:** Show structured plan, allow adjustments

**Interactive Elements:**
- Collapsible phases (expand/collapse with +/- button)
- Color-coded task owners: [SYSTEM], [USER], [COLLABORATIVE]
- Gap warnings (orange boxes flagging assumptions)
- Drag-reorder capability (visual hint)
- Time estimates per phase
- Approve/Back buttons

**Try It:**
1. Click phase headers to expand tasks
2. Notice gap badges showing assumptions
3. See time estimates roll up
4. Click "Approve Plan & Start"

---

### Screen 4: Live Workspace
**Purpose:** Central hub showing progress, artifacts, notifications

**Key Sections:**
- **Left Sidebar:** Plan outline with progress bars
  - Blue bar = current phase
  - Green bar = completed phases
  - Percentage shows progress
- **Center:** Current activity card
  - Shows which phase system is working on
  - "View progress details" link
  - Status messages
- **Right Panel:** Live artifact previews
  - 4 main artifacts (Decision Memo, Revenue Model, FAQ, Roadmap)
  - Click to expand sections
  - Each section shows: ✓ done, ⟳ in-progress, ○ queued

**Real-Time Updates:**
- Progress bars animate as you watch
- Artifact completion percentages increase
- Section statuses transition (queued → in-progress → done)
- Happens every ~1 second (demo pacing)

**Try It:**
1. Watch left sidebar progress bars fill
2. Click artifact cards to expand sections
3. See section statuses change in real-time
4. Click "View progress details" → goes to Checkpoint screen
5. When complete, click "View Final Package"

---

### Screen 5: Checkpoint Review
**Purpose:** User makes strategic decision with full context

**Interactive Elements:**
- **Context Card:** Summary of what system analyzed
- **Decision Prompt:** Clear question with multiple options
- **Options:** Checkboxes with descriptions + impact preview
- **Impact Preview:** "Choosing X means..." explanation
- **Confidence Indicator:** Shows confidence level + data used
- **"I need to think" button:** Pause and resume later
- **Data Sources Used:** Lists which files informed this decision

**Try It:**
1. Read the context (what system found)
2. Select one or more options (checkboxes)
3. Notice impact preview updates
4. See confidence level (78% - based on available data)
5. Click "I need to think" to see pause flow
6. Or select options and continue

---

### Screen 6: Escalation / Missing Data
**Purpose:** Handle blockers with clear trade-offs

**Interactive Elements:**
- **Problem Statement:** Red box explaining blocker
- **Why This Matters:** Expandable details section
- **Options:** Three radio buttons, each with:
  - Title and description
  - Tradeoff (what we're sacrificing)
  - Confidence impact (±X%)
  - Timeline impact (+X hours/days)
  - Recommended badge (if system has preference)
- **"More context" expandable:** Why this matters, what's at stake

**Try It:**
1. Read the problem (can't calculate churn elasticity)
2. Click "Why this matters" to expand details
3. Select an option:
   - Use benchmark (fast, lower accuracy)
   - Provide data (best accuracy, requires input)
   - Pause (highest confidence, delays timeline)
4. See confidence/timeline trade-offs for each
5. Click "Proceed with selection"

---

### Screen 7: Final Package Review
**Purpose:** Present complete deliverables

**Interactive Elements:**
- **Deliverables Grid:** 4 cards (memo, model, roadmap, FAQ)
  - Click to select/deselect
  - Shows number of sections
  - Icon, name, description
- **Meta-Documents:** Automatically included (decision log, assumptions, confidence)
- **Preview:** Shows sample decision memo (scrollable)
- **Download Controls:**
  - "Select All" / "Select None" buttons
  - Download button generates .zip package
- **Sample Artifacts:** Shows what memo looks like with real content

**Try It:**
1. Toggle individual deliverables (click cards)
2. Notice checkboxes update
3. Read sample memo preview
4. Click "Select All" / "Select None"
5. Click "Download Package" (alerts with file list)
6. Click "Start Over" to go back to intake

---

### Screen 8: Role Reference
**Purpose:** Always-visible guide to who owns what

**Access:** Blue `?` button (bottom right) on any screen except intake

**Two-Column Content:**
- **🤖 Agent Responsibilities:** System analysis, modeling, drafting (8 items)
- **👤 Your Responsibilities:** Strategic choices, judgment, approvals (5 items)
- **🚫 Can't Automate:** Customer interviews, stakeholder meetings, legal sign-off (5 items)

**Interactive:**
- Modal dialog (click backdrop or X to close)
- Scrollable if content overflows
- Color-coded sections (purple, blue, orange)

**Try It:**
1. Go to any screen (not intake)
2. Click blue `?` button (bottom right)
3. Read through each section
4. Click X or backdrop to close
5. Button stays available on every screen

---

## Design & UX Patterns

### Color System
- **Background:** slate-900 → slate-950 (dark gradient)
- **Cards:** slate-800 (hoverable, darker on hover)
- **Borders:** slate-700 (subtle, increased on hover)
- **Accents:** Blue (primary action), Green (success), Orange (warning), Red (error)
- **Text:** White (primary), slate-400 (secondary), slate-500 (tertiary)

### Typography
- **Font Family:** DM Sans (modern, clean)
- **Headings:** text-2xl to text-3xl, font-bold
- **Body:** text-sm to text-base, text-slate-400
- **UI Text:** text-xs, font-medium, uppercase

### Spacing
- Generous padding: p-6, p-8, p-12
- Consistent gaps: gap-4, gap-6, gap-8
- Section spacing: space-y-8, space-y-12
- Responsive: Full-width mobile, max-width desktop

### Animations
- **Framer Motion:**
  - Fade in on mount (`initial={{ opacity: 0 }}`)
  - Slide up (`initial={{ y: 20 }}`)
  - Scale on hover (`whileHover={{ y: -4 }}`)
  - Stagger children for lists
- **Tailwind Transitions:**
  - `transition-all` for multi-property changes
  - `transition-colors` for color changes only
  - `hover:scale-105` for lift effects

## Project Structure

```
/components
  /screens
    - IntakeScreen.tsx       (Problem intake)
    - ChecklistScreen.tsx    (Data checklist)
    - PlanScreen.tsx         (Plan review)
    - WorkspaceScreen.tsx    (Live workspace)
    - CheckpointScreen.tsx   (Strategic decision)
    - EscalationScreen.tsx   (Missing data blocker)
    - FinalScreen.tsx        (Final package)
  - RoleReference.tsx        (Always-visible modal)
  - ScreenRouter.tsx         (Screen navigation)

/lib
  - types.ts                 (TypeScript types)
  - context.tsx              (Workflow state management)
  - mock-data.ts             (Sample data)

/app
  - layout.tsx               (Root layout with providers)
  - page.tsx                 (Home page)
  - globals.css              (Global styles)
```

## Technologies Used

- **Framework:** Next.js 14.2
- **UI Library:** React 18
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion 12
- **Font:** DM Sans (from Google Fonts)
- **Theme:** next-themes (dark mode support)
- **Language:** TypeScript

## How to Extend

### Add a New Screen
1. Create `/components/screens/YourScreen.tsx`
2. Import `useWorkflow()` and navigation hooks
3. Add ScreenType to `lib/types.ts`
4. Add case to ScreenRouter.tsx

### Modify Workflow Data
- Edit `lib/mock-data.ts` for static data
- Modify `lib/types.ts` for data shape changes

### Change Colors/Theme
- Edit Tailwind classes in component files
- Or update CSS variables in `app/globals.css`

### Adjust Animations
- All Framer Motion configs are inline in components
- Modify `initial`, `animate`, `exit`, `whileHover`, etc.

## Testing the Prototype

### Full Workflow (5 min)
```
1. Intake Screen
   → Type "We want to move from per-seat to usage-based"
   → Select "Revenue growth"
   → Choose "Checkpoint" involvement
   → Click Continue

2. Checklist Screen
   → Click upload on 2-3 items
   → Click Continue

3. Plan Screen
   → Expand each phase to see tasks
   → Click Approve

4. Workspace Screen
   → Watch progress bars fill (30 seconds)
   → Click artifact cards to see sections update
   → Wait for completion or click "View progress details"

5. Checkpoint Screen
   → Select 2-3 segment options
   → Click Continue

6. Final Screen
   → Toggle deliverables
   → Click Download Package
```

### Individual Screens
- Each screen is self-contained
- Go directly to any screen via the workflow context
- Modify mock data to test different states

## Known Limitations

This is a **non-functional prototype** demonstrating UI/UX, not a working system:
- File uploads are mocked (don't actually store files)
- Progress bars animate on a timer (not real system work)
- Artifacts show static preview content
- Download button shows an alert, doesn't generate files
- No backend/database

To convert to a real system, you'd need:
- API endpoints for each workflow step
- File storage (S3, local, etc.)
- Real AI integration (Claude API, etc.)
- Database for state persistence
- User authentication

## Design Principles

1. **Clarity on Agency:** Always show who (AI/human) does what next
2. **Progress Legibility:** See incomplete work, not just final output
3. **Controlled Involvement:** Respects user's chosen depth of engagement
4. **Confidence Metadata:** System acknowledges uncertainty, flags gaps
5. **Artifact-Centric:** Final deliverables visible from start, fill progressively
6. **Checkpoint-Driven:** Explicit handoffs for strategic choices

## Figma Design File

The visual design was informed by modern SaaS applications:
- Linear (dark mode, clean typography)
- Stripe (minimal aesthetic, high contrast)
- Notion (organized, warm grays)
- Vercel (sharp shadows, responsive)

## Next Steps

To turn this into a production system:

1. **Backend Integration**
   - Create API routes for each screen transition
   - Implement real workflow orchestration
   - Connect to Claude AI for analysis

2. **Data Persistence**
   - Add database schema for workflows, artifacts, decisions
   - Implement user authentication
   - Track audit trail of choices

3. **File Handling**
   - Real file upload/storage
   - CSV/Excel parsing for revenue data
   - PDF generation for final artifacts

4. **Real AI Integration**
   - Claude API for analysis, modeling, drafting
   - Structured prompts for each phase
   - Streaming responses for live updates

5. **Stakeholder Features**
   - Share links for artifact review
   - Comment/feedback on decisions
   - Approval workflows

## Questions & Support

For issues or questions about the prototype:
- Check component props and state management
- Review TypeScript types in `lib/types.ts`
- Test with different mock data scenarios
- Inspect Framer Motion animations in browser devtools
