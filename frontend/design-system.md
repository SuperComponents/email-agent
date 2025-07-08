
# Proresponse.ai Design System

This document outlines the design system for proresponse.ai, focusing on a minimal, scalable, and code-first approach. The system is designed to work with our tech stack: React, Vite, and Tailwind CSS, with `shadcn` as a foundation for components.

## 1. Token Management System

We will adopt a CSS Custom Variables-based system for managing design tokens. This approach integrates seamlessly with Tailwind CSS and is the standard for `shadcn`.

- **Source of Truth**: A global CSS file (e.g., `src/index.css`) will define all design tokens as CSS variables within the `:root` scope.
- **Integration**: `tailwind.config.js` will be configured to use these CSS variables, allowing us to use standard Tailwind utility classes (e.g., `bg-background`, `text-primary`) that are powered by our custom tokens.
- **Theming**: This system provides a straightforward path to implement features like dark mode by redefining the variable values within a `[data-theme="dark"]` or `.dark` selector.

## 2. Design Tokens (Minimal Set)

### Colors
Defined semantically to support theming. We'll start with a base grayscale and a primary accent color.

- `background`: The main app background.
- `foreground`: The default text color.
- `card`: The background color for card-like elements.
- `card-foreground`: Text color for content within cards.
- `primary`: The primary interactive color for buttons and links.
- `primary-foreground`: Text color for content on primary-colored elements.
- `secondary`: A subtle color for secondary elements and borders.
- `secondary-foreground`: Text color for secondary elements.
- `destructive`: A color for destructive actions (e.g., delete).
- `destructive-foreground`: Text color for destructive elements.
- `accent`: An accent color for highlights, notifications, or special states.
- `accent-foreground`: Text color for accent elements.
- `border`: The color for borders and separators.
- `input`: The background color for input fields.
- `ring`: The color for focus rings on interactive elements.

### Typography
- **Font Family**: `sans`: A modern, legible sans-serif font (e.g., Inter).
- **Font Sizes**: A basic type scale (e.g., `xs`, `sm`, `base`, `lg`, `xl`, `2xl`).
- **Font Weights**: `normal`, `medium`, `semibold`, `bold`.
- **Line Heights**: Corresponding line heights for each font size to ensure readability.

### Spacing
A standard 4-point numeric scale will be used for padding, margins, and gaps, aligning with Tailwind's default spacing scale.

### Sizing
Consistent sizing for elements like buttons and inputs.

### Border Radius
- `sm`: Small radius for small elements.
- `md`: Medium radius for cards and inputs.
- `lg`: Large radius for larger containers or modals.
- `full`: For circular elements like avatars.

## 3. Design Primitives

- **Typography**: Styles for H1, H2, H3, P, Blockquote, and small/subtle text.
- **Layout**: We will primarily use Flexbox and CSS Grid via Tailwind utilities. We will create simple layout components like `Box`, `Flex`, and `Grid` for common patterns.
- **Iconography**: We will use `lucide-react`, which integrates well with `shadcn` and provides a comprehensive, lightweight set of icons.

## 4. Atom Components

The most basic building blocks of our UI.

- `Button`: Variants: primary, secondary, destructive, ghost, link.
- `Input`: Basic text input.
- `Label`: For form elements.
- `Avatar`: To display user/contact images or initials.
- `Badge` (or `Tag`): For status indicators like "urgent" or "unread".
- `Separator`: For visual dividers.
- `Icon`: A wrapper for displaying icons from `lucide-react`.

## 5. Molecule Components

Simple combinations of atoms to form functional units.

- `SearchInput`: An `Input` with a search `Icon`.
- `FilterPills`: A group of `Button` or `Badge` components for filtering threads.
- `ThreadPreview`: The list item for the thread list, combining `Avatar`, `Badge`, and text elements.
- `AgentAction`: Displays a single action or analysis step from the agent (e.g., "Queried Knowledge Base").

## 6. Organism Components

Complex components that form distinct sections of the interface.

- `Header`: App header containing the logo, account menu, and primary navigation.
- `ThreadList`: The scrollable list of `ThreadPreview` molecules.
- `ThreadDetail`: The main view showing the full email conversation.
- `AgentPanel`: The right sidebar containing a list of `AgentAction` molecules.
- `Composer`: The rich text editor for drafting email replies.

## 7. Templates and Pages

### Templates (Layouts)
- `AuthLayout`: A centered, single-column layout for login and signup screens.
- `AppLayout`: The main three-column application layout (ThreadList, ThreadDetail, AgentPanel).

### Pages
- `LoginPage`: The entry point of the application.
- `InboxPage`: The main page displaying email threads and the agent's work. It will use the `AppLayout`.

## 8. Documentation and Demonstration Plan

We will use **Storybook** to document and showcase our design system.

- **Why Storybook?**: It allows us to develop and test components in isolation, automatically generating a living style guide that stays in sync with our codebase.
- **Implementation Plan**:
    1.  Install and configure Storybook in the project.
    2.  Create stories for every Atom, Molecule, and Organism.
    3.  Create documentation pages within Storybook to outline our design principles (tokens, typography, etc.).
- **Benefit**: This provides a single source of truth for designers and developers, improving consistency, speeding up development, and simplifying onboarding for new team members. 