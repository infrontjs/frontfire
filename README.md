# Frontfire - InfrontJS Development Environment

**⚠️ BETA NOTICE: Frontfire is currently in BETA and is intended for DEVELOPMENT USE ONLY. It is not recommended for production environments at this time.**

Frontfire is the official development and build environment created specifically for InfrontJS projects. It provides a streamlined development workflow with hot reloading, automatic builds, and project scaffolding capabilities.

Built entirely on the powerful [esbuild](https://esbuild.github.io/) ecosystem, Frontfire delivers blazing-fast builds and an efficient development experience without the complexity of traditional build tool configurations.

## Features

- **Zero Configuration** - Works out of the box with sensible defaults
- **Fast Development Server** - Hot reloading with esbuild's lightning-fast rebuilds
- **Project Scaffolding** - Quickly bootstrap new InfrontJS applications
- **Optimized Production Builds** - Automatic minification and bundling
- **Asset Management** - Automatic copying of assets and static files
- **Code Generators** - Generate States, Web Components, Path Objects, and more
- **Dictionary Generation** - Built-in i18n dictionary management

## Installation

### Global Installation (Recommended)

Install Frontfire globally via npm to use it across all your InfrontJS projects:

```bash
npm install -g frontfire
```

Verify the installation:

```bash
frontfire version
```

### Local Installation

Alternatively, install it locally in your project:

```bash
npm install --save-dev frontfire
```

When installed locally, run commands using npx:

```bash
npx frontfire version
```

## Quick Start

### Creating a New Project

The easiest way to get started is using the `create` command, which downloads the official InfrontJS starter template and sets up everything automatically:

```bash
frontfire create [appName] [appPath]
```

**Examples:**

```bash
# Create with default name in current directory
frontfire create

# Create with custom name
frontfire create "My Awesome App"

# Create with custom name and path
frontfire create "My Awesome App" ./my-app

# Create in specific absolute path
frontfire create "Dashboard" C:\projects\my-dashboard
```

After creation, follow the next steps shown in the terminal:

1. Change directory to your project
2. Modify `frontfire.json` and `package.json` to your needs
3. Run `npm install`
4. Run `frontfire start-dev` to start development
5. Run `frontfire build` to build for production

## Project Structure

A Frontfire project follows a specific structure to enable automatic building and serving:

```
my-app/
├── src/
│   ├── app/
│   │   ├── main.js          # Main JavaScript entry point (required)
│   │   └── main.css         # Main CSS entry point (required)
│   ├── assets/              # Static assets (images, fonts, etc.)
│   │   └── ...
│   └── index.html           # Main HTML file (required)
├── build/                   # Generated directory (auto-created)
│   ├── debug/               # Development builds
│   │   ├── app/             # Bundled JS/CSS
│   │   ├── assets/          # Copied assets
│   │   └── index.html       # Copied HTML
│   └── release/             # Production builds
│       ├── app/             # Minified & bundled JS/CSS
│       ├── assets/          # Copied assets
│       └── index.html       # HTML with cache-busting
├── frontfire.json           # Frontfire configuration
└── package.json             # Project dependencies
```

### Required Files

- **`src/app/main.js`** - Main JavaScript entry point
- **`src/app/main.css`** - Main CSS entry point
- **`src/index.html`** - Main HTML file
- **`src/assets/`** - Directory for static assets (optional but recommended)

**⚠️ Important:** Both `build/debug/` and `build/release/` directories are automatically deleted and recreated on each build. Never manually edit files in these directories as your changes will be lost.

## Development Workflow

### Starting the Development Server

Navigate to your project directory and run:

```bash
frontfire start-dev
```

This will:
1. Clean the `build/debug/` directory
2. Copy all files from `src/` to `build/debug/`
3. Bundle `main.js` and `main.css` with source maps
4. Start a development server (default: http://localhost:3000)
5. Watch for file changes and auto-reload the browser

**Hot Reloading:** Any changes to your JavaScript, CSS, or HTML files will automatically trigger a rebuild and browser reload.

### Building for Production

When you're ready to deploy, create an optimized production build:

```bash
frontfire build
```

This will:
1. Clean the `build/release/` directory
2. Bundle and minify `main.js` and `main.css`
3. Copy `index.html` to `build/release/`
4. Replace `INFRONTCACHEBREAK` placeholder with a timestamp for cache-busting
5. Generate source maps for debugging production issues

The optimized files will be in `build/release/` ready for deployment.

## Configuration

### frontfire.json

After running `frontfire create`, a `frontfire.json` file is created in your project root. This file allows you to customize the build process:

```json
{
  "buildDir": "build",
  "debug": {
    "server": {
      "indexType": "html",
      "port": 3000
    },
    "esbuild": {
      "bundle": true,
      "sourcemap": true,
      "minify": false,
      "logLevel": "info",
      "entryPoints": [".\\src\\app\\main.js", ".\\src\\app\\main.css"],
      "outdir": "build/debug/app/",
      "loader": {
        ".html": "text",
        ".png": "file"
      },
      "banner": {
        "js": "(() => { (new EventSource(\"/esbuild\")).addEventListener('change', () => location.reload() ); })();"
      }
    }
  },
  "release": {
    "esbuild": {
      "bundle": true,
      "sourcemap": true,
      "minify": true,
      "logLevel": "error",
      "entryPoints": [".\\src\\app\\main.js", ".\\src\\app\\main.css"],
      "outdir": "build/release/app",
      "loader": {
        ".html": "text",
        ".png": "file"
      }
    }
  }
}
```

**Configuration Options:**

- **`buildDir`** - Root directory for builds (default: "build")
- **`debug.server.port`** - Development server port (default: 3000)
- **`debug.server.indexType`** - Index file type: "html" or "php" (default: "html")
- **`debug.esbuild.*`** - esbuild options for development
- **`release.esbuild.*`** - esbuild options for production

All [esbuild configuration options](https://esbuild.github.io/api/) are supported within the `esbuild` objects.

## Code Generators

Frontfire includes powerful code generators to speed up development:

### Generate a State

```bash
frontfire gs <name>
```

Creates a new InfrontJS State class with an accompanying HTML template:

```bash
frontfire gs user-profile
```

Generates:
- `UserProfileState.js` - State class
- `UserProfileTemplate.html` - HTML template

**Options:**
- `--no-template` - Skip generating the HTML template file

Don't forget to register the state in your app:
```javascript
myApp.stateManager.add(UserProfileState);
```

### Generate a Web Component

```bash
frontfire gwc <name>
```

Creates a folder with a custom web component:

```bash
frontfire gwc my-button
```

Generates:
```
my-button/
├── index.js
└── template.html
```

### Generate a Path Object

```bash
frontfire gpo <name>
```

Creates a Path Object class for route management:

```bash
frontfire gpo admin-routes
```

Generates:
- `AdminRoutes.js` - Path Object class

### Generate a Dictionary

```bash
frontfire gd <pathToDictionary> [options]
```

Scans your project for `_lcs()` translation calls and generates/updates a dictionary file:

```bash
frontfire gd ./src/dictionary.js --countrycodes en,de,fr --defaulcountrycode en
```

**Options:**
- `-cc, --countrycodes <ccodes>` - Comma-separated country codes (default: "en,de")
- `-dcc, --defaulcountrycode <ccode>` - Default country code (default: "en")
- `-rp, --rootpath <rootpath>` - Root path to scan (default: "./")

## Working with Assets

Place all static assets (images, fonts, icons, etc.) in the `src/assets/` directory:

```
src/
└── assets/
    ├── images/
    │   ├── logo.png
    │   └── hero.jpg
    ├── fonts/
    │   └── custom-font.woff2
    └── icons/
        └── favicon.ico
```

During development (`frontfire start-dev`), all assets are copied to `build/debug/assets/`.

## Cache Busting

In your `index.html`, use the `INFRONTCACHEBREAK` placeholder for cache-busting:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My App</title>
    <link rel="stylesheet" href="/app/main.css?v=INFRONTCACHEBREAK">
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/app/main.js?v=INFRONTCACHEBREAK"></script>
</body>
</html>
```

When running `frontfire build`, all instances of `INFRONTCACHEBREAK` are replaced with the current timestamp, ensuring browsers don't serve cached versions after deployment.

## Command Reference

| Command | Description |
|---------|-------------|
| `frontfire create [name] [path]` | Create a new InfrontJS project |
| `frontfire start-dev` | Start development server with hot reload |
| `frontfire build` | Build optimized production bundle |
| `frontfire gs <name>` | Generate a new State |
| `frontfire gwc <name>` | Generate a Web Component |
| `frontfire gpo <name>` | Generate a Path Object |
| `frontfire gd <path> [options]` | Generate/update dictionary |
| `frontfire version` | Show Frontfire version |

## Troubleshooting

### Server Won't Start

- Check if port 3000 is already in use
- Try changing the port in `frontfire.json`
- Ensure `src/app/main.js` and `src/app/main.css` exist

### Changes Not Reflecting

- Check browser console for errors
- Verify the file you're editing is in the `src/` directory
- Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
- Restart the development server

### Build Fails

- Check for syntax errors in your JavaScript/CSS
- Ensure all imports are valid
- Review the error output from esbuild
- Verify `frontfire.json` is valid JSON

### Module Not Found

- Ensure the package is installed via npm
- Check the import path is correct
- For node_modules imports, make sure they're listed in `package.json`

## Best Practices

### Use .gitignore

Add the build directory to `.gitignore`:

```
build/
node_modules/
```

### Development Workflow

1. Run `frontfire start-dev` once when starting work
2. Make changes to files in `src/`
3. Browser auto-reloads on save
4. When ready to deploy, run `frontfire build`

### Import Paths

When importing modules in your JavaScript, use relative paths or module names:

```javascript
import * as IF from 'infrontjs';
import HomeState from './states/HomeState.js';
```

### HTML Templates in JS

You can import HTML files as text in your JavaScript:

```javascript
// In frontfire.json, ensure .html loader is set to "text"
import template from './templates/home.html';

// Use in your state
this.app.view.render(this.app.container, template);
```

## Links

- **GitHub Repository**: https://github.com/infrontjs/frontfire
- **Issues**: https://github.com/infrontjs/frontfire/issues
- **InfrontJS Documentation**: https://docs.infrontjs.com

## License

MIT

---

**Remember**: Frontfire is currently in BETA. Features may change, and you may encounter bugs. Please report any issues on GitHub to help improve the tool!
