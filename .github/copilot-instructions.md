# README für GitHub Copilot: WinCC OA Script Actions Extension

## Workspace-Übersicht

Dieser Workspace enthält das komplette **WinCC OA Tools Pack** - ein Ökosystem von VS Code Extensions für die WinCC OA Entwicklung.

### Repository-Struktur

```
workspace/
├── vscode-winccoa-core/              # Core Extension (Projekt-Management)
├── vscode-winccoa-logviewer/         # Log-Datei Viewer
├── vscode-winccoa-scriptactions/     # Script-Ausführung (DIESES REPO)
├── vscode-winccoa-tests/             # Test Explorer Integration
├── vscode-winccoa-ctrllang/          # CTL Language Support
├── vscode-winccoa-sidepanel/         # Side Panel UI
├── vscode-winccoa-mcp-server/        # MCP Server (GitHub Copilot Integration)
├── npm-shared-library-core/          # Gemeinsame Bibliothek
└── DevEnv/                           # WinCC OA Test-Projekt
```

### Repository-Abhängigkeiten

```
npm-shared-library-core (Basis für alle Extensions)
    ↓
vscode-winccoa-core (Zentrale Services)
    ↓
    ├── vscode-winccoa-logviewer (nutzt Core für Auto-Detection)
    ├── vscode-winccoa-scriptactions (nutzt Core für Projekt-Info)
    ├── vscode-winccoa-tests (nutzt Script Actions + Core)
    ├── vscode-winccoa-ctrllang (Language Server)
    └── vscode-winccoa-sidepanel (UI Integration)
```

**Wichtige Beziehungen:**
- **Core** → Alle anderen Extensions (optional oder required)
- **Script Actions** → Test Explorer (für Test-Ausführung)
- **LogViewer** → Core (für automatische Projekt-Erkennung, optional)
- **npm-shared-library-core** → Alle Extensions (gemeinsame Kommunikation mit WinCC OA)

### Extension-Rollen

| Extension | Rolle | Status |
|-----------|-------|--------|
| **Core** | Zentrale Projekt-Verwaltung, Status Bar | v0.2.2 |
| **LogViewer** | Echtzeit Log-Monitoring | v0.2.3 |
| **Script Actions** | Script-Ausführung mit Argumenten | v0.3.1 |
| **Test Explorer** | Unit-Test Integration | v0.2.2 |
| **CTL Language** | Syntax, IntelliSense, Language Server | dev |
| **Side Panel** | Custom UI Panel | dev |
| **npm-shared** | Gemeinsame WinCC OA Kommunikation | core lib |

## Projektübersicht (Script Actions)

Die **WinCC OA Script Actions** Extension ermöglicht die direkte Ausführung von CTL-Scripts aus VS Code heraus.

### Kernfunktionen
- Ausführung von CTL-Scripts mit Argumenten
- Integration mit WinCC OA Core für Projekt-Auswahl
- Command: `winccoa.executeScriptWithArgs`
- **WICHTIG**: Arguments werden als PLAIN STRINGS übergeben
- Keine `-lflag` oder `-` Präfixe - Argumente werden direkt nach `-proj <name>` angefügt

### Abhängigkeiten
- **WinCC OA Core Extension**: Für Projekt-Auswahl und Konfiguration
- **NPM Shared Library**: Gemeinsame WinCC OA Kommunikation

## Wichtige technische Details

### Argument Passing (CRITICAL!)
**Problem**: Früher wurden Argumente mit `-lflag` Präfixen übergeben
**Lösung**: v0.3.1 - Plain string arguments

```typescript
// CORRECT (v0.3.1):
executeScriptWithArgs(fileUri, "testCaseId")
// → /opt/WinCC_OA/bin/WCCOActrl script.ctl -proj DevEnv testCaseId

// WRONG (old):
executeScriptWithArgs(fileUri, "-lflag testCaseId")
executeScriptWithArgs(fileUri, "single start testCaseId")
```

### Test Explorer Integration
- Test Explorer nutzt `winccoa.executeScriptWithArgs` für einzelne Test-Ausführung
- Übergibt nur die `testCaseId` als Plain String
- Keine zusätzlichen Präfixe oder Flags

## Workflow-Regeln

### 1. Feature-Entwicklung
```bash
# 1. Feature starten (automatisch)
git flow feature start <feature-name-x.y.z>

# 2. Entwicklung + Compile nach JEDER Änderung
npm run compile

# 3. Version in package.json anpassen (PATCH für fix, MINOR für feature)
# 4. CHANGELOG.md aktualisieren mit neuem Eintrag

# 5. Testen bis alles funktioniert
make test-local

# 6. CRITICAL: Auf "Go" vom User warten!
# - User testet manuell
# - User sagt explizit "Go" oder ähnlich
# - NIEMALS ohne Freigabe committen!

# 7. Working Tree sauber machen
git status --short  # Prüfen auf unstaged changes
git stash push -m "Runtime artifacts"  # Bei DB/Build-Artefakten

# 8. Commit mit semantischem Präfix
git add -A
git commit -m "feat: beschreibung" # oder fix:, perf:, docs:, etc.

# 9. Feature finishen (automatisch mergen nach develop)
git flow feature finish <feature-name-x.y.z>
```

### 2. Commit-Präfixe (Conventional Commits)
- `feat:` - Neues Feature (MINOR Version bump)
- `fix:` - Bug Fix (PATCH Version bump)
- `perf:` - Performance Verbesserung
- `docs:` - Dokumentationsänderungen
- `refactor:` - Code-Umstrukturierung ohne Funktionsänderung
- `test:` - Test-Hinzufügungen/-Änderungen
- `chore:` - Build/Tooling Änderungen

### 3. Compile-Zyklus
**IMMER** nach Code-Änderungen:
```bash
npm run compile
```

### 4. Testing
```bash
make test-local  # Erstellt VSIX und öffnet Test-Extension-Host
```

## Versionsstände (Stand: 2025-12-26)
- **LogViewer**: v0.2.3 - UI Light Mode Fixes
- **Script Actions**: v0.3.1 - Plain arguments (keine `-lflag` Präfixe)
- **Test Explorer**: v0.2.2 - Single test execution + Performance
- **Core Extension**: v0.2.2 - Auto-select first project + startup fix

## Zusammenarbeit mit GitHub Copilot

### Erwartungen
- **Strukturiert arbeiten**: Klare Workflows, kein Code-Chaos
- **Kompilieren nach Änderungen**: Immer `npm run compile`
- **Git Flow einhalten**: Feature Branches, semantische Commits
- **Changelog pflegen**: Jede Version dokumentieren
- **Testen vor Merge**: "Go" vom User abwarten

### Communication Style
- **Deutsch**: Primäre Sprache für Kommunikation
- **Englisch**: Code, Commits, Dokumentation
- **Knapp & präzise**: Keine unnötigen Erklärungen
- **Technisch korrekt**: Exakte Begriffe, keine Vereinfachungen
