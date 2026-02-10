# Quick Start Guide - Pricing Decision Prototype

## Get Running in 30 Seconds

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Explore Each Screen

### 1. **Problem Intake** (Current Page)
- Type any pricing scenario or click "Raising prices 20%"
- Select a driver (revenue, margin, competitive, fairness)
- Choose involvement level (High-touch, Checkpoint, Executive)
- Click **Continue**

### 2. **Context Checklist**
- Click "Upload" on any item to mock-upload a file
- Notice status changes from ○ (missing) to ✓ (uploaded)
- Click **Continue with gaps** to proceed

### 3. **Plan Review**
- Click phase headers to expand tasks
- Notice color-coded owners: [SYSTEM], [USER], [COLLABORATIVE]
- See gap warnings with orange badges
- Click **Approve Plan & Start**

### 4. **Live Workspace** ⭐ *Most Visual*
- **Left sidebar:** Progress bars update in real-time
- **Center:** Current activity card shows what system is doing
- **Right panel:** Artifact cards showing live progress
  - Click cards to expand sections
  - Watch section statuses change (queued → in-progress → done)
- Takes ~30 seconds to show completion
- Click **View progress details** for checkpoint OR wait for completion

### 5. **Checkpoint Review** (Decision Point)
- Read the context card (what system found)
- Select 1+ options with checkboxes
- See impact preview below
- Confidence level shows 78% based on data used
- Click **Continue with selected** or **I need to think**

### 6. **Escalation / Missing Data**
- Demonstrates handling blockers
- Three options: use benchmark, provide data, pause
- Each option shows confidence/timeline tradeoffs
- Pick one and click **Proceed**

### 7. **Final Package** ✅
- Gallery of deliverables (Memo, Model, FAQ, Roadmap)
- Click cards to toggle selection
- Preview of Decision Memo content
- **Download Package** button (alerts with file list)
- **Start Over** to go back to intake

---

## Key Interactive Features

### Real-Time Progress
The workspace screen simulates live progress:
- Phase progress bars fill progressively
- Artifact completion percentages increase
- Section statuses transition through states
- Happens automatically every second

### File Upload Mocking
Click "Upload" on any checklist item:
- Opens native file picker
- Shows filename after upload
- Updates status icon to ✓

### Always-Visible Help
Blue **?** button (bottom-right) on any screen shows:
- 🤖 **Agent responsibilities** (what system does)
- 👤 **Your responsibilities** (what user does)
- 🚫 **Can't automate** (customer meetings, legal, etc.)

### Smooth Animations
- Screens fade in on load
- Buttons scale up on hover
- Cards lift on interaction
- Progress bars animate smoothly

---

## Design Highlights

### Modern Dark UI
- Slate-900 background with blue accents
- High contrast white text
- Smooth hover transitions
- Professional, minimal aesthetic

### Responsive Layout
- Workspace has sidebar + content layout
- Most screens are single-column, centered
- Grid layouts for cards
- Works on desktop (mobile not priority)

### Clear Information Hierarchy
- Large headings introduce sections
- Color coding: blue (action), green (success), orange (warning), red (error)
- Icons for quick recognition (📝, 📊, 🗺️, 💬)
- Consistent spacing and alignment

---

## Common Actions

| Action | Screen | How |
|--------|--------|-----|
| **Change input** | Intake | Type in textarea, select driver/involvement, click Continue |
| **Mock file upload** | Checklist | Click "Upload" link, select any file |
| **View plan** | Plan | Click phase headers to expand tasks |
| **Watch progress** | Workspace | Watch left sidebar bars and artifact cards update |
| **Make decision** | Checkpoint | Check options, click Continue |
| **Resolve blocker** | Escalation | Select option, click Proceed |
| **Download** | Final | Click Download Package (shows alert) |
| **Get help** | Any (except Intake) | Click blue ? button (bottom right) |

---

## Understanding the Flow

```
User Input              System Work             User Decision        Deliverables
─────────────           ──────────────          ──────────────       ─────────────

Intake Form   ───→    Analyze Data    ───→   Checkpoint    ───→   Final Package
  • Situation        • Gap Analysis         • Choose Segment       • Decision Memo
  • Driver           • Modeling             • Set Priorities       • Revenue Model
  • Involvement      • Risk ID                                     • FAQ

                      Live Workspace
                      (Real-time Progress)
```

---

## What's NOT Functional

This is a **visual prototype**, not a working system:
- File uploads don't actually save
- Progress bars animate on a timer (not real work)
- Artifacts show mock content
- Download doesn't generate files
- No database/backend

To use in production, you'd need:
- Real AI backend (Claude API)
- File storage system
- Database for state
- User authentication

---

## Code Files to Review

| File | Purpose |
|------|---------|
| `components/ScreenRouter.tsx` | Routes between 8 screens |
| `lib/context.tsx` | Workflow state management |
| `lib/types.ts` | TypeScript interfaces |
| `lib/mock-data.ts` | Sample data for each screen |
| `components/screens/*.tsx` | Individual screen components |
| `components/RoleReference.tsx` | Help modal |

---

## Try These Scenarios

### Scenario 1: Quick Look (5 min)
1. Intake: Type "raising prices", select "revenue", "checkpoint"
2. Checklist: Click continue
3. Plan: Expand phases, click approve
4. Workspace: Wait 30s for completion
5. Final: Download

### Scenario 2: Explorer (10 min)
1. Try each screen in order
2. Click artifact cards in workspace to expand
3. Test the role reference (? button)
4. Go back to different screens
5. Start over from final screen

### Scenario 3: Deep Dive (15 min)
1. Intake: Read descriptions of each driver carefully
2. Checklist: Try uploading files
3. Plan: Understand task owners and gaps
4. Workspace: Watch real-time updates closely
5. Checkpoint: Read context and impact descriptions
6. Escalation: See how tradeoffs are presented
7. Final: Check all deliverables

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate form fields |
| `Enter` | Submit form / Click button |
| `Space` | Toggle checkbox |
| `Esc` | Close modal (? reference) |

---

## Need Help?

### Screen isn't loading?
- Check browser console (F12) for errors
- Make sure dev server is running: `npm run dev`
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Want to modify something?
- Edit component files in `/components/screens/`
- Edit colors in Tailwind class names
- Edit mock data in `/lib/mock-data.ts`
- Changes auto-reload (hot reload enabled)

### Want to understand the code?
- Start with `app/page.tsx` (entry point)
- Follow to `components/ScreenRouter.tsx`
- Each screen is in `components/screens/`
- State is managed via `lib/context.tsx`

---

## Next Steps

1. **Explore all 8 screens** - Get familiar with the flow
2. **Read PROTOTYPE.md** - Deep dive into design & features
3. **Modify mock data** - Try different scenarios
4. **Review component code** - Understand how it's built
5. **Plan backend integration** - Next step for real system

---

**Enjoy exploring the prototype!** 🚀
