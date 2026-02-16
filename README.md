# AzanUI

AzanUI is a modern web user interface for AzanScheduler, built by [Lovable](https://lovable.dev/) using Vite, TypeScript, React, and shadcn-ui. It acts as the front end and dashboard to manage AzanScheduler configurations and settings.

![Build Status](https://img.shields.io/github/actions/workflow/status/MoRefaie/AzanUI/AzanUI-Build.yml)
![Latest Release](https://img.shields.io/github/v/release/MoRefaie/AzanUI)
![License](https://img.shields.io/github/license/MoRefaie/AzanUI)

## Features

- Fast, modern React UI
- Built with Vite, TypeScript, Tailwind CSS, and shadcn-ui
- Connects to AzanScheduler backend API ([AzanScheduler Repo](https://github.com/MoRefaie/AzanScheduler))
- Responsive design for desktop and mobile
- Easy configuration and deployment

## Architecture

```
+-------------------+
|   Azan UI (Web)   |
+-------------------+
        |
        v
+-------------------+
|    FastAPI API    |  <-- [AzanScheduler Backend](https://github.com/MoRefaie/AzanScheduler)
+-------------------+
```

## Quick Start

```bash
# Clone the repo
$ git clone https://github.com/MoRefaie/AzanUI.git
$ cd AzanUI

# Install dependencies
$ npm install

# Run the development server
$ npm run dev
```

## Configuration

- Edit `src/config.ts` or environment variables for API endpoints and settings.
- For production, build with `npm run build` and serve the static files.

## Logs & Media

- Logs are managed by the backend (AzanScheduler).
- Media files (icons, audio) are in the backend repo.

## Tests

- Place your test files in the `tests/` directory at the project root.
- Run tests with:
  ```bash
  npm test
  ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License. See [License.txt](License.txt).

## FAQ

- **How do I connect AzanUI to the backend?** Edit the API endpoint in your config or environment variables.
- **How do I run tests?** `npm test` in the project root.

## Troubleshooting

- Ensure the backend API is running and accessible.
- Check browser console for errors.
- Ensure all dependencies are installed and ports are available.

---

For more details, see the code and open an issue if you have questions!
