# zerojin

A collection of React hooks and components for modern web applications.

## Features

-   🚀 **Advanced Debounce & Throttle** - Leading/trailing options, cancel/flush methods
-   📦 **Zero Dependencies** - Lightweight and tree-shakeable
-   🔒 **Type-Safe** - Perfect TypeScript support with full type inference
-   🛠️ **Production Ready** - Battle-tested patterns for real-world applications

## Documentation

📚 **[View Full Documentation](https://weeey.github.io/zerojin-core/)**

Quick links:

-   [Getting Started](https://weeey.github.io/zerojin-core/guide/getting-started)
-   [Installation Guide](https://weeey.github.io/zerojin-core/guide/installation)
-   [API Reference](https://weeey.github.io/zerojin-core/api/hooks/)

## Installation

```bash
npm install zerojin
```

## Quick Example

```tsx
import { useDebounce } from 'zerojin';

function SearchInput() {
    const handleSearch = useDebounce((query: string) => {
        console.log('Searching:', query);
        // Call your API
    }, 500);

    return (
        <input
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type to search..."
        />
    );
}
```

## Available Hooks

-   [`useDebounce`](https://weeey.github.io/zerojin-core/api/hooks/useDebounce) - Delay execution until after inactivity
-   [`useThrottle`](https://weeey.github.io/zerojin-core/api/hooks/useThrottle) - Limit execution to once per period

## Requirements

-   React >= 18.0.0
-   TypeScript >= 5.0.0 (recommended)

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run type-check
```

## License

MIT
