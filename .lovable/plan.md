

## Add Node.js Memory Limit to Build Scripts

Increase the heap size for the build process by prefixing build scripts with `NODE_OPTIONS=--max-old-space-size=4096`.

### Change: `package.json`

Update the `build` and `build:dev` scripts:

```json
"build": "NODE_OPTIONS=--max-old-space-size=4096 vite build",
"build:dev": "NODE_OPTIONS=--max-old-space-size=4096 vite build --mode development",
```

