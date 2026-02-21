# Logged-In Screens Plan for D'Quizz

Based on the `idea.md` PRD, here is the plan for the logged-in "Creator" experience.

## 1. Dashboard (`/dashboard`)
**Goal:** High-level overview and entry point for managing quizzes.

*   **Layout:** Standard AppLayout (Sidebar + Header).
*   **Key Components:**
    *   **Stats Overview (Top Row):**
        *   Total Quizzes Created
        *   Total Leads Captured
        *   Total Quiz Completions
    *   **Recent Quizzes (Main Content):**
        *   Table listing quizzes.
        *   Columns: Title, Status (Draft/Published), Created Date, Leads Count.
        *   Actions: Edit, View Analytics, Delete.
    *   **Primary Action:** "Create New Quiz" button (Top right or above table).

## 2. Quiz Builder (`/quizzes/create` & `/quizzes/{id}/edit`)
**Goal:** The core workspace for building a quiz funnel.

*   **Layout:** AppLayout or a focused "Builder Layout" (minimized nav to reduce distraction).
*   **Structure:** Tabbed Interface or Stepper.
    *   **Tab 1: Basics:**
        *   Quiz Title
        *   URL Slug
        *   Description
        *   Quiz Type (Assessment vs Scorecard)
    *   **Tab 2: Questions:**
        *   List of current questions (drag-and-drop reordering).
        *   "Add Question" button.
        *   Question Editor (Sidebar or Modal):
            *   Question Text
            *   Type (Multiple Choice, Text, etc.)
            *   Answer Options & Scores.
    *   **Tab 3: Outcomes (Results):**
        *   Define result buckets (e.g., "Beginner", "Expert").
        *   Set score ranges for each outcome.
        *   Edit Result Page content (Heading, Description, CTA).
    *   **Tab 4: Design & Branding:**
        *   Logo Upload.
        *   Primary/Secondary Colors.
        *   Font selection.
    *   **Tab 5: Settings / Lead Capture:**
        *   Lead Form toggles (Name, Email, Phone).
        *   "Required" vs "Optional".
*   **Persistent Actions (Header):**
    *   Save Changes.
    *   Preview (Opens in new tab).
    *   Publish/Unpublish toggle.

## 3. Quiz Analytics (`/quizzes/{id}/analytics`)
**Goal:** Deep dive into a specific quiz's performance.

*   **Components:**
    *   **Funnel Visualization:** Views -> Starts -> Completions -> Leads.
    *   **Response Explorer:**
        *   Data Table of individual submissions.
        *   Columns: Email, Date, Score, Result Outcome.
        *   Expand row to see specific answers.
    *   **Export:** Button to download CSV.

## Implementation Steps

1.  **Scaffold Routes & Controllers:**
    *   Define `QuizController`, `QuestionController`, `SubmissionController`.
    *   Update `web.php` with new routes.
2.  **Database Migrations:**
    *   Create `quizzes`, `questions`, `answers`, `results`, `leads`, `submissions` tables (as per PRD).
3.  **Dashboard Page:**
    *   Replace placeholder cards with real (or empty state) quiz list.
4.  **Builder UI:**
    *   Build the multi-tab React component.
    *   Implement state management for the "Quiz in progress".
5.  **Public Facing Quiz View:**
    *   The actual page users see when taking the quiz.
