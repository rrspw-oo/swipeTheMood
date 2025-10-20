# Development Process Documentation

## Overview

This document defines the development workflow, coding standards, and best practices for the QuoteSwipe application.

---

## Development Workflow

### 1. Before Making Changes

**MANDATORY STEPS:**

1. **Read relevant documentation** in `docs/` folder
2. **Review CLAUDE.md** for project guidelines and constraints
3. **Understand existing functionality** to avoid breaking features
4. **Check current codebase** for similar implementations

### 2. Planning Phase

1. **Create/update documentation** for new features before coding
2. **Update CHANGELOG.md** with planned changes
3. **Consider impact** on existing functionality
4. **Plan testing strategy**

### 3. Implementation Phase

1. **Follow existing code patterns** and conventions
2. **Update documentation** simultaneously with code changes
3. **Test thoroughly** to ensure no regressions
4. **Update relevant .md files** if functionality changes

### 4. Review Phase

1. **Self-review** against documentation
2. **Test all existing features** still work
3. **Update CHANGELOG.md** with completed changes
4. **Verify documentation accuracy**

---

## Coding Standards

### TypeScript Guidelines

```typescript
// Use strict typing
interface Props {
  quote: Quote;
  onAction: (id: string) => void;
}

// Prefer explicit return types
const getQuoteById = (id: string): Quote | null => {
  // implementation
};

// Use meaningful variable names
const isValidMoodType = (mood: string): mood is MoodType => {
  return validMoods.includes(mood);
};
```

### React Component Guidelines

```typescript
// Functional components with TypeScript
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Use hooks consistently
  const [state, setState] = useState<StateType>(initialState);

  // Event handlers with proper typing
  const handleEvent = (event: React.MouseEvent<HTMLButtonElement>) => {
    // implementation
  };

  return <div className="component-container">{/* JSX content */}</div>;
};

export default ComponentName;
```

### CSS/Tailwind Guidelines

```css
/* Use semantic class combinations */
.quote-card {
  @apply bg-background-card rounded-2xl shadow-lg border border-border-light;
}

/* Follow established color system */
.primary-button {
  @apply bg-primary-500 text-white rounded-xl font-medium;
}

/* Mobile-first responsive design */
.responsive-container {
  @apply w-full max-w-sm mx-auto px-6;
}
```

---

## File Organization

### Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── services/           # API and data services
├── types/             # TypeScript type definitions
├── styles/            # Global styles and themes
├── utils/             # Helper functions
└── config/            # Configuration files
```

### Naming Conventions

- **Components:** PascalCase (`QuoteCard.tsx`)
- **Files:** camelCase (`firebaseApi.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Functions:** camelCase (`getQuotesByMood`)
- **Types/Interfaces:** PascalCase (`Quote`, `MoodType`)

---

## Documentation Standards

### Component Documentation

```typescript
/**
 * QuoteCard - Displays a single quote with author and mood tags
 *
 * @param quote - Quote object containing text, author, and moods
 * @param className - Optional additional CSS classes
 * @param onAuthorClick - Callback when author is clicked (future feature)
 * @param onMoodClick - Callback when mood tag is clicked (future feature)
 */
const QuoteCard: React.FC<QuoteCardProps> = ({ quote, className }) => {
  // Component implementation
};
```

### Function Documentation

```typescript
/**
 * Filters quotes by specified mood category
 *
 * @param mood - The mood type to filter by
 * @returns Promise resolving to array of matching quotes
 * @throws Error if mood is invalid or API request fails
 */
export const getQuotesByMood = async (mood: MoodType): Promise<Quote[]> => {
  // Function implementation
};
```

---

## Testing Guidelines

### Current Testing Approach

1. **Manual Testing:** Verify all features work in browser
2. **Cross-browser Testing:** Test on different devices/browsers
3. **Regression Testing:** Ensure existing features still work
4. **Performance Testing:** Check animation smoothness

### Testing Checklist

- [ ] Random tab loads quotes correctly
- [ ] Mood tab opens selector automatically
- [ ] All mood categories filter properly
- [ ] Swipe animations work smoothly
- [ ] Tab navigation functions correctly
- [ ] Modal opens/closes properly
- [ ] Responsive design on mobile devices

### Future Testing Framework

```typescript
// Unit tests with Jest/Vitest
describe("firebaseApi", () => {
  test("getQuotesByMood filters correctly", async () => {
    const quotes = await getQuotesByMood("innovation");
    expect(quotes.every((q) => q.moods.includes("innovation"))).toBe(true);
  });
});

// Component tests with React Testing Library
describe("QuoteCard", () => {
  test("displays quote text and author", () => {
    render(<QuoteCard quote={mockQuote} />);
    expect(screen.getByText(mockQuote.text)).toBeInTheDocument();
  });
});
```

---

## Git Workflow

### Branch Naming

- `feature/add-user-quotes` - New features
- `fix/swipe-animation-bug` - Bug fixes
- `docs/update-api-spec` - Documentation updates
- `refactor/component-structure` - Code refactoring

### Commit Messages

```bash
# Format: type(scope): description

feat(quotes): add user quote creation functionality
fix(swipe): resolve animation jumping issue
docs(api): update endpoint documentation
style(card): adjust author tag positioning
refactor(types): consolidate mood type definitions
```

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing

- [ ] Manual testing completed
- [ ] No existing features broken
- [ ] Documentation updated

## Checklist

- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No console errors
```

---

## Error Handling

### Frontend Error Patterns

```typescript
// Service layer error handling
export const getQuotesByMood = async (mood: MoodType): Promise<Quote[]> => {
  try {
    const quotes = await fetchQuotesByMood(mood);
    return quotes;
  } catch (error) {
    console.error("Error fetching quotes by mood:", error);
    throw new Error(`Failed to fetch quotes for mood: ${mood}`);
  }
};

// Component error handling
const SwipeInterface: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Log to monitoring service
  };

  if (error) {
    return (
      <div className="error-container">
        <p>Something went wrong: {error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  // Normal component render
};
```

### Error Categories

- **Network Errors:** API failures, timeout issues
- **Validation Errors:** Invalid input data
- **State Errors:** Component state inconsistencies
- **Configuration Errors:** Missing environment variables

---

## Performance Guidelines

### React Performance

```typescript
// Use React.memo for expensive components
const QuoteCard = React.memo<QuoteCardProps>(({ quote }) => {
  // Component implementation
});

// Use useMemo for expensive calculations
const filteredQuotes = useMemo(() => {
  return quotes.filter((quote) => quote.moods.includes(selectedMood));
}, [quotes, selectedMood]);

// Use useCallback for event handlers
const handleSwipe = useCallback(
  (direction: "left" | "right") => {
    // Swipe handling logic
  },
  [currentIndex, quotes]
);
```

### Animation Performance

```typescript
// Use transform and opacity for smooth animations
const cardVariants = {
  enter: { opacity: 0, x: 300 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -300 },
};

// Avoid layout-triggering animations
// Good: transform, opacity
// Bad: width, height, top, left
```

---

## Security Guidelines

### Data Validation

```typescript
// Validate all external data
const validateQuote = (data: any): Quote => {
  if (!data.text || typeof data.text !== "string") {
    throw new Error("Invalid quote text");
  }

  if (!Array.isArray(data.moods) || data.moods.length === 0) {
    throw new Error("Invalid moods array");
  }

  return data as Quote;
};
```

### Environment Variables

```typescript
// Never expose secrets in frontend code
const config = {
  apiUrl: import.meta.env.VITE_API_URL, // OK - Public
  secretKey: import.meta.env.SECRET_KEY, // NEVER - Server only
};
```

---

## Deployment Process

### Firebase Hosting Deployment (CRITICAL)

**IMPORTANT:** Firebase Hosting must be deployed BEFORE testing Google Authentication, even in development!

```bash
# Initial setup (only once)
firebase init hosting
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No

# Deploy process
npm run build
firebase deploy --only hosting
```

**Why This Is Critical:**
- Google OAuth popup uses `https://your-project.firebaseapp.com/__/auth/handler`
- This endpoint only exists after Firebase Hosting deployment
- Without deployment, login will show your app page instead of Google login
- See `docs/TROUBLESHOOTING.md` for details

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Run type checking
npm run type-check

# 3. Run linting
npm run lint

# 4. Build for production
npm run build

# 5. Test built application
npm run preview

# 6. Deploy to Firebase Hosting (MANDATORY for auth)
firebase deploy --only hosting
```

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Environment variables configured
- [ ] **Firebase Hosting deployed** (critical for authentication)

---

## Monitoring and Maintenance

### Code Quality Metrics

- **TypeScript Coverage:** 100% (strict mode)
- **Component Prop Types:** All components fully typed
- **Function Return Types:** Explicitly defined
- **Error Handling:** Comprehensive error boundaries

### Performance Metrics

- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3s

### Performance Optimization Guidelines

**Service Layer Performance (Updated 2024/09/24):**
- Remove artificial delays in development mock data
- Implement immediate fallback responses for better UX
- Avoid `setTimeout()` in data fetching unless absolutely necessary
- Prioritize instant feedback over simulated loading states

**Example of Optimized Service Function:**
```typescript
// Optimized - Instant response
export const getInitialQuotes = async (): Promise<Quote[]> => {
  try {
    return await getFirestoreQuotes();
  } catch (error) {
    console.warn('Firestore unavailable, using mock data');
    return mockQuotes; // Instant fallback
  }
};

// Avoid - Artificial delays
export const getInitialQuotes = async (): Promise<Quote[]> => {
  try {
    return await getFirestoreQuotes();
  } catch (error) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Remove this
    return mockQuotes;
  }
};
```

### Regular Maintenance Tasks

- **Weekly:** Review and update dependencies
- **Monthly:** Audit bundle size and performance
- **Quarterly:** Review and update documentation
- **As needed:** Security updates and patches

---

## Critical Lessons Learned

### Lesson #1: Firebase Hosting is Required for Google Auth (2025-10-20)

**What Happened:**
Google Authentication completely failed because Firebase Hosting was never deployed. The OAuth popup showed the application's home page instead of Google's login screen.

**Root Cause:**
- Firebase Auth uses `/__/auth/handler` endpoint for OAuth flow
- This endpoint only works after Firebase Hosting deployment
- Without deployment, the app's rewrite rules redirect ALL requests to `index.html`
- This breaks the OAuth flow completely

**Prevention:**
1. **Always deploy Hosting FIRST** before testing authentication
2. Check `FIREBASE_SETUP.md` Step 7 (marked as CRITICAL)
3. Verify auth handler URL returns Firebase page, not your app:
   ```bash
   curl -I https://your-project.firebaseapp.com/__/auth/handler
   ```

**Documentation Updates:**
- `FIREBASE_SETUP.md` - Added Step 7 with CRITICAL warning
- `docs/TROUBLESHOOTING.md` - Added detailed diagnosis guide
- `docs/development-process.md` - Added Firebase Hosting to deployment checklist

**Key Takeaway:**
Firebase Hosting deployment is NOT optional - it's a **prerequisite** for Google Authentication to work, even in local development.

---

## Troubleshooting

For detailed troubleshooting guides, see:
- `docs/TROUBLESHOOTING.md` - Comprehensive problem diagnosis and solutions
- `FIREBASE_SETUP.md` - Setup and configuration issues
- Project README - Quick reference
