# Manual Repository Upload

Destination: <YOUR_REPOSITORY_URL>

Place the contents of Bank_Microservices_Repository at the repository root:

```text
backend/
database/
docs/
frontend/
.gitignore
README.md
```

Upload the extracted source files rather than the ZIP itself. Do not nest them
inside another Bank_Microservices_Repository folder in GitHub.

For an existing clone, preserve its .git directory and review existing files
before replacing files with matching names. Include the root .gitignore file,
which may be hidden in File Explorer.

From your existing clone:

```powershell
git status --short
git add README.md .gitignore backend database frontend docs
git diff --cached --stat
git commit -m "Add digital banking source and setup guides"
git push
```

No Git history, dependencies, generated output, logs, or IDE caches are included.
Use docs/SETUP.md to restore dependencies and start the application.
