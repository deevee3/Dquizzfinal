Below is a concise Product Requirements Document (PRD) for **D’Quizz by Glenride** implemented on top of your **Laravel starter kit**. You can paste this into Notion/Confluence or share it directly with devs.

---

# Product Requirements Document (PRD)  
**Product:** D’Quizz by Glenride – Quiz Funnel & Scorecard Platform  
**Tech Base:** Laravel Starter Kit (API + Web)  
**Version:** v1.0 (MVP)  

---

## 1. Product Overview

D’Quizz by Glenride is an advanced **quiz funnel marketing and scorecard platform** that helps businesses attract, engage, and convert audiences by creating personalized scorecard marketing funnels [1].  

The Laravel implementation will deliver:

- Creation and management of quizzes and scorecards
- Personalized results and next steps
- Lead capture and basic qualification
- Analytics and integrations foundation

This PRD focuses on core MVP capabilities that can grow into a full all‑in‑one platform with templates, analytics, and CRM integrations [1].

---

## 2. Objectives & Success Metrics

### 2.1 Business Objectives

1. Allow non-technical users to build and launch quiz funnels in under 30 minutes.  
2. Capture and store leads with structured response data tied to quiz results.  
3. Provide personalized results pages with actionable next steps [1].  
4. Support future expansion into full analytics and CRM/email integrations [1].

### 2.2 Success Metrics (MVP)

- Time to publish: Median time from “Create Quiz” → “Published” < 30 minutes.
- Usage: At least 3 quizzes created and >100 quiz completions within the first month of internal/beta usage.
- Data completeness: ≥ 95% completed quiz submissions have an associated lead record.
- Performance: Quiz load times < 2 seconds (P95) on standard hosting.

---

## 3. User Roles & Permissions (MVP)

1. **Admin**
   - Full system access: manage users, quizzes, templates, integrations, settings.
2. **Creator**
   - Create, edit, publish/unpublish quizzes.
   - View responses and basic analytics for their own quizzes.
3. **Viewer (optional MVP)**
   - Read-only access to analytics and responses.

Public **End Users (quiz takers)** are anonymous/lead users with access only to the quiz web front-end.

---

## 4. Core Use Cases

1. **Create a quiz/scorecard funnel**
   - As a Creator, I can define questions, scoring, and result logic.
2. **Customize the quiz branding**
   - As a Creator, I can adjust logo, colors, and text to match my brand [1].
3. **Publish & share the quiz**
   - As a Creator, I can publish the quiz and share via URL or embed.
4. **Capture leads**
   - As a Creator, I can collect contact info (name, email, etc.) from quiz takers [1].
5. **Deliver personalized results**
   - As an End User, I receive a personalized results page and recommended next steps [1].
6. **View quiz performance & responses**
   - As a Creator, I can see submissions, scores, and basic analytics [1].
7. **Export and integrate**
   - As an Admin, I can export data and prepare for integrations with CRMs and email platforms [1].

---

## 5. Functional Requirements

### 5.1 Quiz Management

**5.1.1 Quiz Model**

Each quiz has:

- `id`
- `owner_id` (user who created it)
- `title`
- `slug` (for public URL)
- `description`
- `status` (draft, published, archived)
- `type` (assessment / scorecard / profile quiz / waitlist / survey) [1]
- `brand_settings` (JSON: primary color, secondary color, logo URL, fonts)
- `cta_settings` (primary CTA label, URL or internal action)
- `created_at`, `updated_at`

**5.1.2 Question Model**

- `id`
- `quiz_id`
- `type` (single_choice, multiple_choice, scale, open_text)
- `question_text`
- `help_text` (optional)
- `order`
- `required` (bool)
- `scoring_dimension` (e.g., Strategy, Execution, Systems) – optional
- `metadata` (JSON for advanced types)

**5.1.3 Answer Option Model**

- `id`
- `question_id`
- `label`
- `value` (stored value)
- `score_value` (numeric score applied if selected)
- `order`

**5.1.4 Result Outcome Model**

For personalized results & next steps:

- `id`
- `quiz_id`
- `name` (e.g., “Strategic Starter”)
- `description` (long-form text explaining the result)
- `score_min`, `score_max` OR rules per dimension (MVP can start with overall score range)
- `content_blocks` (JSON: next steps, resource links, CTA)
- `cta_override` (optional specific CTA label + URL)

**Required Behaviors (MVP)**

- Creators can:
  - Create, update, delete quizzes (soft delete).
  - Add/edit/remove questions and answer options.
  - Define simple scoring:
    - Each answer has a numeric score.
    - Quiz total score maps to a result outcome via score range.
  - Define at least one result outcome per quiz.
  - Preview the quiz and results before publishing.

### 5.2 Lead Capture & Quiz Submission

**5.2.1 Lead Model**

- `id`
- `quiz_id`
- `email`
- `first_name` (optional)
- `last_name` (optional)
- `phone` (optional)
- `metadata` (e.g., company, role, custom fields)
- `created_at`

**5.2.2 Submission Model**

- `id`
- `quiz_id`
- `lead_id` (nullable if they skip opt-in, depending on settings)
- `result_outcome_id`
- `total_score`
- `dimension_scores` (JSON: e.g., {“Strategy”: 12, “Execution”: 8})
- `submitted_at`

**5.2.3 Submission Answer Model**

- `id`
- `submission_id`
- `question_id`
- `answer_value` (for text inputs)
- `answer_option_ids` (JSON array for multiple choice)
- `score_value`

**Required Behaviors**

- Quiz taker completes quiz questions.
- On final step, optional/required **lead capture form** appears:
  - Configurable per quiz: `lead_capture_mode` = required / optional / disabled.
- On submit:
  - Compute total score and dimension scores.
  - Determine result outcome based on defined logic.
  - Store submission, answers, and lead information.
  - Redirect/render **personalized results page**.

### 5.3 Personalized Results & Next Steps

**Requirements**

- Results page shows:
  - Result name and description [1].
  - Overall score and optionally sub-scores (dimensions).
  - At least one **Next Step** section:
    - Rich text (HTML/Markdown)
    - Links to videos/articles/offer pages
  - Primary CTA button (global or overridden at outcome level) [1].
- Option to **email the results** to the lead:
  - Use Laravel’s mail system with a branded email template.

### 5.4 No-Code Funnel Building (Creator UI)

**MVP UI Requirements (Laravel Blade or Inertia/Vue/React)**

- Quiz List Page
  - List of quizzes (title, status, created date, #submissions).
  - Actions: Create, Edit, View Share URL, Duplicate, Archive.
- Quiz Builder
  - Multi-tab or step-based UI:
    1. **Basics**: title, description, slug, type, status.
    2. **Questions**: manage question order, types, and answer options.
    3. **Scoring & Results**: configure score values and result ranges.
    4. **Design**: branding settings (colors, logo).
    5. **Lead Capture & CTA**: lead form fields, CTA settings.
- Preview Mode
  - Open public-style quiz preview in a new tab (draft-only).

### 5.5 Templates (MVP)

**Goal:** Provide at least 2–3 starter templates [1].

Template metadata:

- `id`
- `name` (e.g., “Marketing Maturity Scorecard”)
- `description`
- `category` (e.g., lead_gen, waitlist, webinar_qualifier)
- `structure` (JSON to generate quiz, questions, outcomes)

**Required Behavior**

- On “Create Quiz”, user can:
  - Start from scratch
  - Choose a template
    - Auto-populate quiz, questions, sample outcomes, and copy which user can then edit.

---

## 6. Analytics & Reporting (MVP)

**6.1 Basic Dashboard (Per Quiz)**

- Total quiz views
- Total quiz starts
- Completions
- Completion rate (%)
- Total leads captured
- Average score

**6.2 Response Explorer**

- Table of submissions:
  - Lead email
  - Submission date
  - Total score
  - Result outcome
- CSV export of submissions (including answers and scores) [1].

---

## 7. Integrations (Foundation for Future)

MVP does not need full direct integrations but should be **designed for them**.

**7.1 Webhooks (Phase 1 of Integrations)**

- Allow Admin to configure a **webhook URL** at app level:
  - On new submission, send JSON payload:
    - lead info
    - answers
    - scores
    - outcome
- Basic logs of webhook deliveries (success/failure).

**7.2 Future: Native Integrations (Non-MVP)**

- HubSpot, Salesforce, Keap, etc. for contact creation and tagging [1].
- Email platforms (Mailchimp, etc.) for automation.

---

## 8. Non-Functional Requirements

- **Security**
  - Use Laravel auth & middleware for role-based access.
  - CSRF protection, validation on all forms.
  - Store PII securely; no sensitive data beyond contact details.
- **Performance**
  - Cache quiz definitions (questions, options) for faster load.
- **Scalability**
  - Database schema designed for multi-tenant usage later (e.g., `account_id`).
- **Maintainability**
  - Follow Laravel best practices:
    - Service layer for scoring.
    - Reusable components for questions UI.
- **Localization (Optional MVP)**
  - Structure copy to allow later translation.

---

## 9. Open Questions / To Be Clarified

1. **Multi-tenancy:**  
   - Will each client have their own account/space, or is this initially a single internal instance?
2. **Branding scope:**  
   - Global theme per account vs. per quiz only?
3. **Lead capture fields:**  
   - Fixed (name, email, phone) vs. configurable custom fields?
4. **Result logic complexity:**  
   - For MVP, is overall score range sufficient, or do you need per-dimension rules now?

---

## 10. Implementation Phases

**Phase 1 (Core MVP)**  
- Models, migrations, and basic CRUD for quizzes, questions, options, outcomes, leads, submissions.  
- Public quiz rendering + scoring + result pages.  
- Simple dashboard and CSV export.  
- One global webhook.

**Phase 2**  
- Templates system.  
- Enhanced analytics and better UI for result pages.  
- Email results.  
- Improved branding controls.

**Phase 3**  
- Native CRM/email integrations.  
- Advanced branching logic and segmentation.  
- Multi-tenancy & client portals.
