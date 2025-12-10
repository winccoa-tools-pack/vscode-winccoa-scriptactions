# WinCC OA Script Actions

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.105.0-007ACC.svg)

**Execute WinCC OA CTRL scripts directly from Visual Studio Code**

⚠️ *Pre-Release Version - Not all features have been fully tested yet*

</div>

---

## ✨ Features

### 🚀 Quick Script Execution
Execute WinCC OA CTRL scripts with a single click:
- **Right-click on .ctl files** in Explorer → "Start Script"
- **Context menu in editor** for open .ctl files → "Start Script"
- Direct execution via `WCCOActrl.exe` (Windows) or `WCCOActrl` (Linux)
- Cross-platform support (Windows/Linux)

---

## 🚀 Getting Started

### Installation
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "WinCC OA Script Actions"
4. Click Install

### Configuration

Configure the extension to locate your WinCC OA installation and project.

---

## ⚙️ Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `winccoa.scriptActions.pathSource` | `static` | How to determine paths: `static` (manual) or `automatic` (auto-detect, coming soon) |
| `winccoa.scriptActions.installPath` | - | Path to WinCC OA installation (e.g., `C:/Siemens/Automation/WinCC_OA/3.20` or `/opt/WinCC_OA/3.20`) |
| `winccoa.scriptActions.projectName` | - | Your WinCC OA project name |

---

## 📋 Usage

1. Open a `.ctl` file in VS Code
2. Right-click in the editor or on the file in Explorer
3. Select **"Start Script"**
4. The script will be executed via WCCOActrl

### Command Format

The extension builds and executes this command:

```bash
# Windows
C:/Siemens/Automation/WinCC_OA/3.20/bin/WCCOActrl.exe <full-path-to-script.ctl> -proj <ProjectName>

# Linux
/opt/WinCC_OA/3.20/bin/WCCOActrl <full-path-to-script.ctl> -proj <ProjectName>
```

---

## 🛠️ Requirements

- Visual Studio Code 1.105.0 or higher
- WinCC OA installation with `WCCOActrl` executable
- Valid WinCC OA project

---

## ⚠️ Known Limitations

- Automatic path detection is not yet implemented
- No output capture (script runs in background)
- No parameter support (executes `main()` function)

---

## 📜 Disclaimer

WinCC OA and Siemens are trademarks of Siemens AG. This project is not affiliated with, endorsed by, or sponsored by Siemens AG. This is a community-driven open source project created to enhance the development experience for WinCC OA developers.

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions are welcome! Whether you want to:
- Report bugs or issues
- Suggest new features
- Improve documentation
- Submit code improvements

Please open an issue or submit a pull request on [GitHub](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions).

---

## 🔗 Links

- [GitHub Repository](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions)
- [Issue Tracker](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions/issues)
- [WinCC OA Documentation](https://www.winccoa.com)

---

<div align="center">

Made with ❤️ for the WinCC OA community

</div>
