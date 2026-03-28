<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Project Component and Agent Standards

These are mandatory conventions for agents and contributors working in this repository. Agents and humans must follow these rules when creating or modifying UI components, page-specific assets, environment variables, and database schema migrations.

- Components: Keep every React component file to 200 lines or less. If a component grows beyond 200 lines, split it into smaller presentational or hook files.
- Page-local folders: Assets that apply only to a specific page must live under that page's folder and be named with a leading underscore:
  - Page components: place in the page's `_components/` directory (e.g., `app/store/[slug]/_components/`).
  - Page hooks: place in `_hooks/` inside the page folder.
  - Page types: place in `_types/` inside the page folder.
    These are private, page-scoped helpers and should not be imported outside the page folder.
- Environment variables: Any environment variable required by the app MUST be documented in `env.sample`. Add a short description and example value.
- Database schema / table changes: All changes to database tables must be added as SQL migration files in `supabase/migrations/`. Follow the repository's migration naming conventions and include an explanatory comment at the top of the migration file.
- Brand consistency: Follow the brand color palette and font rules from `app/globals.css` and the project font setup. Use `DM Sans` and `Fraunces` (where appropriate) as defined in the project fonts. Do not introduce new brand colors or fonts without prior approval.
- Coding standards & best practices: Follow existing coding conventions across the repo. Prefer small, focused functions; use descriptive names; avoid one-letter variables; keep components side-effect-free when possible; and extract complex logic to hooks or services.

### Linting, Formatting, and Validation

- Run the project's linters and formatters before committing. Add or update tests when behavior changes.
- When editing migrations or env.sample, verify they match the runtime expectations (names, defaults, and required flags).

### How agents should behave

- When creating or suggesting code edits, follow these rules exactly and reference the file locations you change.
- If a proposed change would violate any of the rules above (e.g., add a >200-line component), propose a refactor into smaller files instead.

### Enforcement and Review

- Pull requests that add components larger than 200 lines, use page-scoped assets outside `_components/_hooks/_types`, omit env.sample entries for new environment variables, or add ad-hoc DB changes without a migration will be flagged during review.

If you need an exception, document the rationale in the PR description and get explicit approval from the maintainers.
