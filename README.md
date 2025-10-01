# Ikonik

Transform your SVG files into tree-shakeable, accessible React components with ease.

## Features

- **Tree-shakeable** - Import only the icons you need
- **Accessible** - Built-in ARIA support and semantic HTML
- **Customizable** - Control size, stroke width, and colors
- **Optimized** - Automatic SVG optimization with SVGO
- **TypeScript** - Full type safety out of the box
- **Zero Config** - Works out of the box with sensible defaults

## Installation

Add to your project as a dev dependency:

```bash
npm install -D ikonik
```

## Quick Start

**1. Prepare your SVG files:**

```
my-project/
├── icons-src/
│   ├── arrow-left.svg
│   ├── arrow-right.svg
│   └── home.svg
└── package.json
```

**2. Add a script to your package.json:**

```json
{
  "scripts": {
    "icons": "ikonik --src ./icons-src --out ./src/components/icons"
  }
}
```

**3. Generate React components:**

```bash
npm run icons
```

**4. Use in your React app:**

```tsx
import { ArrowLeft, ArrowRight, Home } from './components/icons';

function App() {
  return (
    <div>
      <Home size={32} />
      <ArrowLeft strokeWidth={2} />
      <ArrowRight className="text-blue-500" />
    </div>
  );
}
```

## Usage

```bash
ikonik [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --src <dir>` | Source SVG directory | `icons-src` |
| `-o, --out <dir>` | Output directory | `icons` |
| `--prefix <name>` | Component name prefix | `""` |
| `--size <num>` | Default size in pixels | `24` |
| `--stroke <num>` | Default stroke width | `1.5` |
| `--fill` | Treat icons as filled (no stroke) | `false` |

### Examples

**In package.json scripts:**

```json
{
  "scripts": {
    "icons": "ikonik",
    "icons:outline": "ikonik --src ./outline --out ./src/icons/outline",
    "icons:solid": "ikonik --src ./solid --out ./src/icons/solid --fill",
    "icons:branded": "ikonik --src ./brands --out ./src/icons/brands --prefix Brand"
  }
}
```

**Direct usage:**

```bash
# Basic
npx ikonik

# Custom directories
npx ikonik --src ./svg-files --out ./src/icons

# With prefix
npx ikonik --prefix Icon

# Filled icons
npx ikonik --fill --stroke 0

# Custom defaults
npx ikonik --size 20 --stroke 2
```

## Component API

Each generated component accepts these props:

```tsx
interface IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;        // Accessible title
  titleId?: string;      // Custom title ID
  size?: number;         // Icon size (width & height)
  strokeWidth?: number;  // Stroke width (outline icons)
  className?: string;    // CSS classes
  // ... all other SVG props
}
```

### Component Examples

```tsx
// Custom size
<Home size={48} />

// Custom stroke width
<ArrowLeft strokeWidth={3} />

// With title for accessibility
<Home title="Go to homepage" />

// With Tailwind CSS
<ArrowRight className="text-blue-500 hover:text-blue-700" />

// With inline styles
<Home style={{ color: '#FF0000' }} />

// Forward ref
const iconRef = useRef<SVGSVGElement>(null);
<Home ref={iconRef} />
```

## Output Structure

```
icons/
├── ArrowLeft.tsx
├── ArrowRight.tsx
├── Home.tsx
├── index.ts           # Barrel export
└── metadata.json      # Icon metadata
```

## Workflow Integration

### Watch Mode

Add a watch script to regenerate icons when SVGs change:

```json
{
  "scripts": {
    "icons": "ikonik --src ./icons-src --out ./src/icons",
    "icons:watch": "chokidar 'icons-src/**/*.svg' -c 'npm run icons'"
  },
  "devDependencies": {
    "chokidar-cli": "^3.0.0",
    "ikonik": "^1.0.0"
  }
}
```

### Pre-commit Hook

Ensure icons are always up to date:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run icons && git add src/icons"
    }
  }
}
```

### CI/CD

Check if icons are up to date in CI:

```yaml
# .github/workflows/ci.yml
- name: Check icons are up to date
  run: |
    npm run icons
    git diff --exit-code src/icons/ || (echo "Icons are out of date. Run 'npm run icons'" && exit 1)
```

## Framework Integration

### Next.js

```tsx
// app/page.tsx
import { Home, ArrowLeft } from '@/components/icons';

export default function Page() {
  return <Home size={32} />;
}
```

### Vite

```tsx
// src/App.tsx
import { Home } from './icons';

export default function App() {
  return <Home size={32} />;
}
```

### Remix

```tsx
// app/routes/_index.tsx
import { Home } from '~/components/icons';

export default function Index() {
  return <Home size={32} />;
}
```

## Styling

Icons inherit the current text color by default:

```tsx
// Using CSS
<div style={{ color: 'blue' }}>
  <Home /> {/* Will be blue */}
</div>

// Using Tailwind
<div className="text-red-500">
  <Home /> {/* Will be red */}
</div>

// Using CSS Modules
<div className={styles.iconContainer}>
  <Home />
</div>
```

## Usage Examples

### Basic Usage

```tsx
import { Home, Heart, Star } from './icons';

function App() {
  return (
    <div>
      <Home size={32} />
      <Heart size={48} strokeWidth={2} />
      <Star className="text-yellow-500" />
    </div>
  );
}
```

### With Dynamic Props

```tsx
import { Home } from './icons';

function IconButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Home
        size={isHovered ? 32 : 24}
        strokeWidth={isHovered ? 2.5 : 1.5}
        style={{ color: isHovered ? '#3b82f6' : '#64748b' }}
      />
    </button>
  );
}
```

### In Lists or Arrays

```tsx
import { Home, Heart, Star } from './icons';

function IconGrid() {
  const icons = [
    { Icon: Home, label: 'Home', color: '#3b82f6' },
    { Icon: Heart, label: 'Favorites', color: '#ef4444' },
    { Icon: Star, label: 'Premium', color: '#f59e0b' },
  ];

  return (
    <div className="icon-grid">
      {icons.map((item) => (
        <div key={item.label} className="icon-card">
          <item.Icon size={48} style={{ color: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
```

### As Card Components

```tsx
import { Home, Heart, Star } from './icons';

function FeatureCards() {
  const features = [
    {
      Icon: Home,
      title: 'Dashboard',
      description: 'Your personal space',
      color: '#3b82f6',
    },
    {
      Icon: Heart,
      title: 'Favorites',
      description: 'Save what you love',
      color: '#ef4444',
    },
    {
      Icon: Star,
      title: 'Premium',
      description: 'Unlock features',
      color: '#f59e0b',
    },
  ];

  return (
    <div className="cards">
      {features.map((feature) => (
        <div key={feature.title} className="card">
          <feature.Icon
            size={64}
            strokeWidth={2}
            style={{ color: feature.color }}
          />
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### With Conditional Styling

```tsx
import { Check, X } from './icons';

function StatusIcon({ isSuccess }: { isSuccess: boolean }) {
  const Icon = isSuccess ? Check : X;
  
  return (
    <Icon
      size={24}
      strokeWidth={3}
      style={{
        color: isSuccess ? '#22c55e' : '#ef4444',
      }}
    />
  );
}
```

### Navigation Menu

```tsx
import { Home, Heart, Star, Settings, User } from './icons';

function Navigation() {
  const menuItems = [
    { Icon: Home, label: 'Home', path: '/' },
    { Icon: Heart, label: 'Favorites', path: '/favorites' },
    { Icon: Star, label: 'Premium', path: '/premium' },
    { Icon: Settings, label: 'Settings', path: '/settings' },
    { Icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav>
      {menuItems.map((item) => (
        <a key={item.path} href={item.path}>
          <item.Icon size={20} strokeWidth={1.5} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

### Button with Icon

```tsx
import { ArrowRight } from './icons';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="btn">
      {children}
      <ArrowRight size={20} strokeWidth={2} />
    </button>
  );
}
```

### Icon with Animation

```tsx
import { Heart } from './icons';
import { useState } from 'react';

function LikeButton() {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <button onClick={() => setIsLiked(!isLiked)}>
      <Heart
        size={32}
        strokeWidth={isLiked ? 0 : 2}
        style={{
          color: isLiked ? '#ef4444' : '#64748b',
          fill: isLiked ? '#ef4444' : 'none',
          transition: 'all 0.3s',
          transform: isLiked ? 'scale(1.2)' : 'scale(1)',
        }}
      />
    </button>
  );
}
```
```

## Full Updated README Section

Here's where to place it in your README:

```markdown
## Component API

Each generated component accepts these props:

```tsx
interface IconProps extends React.SVGProps<SVGSVGElement> {
  title?: string;        // Accessible title
  titleId?: string;      // Custom title ID
  size?: number;         // Icon size (width & height)
  strokeWidth?: number;  // Stroke width (outline icons)
  className?: string;    // CSS classes
  // ... all other SVG props
}
```

## Usage Examples

### Basic Usage

```tsx
import { Home, Heart, Star } from './icons';

function App() {
  return (
    <div>
      <Home size={32} />
      <Heart size={48} strokeWidth={2} />
      <Star className="text-yellow-500" />
    </div>
  );
}
```

### With Dynamic Props

```tsx
import { Home } from './icons';

function IconButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Home
        size={isHovered ? 32 : 24}
        strokeWidth={isHovered ? 2.5 : 1.5}
        style={{ color: isHovered ? '#3b82f6' : '#64748b' }}
      />
    </button>
  );
}
```

### In Arrays/Objects

```tsx
import { Home, Heart, Star } from './icons';

function IconGrid() {
  const icons = [
    { Icon: Home, label: 'Home', color: '#3b82f6' },
    { Icon: Heart, label: 'Favorites', color: '#ef4444' },
    { Icon: Star, label: 'Premium', color: '#f59e0b' },
  ];

  return (
    <div className="icon-grid">
      {icons.map((item) => (
        <div key={item.label}>
          <item.Icon size={48} style={{ color: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
```

### As Card Components

```tsx
import { Home, Heart, Star } from './icons';

function FeatureCards() {
  const features = [
    { Icon: Home, title: 'Dashboard', color: '#3b82f6' },
    { Icon: Heart, title: 'Favorites', color: '#ef4444' },
    { Icon: Star, title: 'Premium', color: '#f59e0b' },
  ];

  return (
    <div className="cards">
      {features.map((feature) => (
        <div key={feature.title} className="card">
          <feature.Icon
            size={64}
            strokeWidth={2}
            style={{ color: feature.color }}
          />
          <h3>{feature.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

### With Conditional Rendering

```tsx
import { Check, X } from './icons';

function StatusIcon({ isSuccess }: { isSuccess: boolean }) {
  const Icon = isSuccess ? Check : X;
  
  return (
    <Icon
      size={24}
      style={{ color: isSuccess ? '#22c55e' : '#ef4444' }}
    />
  );
}
```

### Navigation Menu

```tsx
import { Home, Heart, Star, Settings } from './icons';

function Navigation() {
  const items = [
    { Icon: Home, label: 'Home' },
    { Icon: Heart, label: 'Favorites' },
    { Icon: Star, label: 'Premium' },
    { Icon: Settings, label: 'Settings' },
  ];

  return (
    <nav>
      {items.map((item) => (
        <a key={item.label} href="#">
          <item.Icon size={20} strokeWidth={1.5} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

## Component Examples

```tsx
// Custom size
<Home size={48} />

// Custom stroke width
<ArrowLeft strokeWidth={3} />

// With title for accessibility
<Home title="Go to homepage" />

// With Tailwind CSS
<ArrowRight className="text-blue-500 hover:text-blue-700" />

// With inline styles
<Home style={{ color: '#FF0000' }} />

// Forward ref
const iconRef = useRef<SVGSVGElement>(null);
<Home ref={iconRef} />
```

## Metadata

Ikonik generates a `metadata.json` file with information about all icons:

```json
{
  "count": 3,
  "icons": [
    {
      "name": "ArrowLeft",
      "file": "ArrowLeft",
      "tags": ["arrow", "left"]
    }
  ]
}
```

Use this for building icon pickers, documentation, or search functionality.

## Different Icon Styles

Generate multiple sets of icons with different styles:

```json
{
  "scripts": {
    "icons:outline": "ikonik --src ./icons/outline --out ./src/icons/outline --stroke 2",
    "icons:solid": "ikonik --src ./icons/solid --out ./src/icons/solid --fill",
    "icons:mini": "ikonik --src ./icons/mini --out ./src/icons/mini --size 20 --fill",
    "icons:all": "npm run icons:outline && npm run icons:solid && npm run icons:mini"
  }
}
```

Then import from different sets:

```tsx
import { Home } from './icons/outline';
import { Home as HomeSolid } from './icons/solid';
import { Home as HomeMini } from './icons/mini';
```

## Why Local Installation?

Modern best practices favor local installations because:

- **Version control** - Each project can use different versions
- **Reproducibility** - package.json locks the version for all team members
- **No conflicts** - Multiple projects can use different versions simultaneously
- **Better CI/CD** - Works seamlessly in automated environments

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [SVGO](https://github.com/svg/svgo) - SVG optimization
- [SVGR](https://react-svgr.com/) - SVG to React transformer
- Inspired by [Lucide](https://lucide.dev/) and [Heroicons](https://heroicons.com/)

## Links

- [Documentation](https://github.com/yourusername/ikonik#readme)
- [Report a Bug](https://github.com/yourusername/ikonik/issues)
- [Request a Feature](https://github.com/yourusername/ikonik/issues)