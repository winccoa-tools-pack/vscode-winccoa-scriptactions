# WinCC OA Script Actions

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-1.107.1-007ACC.svg)

**Execute WinCC OA CTRL scripts directly from Visual Studio Code**

[Features](#-features) • [Installation](#-installation) • [Known Issues](#-known-issues)

</div>

---

> **Disclaimer:** This is one of the first releases of the WinCC OA Script Actions extension. Some edge cases may not be fully covered yet. Please check the [Known Issues](#-known-issues) section for workarounds if you encounter problems.  
> **Tip:** If the extension doesn't work as expected, try `Ctrl+Shift+P` → `Reload Window` to refresh.

---

## 🎬 See It In Action

![WinCC OA Script Actions Demo](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions/blob/develop/images/Animation.gif?raw=true)

---

## ✨ Features

### � Script Execution Pinning (NEW in 2.1.0)

- **Pin & Run**: Pin a specific script and execute it from any editor tab
- **Status Bar Widget**: Play button and script name dropdown for quick access
- **Execution Modes**:
  - **Active Script**: Run the file in the current editor
  - **Pinned Script**: Always run the pinned script, regardless of active editor
- **CodeLens Integration**: "Run" button at the top of every `.ctl` file
- **Keyboard Shortcut**: Press `Ctrl+F5` to run selected/pinned script
- **Persistent State**: Your pinned script and mode are saved across sessions

**Perfect for Test-Driven Development**: Edit your code, press `Ctrl+F5`, and instantly run your test script without switching tabs!

### �🚀 Quick Script Execution

- **Right-click execution**: Context menu on `.ctl` files in Explorer or editor
- **Command Palette**: Execute scripts via `Ctrl+Shift+P`
- **With Arguments**: Execute scripts with custom arguments
- **Event Connection Control**: Run with or without event manager connection
- Cross-platform support (Windows/Linux)

### ⚡ Performance Options

- **Fast Execution**: Scripts run with `-n` flag by default (no event connection)
- **Event Connection Mode**: Execute scripts that need event manager connectivity
- Configurable execution modes for different use cases

### 🔧 Flexible Configuration

- **Auto-Detection**: Automatic project detection via WinCC OA Control extension
- **Manual Configuration**: Static paths for WinCC OA installation and project
- Integration with WinCC OA Control extension for seamless project management

---

## ⚙️ Configuration

### Essential Settings

| Setting                             | Default     | Description                                                              |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `winccoa.scriptActions.pathSource`  | `automatic` | Path detection: `static` (manual) or `automatic` (via Control extension) |
| `winccoa.scriptActions.installPath` | -           | WinCC OA installation path (e.g., `C:/Siemens/Automation/WinCC_OA/3.20`) |
| `winccoa.scriptActions.projectName` | -           | Your WinCC OA project name                                               |

### Logging (for debugging)

| Setting                          | Default | Description                                              |
| -------------------------------- | ------- | -------------------------------------------------------- |
| `winccoa.scriptActions.logLevel` | `INFO`  | Log verbosity: `ERROR`, `WARN`, `INFO`, `DEBUG`, `TRACE` |

💡 **Tip**: Set log level to `DEBUG` when reporting bugs for detailed diagnostics.

---

## 🐛 Known Issues

### Current Limitations

1. **Automatic Path Detection**:

   - Requires WinCC OA Control extension installed
   - Falls back to manual configuration if Control extension not available

2. **Output Capture**:

   - Script output not captured in VS Code terminal
   - Scripts run in background WinCC OA process
   - Use `DebugN()` for debugging output (visible in WinCC OA logs)

3. **Parameter Passing**:
   - Arguments passed as plain strings
   - Complex data structures not supported

### Reporting Bugs

Found an issue? Please report it with:

- WinCC OA version
- Extension version (`1.0.0`)
- Script example that reproduces the issue
- Enable `DEBUG` logging and attach log output

[Report Issue on GitHub](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions/issues)

---

## 📝 Commands

Access via `Ctrl+Shift+P`:

| Command                                                        | Description                                             |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| `WinCC OA: Execute Script`                                     | Run current `.ctl` file without event connection (fast) |
| `WinCC OA: Execute Script with Arguments`                      | Run script with custom arguments                        |
| `WinCC OA: Execute Script with Event Connection`               | Run script WITH event manager connection                |
| `WinCC OA: Execute Script with Arguments and Event Connection` | Run script with arguments AND events                    |

**Right-Click Menu:**

- Right-click on `.ctl` file → "Start Script" (fast mode, no events)

---

## 🛠️ Requirements

- **VS Code:** 1.107.1 or higher
- **WinCC OA:** 3.19+ with `WCCOActrl` executable
- **WinCC OA Control:** Extension (optional, for auto-detection)
- **Valid WinCC OA project**

---

## 📚 Usage Example

### Command Format

```bash
# Windows (no event connection, fast)
C:/Siemens/Automation/WinCC_OA/3.20/bin/WCCOActrl.exe script.ctl -proj ProjectName -n

# Linux (with event connection)
/opt/WinCC_OA/3.20/bin/WCCOActrl script.ctl -proj ProjectName

# With arguments
WCCOActrl script.ctl -proj ProjectName -n testCaseId
```

### Script Example

```cpp
// File: scripts/utils/Example.ctl
main(string arg1, int arg2) {
    DebugN("Argument 1: " + arg1);
    DebugN("Argument 2: " + arg2);
}
```

---

## � Troubleshooting

### Performance

**Windows Performance:**  
The extension may run slower on Windows with longer loading times. Linux performs significantly better.

**Large Projects:**  
Very large projects may experience slower script execution startup times.

### General

**Extension Not Responding:**  
If the extension doesn't work as expected (script execution fails, project detection issues), reload VS Code:

1. Press `Ctrl+Shift+P`
2. Type and select `Reload Window`
3. This refreshes the extension

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📜 Disclaimer

WinCC OA and Siemens are trademarks of Siemens AG. This project is not affiliated with, endorsed by, or sponsored by Siemens AG. This is a community-driven open source project.

---

<div align="center">

Made with ❤️ for the WinCC OA community

[GitHub](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions) • [Issues](https://github.com/winccoa-tools-pack/vscode-winccoa-scriptactions/issues) • [WinCC OA Docs](https://www.winccoa.com)

</div>
