# Product Requirements Document (PRD): Simple Personal Finance Tracker

## 1. Executive Summary
A minimalist personal finance application designed for speed and simplicity. The primary goal is to minimize the friction of logging daily transactions. It targets users who find traditional finance apps too complex or tedious.

## 2. Core Philosophy
*   **Speed over features:** Entry must take less than 5 seconds.
*   **Forgiving categorization:** Don't force users to manage category trees. Just type and go.
*   **Clarity:** Show the transactions clearly in a chronological table.

## 3. Data Entities

### Users
*   Standard authentication (Name, Email, Password).

### Accounts
*   **Purpose:** To distinguish between sources (e.g., "Wallet", "Bank", "Credit Card").
*   **Fields:** `id`, `user_id`, `name`, `color` (for UI identification).

### Categories
*   **Purpose:** To tag transactions.
*   **Behavior:** "Smart Create". If a user types a category that doesn't exist, it is created automatically upon transaction submission.
*   **Fields:** `id`, `user_id`, `name`.

### Transactions
*   **Purpose:** The core record of spending/income.
*   **Fields:**
    *   `id`, `user_id`
    *   `account_id` (Belongs to an account)
    *   `category_id` (Belongs to a category)
    *   `amount` (Decimal. Negative for expense, Positive for income).
    *   `description` (Optional text).
    *   `date` (Defaults to today).

## 4. Functional Requirements

### 4.1 Transaction Entry (The "Hero" Feature)
*   **UI Component:** A highly visible form (likely top of table).
*   **Category Input:** A Combobox/Autocomplete field.
    *   User types "Fo...".
    *   Dropdown shows "Food", "Football".
    *   User types "Foodies" (new word).
    *   UI indicates "Create 'Foodies'".
    *   On submit, backend resolves this to a new Category ID.
*   **Amount Input:** Simple numeric input.
*   **Feedback:** Optimistic UI update (shows in list immediately).

### 4.2 Transaction List
*   **View:** Table view.
*   **Columns:** Date | Description | Category | Account | Amount | Actions.
*   **Sorting:** Newest on top.
*   **Grouping:** Simple headers by Date (e.g., "Today", "Yesterday") if UI permits, otherwise flat list.
*   **Actions:**
    *   **Edit:** Click to edit details inline or via a modal.
    *   **Delete:** Remove a transaction (with confirmation).

### 4.3 Account Management (Settings)
*   **Location:** Dedicated "Settings" or "Accounts" page/modal.
*   **CRUD Operations:**
    *   **Create:** Add new accounts (e.g., "Savings").
    *   **Read:** List all active accounts.
    *   **Update:** Rename accounts or change their color/icon.
    *   **Delete:** Remove accounts.
        *   *Constraint:* If transactions exist, either prevent delete or ask to reassign them to another account (to preserve history). For MVP, prevent delete if transactions exist.

### 4.4 Category Management (Settings)
*   **Location:** Dedicated "Categories" section in Settings.
*   **CRUD Operations:**
    *   **Create:** Manually add categories (outside of the smart-entry flow).
    *   **Read:** List all categories.
    *   **Update:** Fix typos (e.g., rename "Foood" to "Food").
    *   **Delete:** Remove categories.
        *   *Constraint:* Similar to accounts, handle associated transactions (Prevent delete or Reassign).

## 5. UI/UX Design Guidelines
*   **Framework:** React (Inertia.js), Tailwind CSS, Shadcn UI.
*   **Typography:** Clean, sans-serif (Inter/Geist). High legibility.
*   **Colors:**
    *   Expenses: Red/Slate (subtle).
    *   Income: Green/Teal.
    *   UI: White/Gray background to reduce eye strain.
*   **Mobile Experience:**
    *   The "Table" might need to convert to a "Card List" on small screens.
    *   The "Add" button must be thumb-accessible (Floating Action Button or Sticky Header).

## 6. Technical Stack
*   **Backend:** Laravel 12, MySQL.
*   **Frontend:** Inertia.js (React), Tailwind v4.
*   **Component Library:** Shadcn UI (specifically `Combobox`, `Table`, `Dialog`, `Form`, `DropdownMenu`).