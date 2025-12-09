# WinCC OA Script Actions

Execute WinCC OA CTRL scripts directly from VS Code.

## Features

- **Right-click on .ctl files** in Explorer → "Start Script"
- **Context menu in editor** for open .ctl files → "Start Script"
- Direct execution via `WCCOActrl.exe` (Windows) or `WCCOActrl` (Linux)
- Cross-platform support (Windows/Linux)

## Configuration

### Settings

- **`winccoa.scriptActions.pathSource`**: Choose how to determine paths
  - `static`: Manual configuration (use settings below)
  - `automatic`: Auto-detect from workspace (coming soon)

- **`winccoa.scriptActions.installPath`**: Path to WinCC OA installation
  - Windows: `C:/Siemens/Automation/WinCC_OA/3.20`
  - Linux: `/opt/WinCC_OA/3.20`

- **`winccoa.scriptActions.projectName`**: Your WinCC OA project name
  - Example: `MyProject`

## Usage

1. Open a `.ctl` file in VS Code
2. Right-click in the editor or on the file in Explorer
3. Select **"Start Script"**
4. The script will be executed via WCCOActrl

## Command

The extension builds and executes this command:

```bash
# Windows
C:/Siemens/Automation/WinCC_OA/3.20/bin/WCCOActrl.exe <full-path-to-script.ctl> -proj <ProjectName>

# Linux
/opt/WinCC_OA/3.20/bin/WCCOActrl <full-path-to-script.ctl> -proj <ProjectName>
```

## Requirements

- WinCC OA installation
- Valid WinCC OA project

## Known Limitations

- Automatic path detection is not yet implemented (placeholder for future npm package)
- No output capture (script runs in background)
- No parameter support (executes `main()` function)


### Key Contributors

- **Richard Janisch** ([@RichardJanisch](https://github.com/RichardJanisch)) - Creator & Lead Developer


## Disclaimer

WinCC OA and Siemens are trademarks of Siemens AG. This project is not affiliated with, endorsed by, or sponsored by Siemens AG. This is a community-driven open source project created to enhance the development experience for WinCC OA developers.

## License

This repository is licensed under the MIT License — see the included LICENSE file for details.

## Contributing

Contributions are welcome. If you want to add more extensions to the pack or suggestions for documentation, open an issue or submit a pull request.