# Local Setup

Install .NET 8 SDK, Node.js compatible with Angular 20, and npm.
SQL Server is optional for the in-memory demo and needed for SQL schema setup.

## Local Demo Credentials

Seeded profiles use customer@example.invalid, manager@example.invalid, and
pending@example.invalid. Set BANK_DEMO_CUSTOMER_PASSWORD,
BANK_DEMO_MANAGER_PASSWORD, and BANK_DEMO_PENDING_PASSWORD locally in the
Identity service terminal before startup. For example, PowerShell can prompt
without recording the value in command history:

```powershell
$env:BANK_DEMO_CUSTOMER_PASSWORD = Read-Host 'Local customer password' -MaskInput
$env:BANK_DEMO_MANAGER_PASSWORD = Read-Host 'Local manager password' -MaskInput
$env:BANK_DEMO_PENDING_PASSWORD = Read-Host 'Local applicant password' -MaskInput
```

Use PowerShell 7 for -MaskInput. Alternatively, set these variables through
your operating system's environment settings. No seeded login works until its
password is configured. In the Accounts service terminal, set
BANK_DEMO_ACCOUNT_PIN to a local numeric PIN before startup. No seeded account
balance check works until the PIN is configured. Seeded card CVVs and PINs are
generated at runtime. All seed identities and banking numbers are synthetic.

Do not commit your local values. These variables configure demo data; they
do not replace production password hashing, authorization, or secret management.

## Backend

From backend/:

```powershell
dotnet restore Bank.Microservices.sln
dotnet build Bank.Microservices.sln
```

Run each command in a separate terminal from backend/ and keep it open:

```powershell
dotnet run --no-launch-profile --project src/Services/Identity/Bank.IdentityService.Api -- --urls http://localhost:5101
dotnet run --no-launch-profile --project src/Services/Branches/Bank.BranchService.Api -- --urls http://localhost:5102
dotnet run --no-launch-profile --project src/Services/Accounts/Bank.AccountService.Api -- --urls http://localhost:5103
dotnet run --no-launch-profile --project src/Services/Cards/Bank.CardService.Api -- --urls http://localhost:5104
dotnet run --no-launch-profile --project src/Services/Transactions/Bank.TransactionService.Api -- --urls http://localhost:5105
dotnet run --no-launch-profile --project src/Services/Notifications/Bank.NotificationService.Api -- --urls http://localhost:5106
dotnet run --no-launch-profile --project src/Services/Loans/Bank.LoanService.Api -- --urls http://localhost:5107
dotnet run --no-launch-profile --project src/Services/Support/Bank.SupportService.Api -- --urls http://localhost:5108
dotnet run --no-launch-profile --project src/Gateway/Bank.ApiGateway -- --urls http://localhost:5000
```

Press Ctrl+C in each terminal to stop that service. Stop previous instances
before starting another instance on the same ports. Each service exposes /health.
These commands replace the convenience scripts omitted from this upload copy.

## Frontend

From frontend/:

```powershell
npm ci
npx ng serve --host localhost --port 4300
```

Open http://localhost:4300. Gateway and service roots redirect to the UI.
The gateway route catalog is at http://localhost:5000/routes.

## Database Schemas

Create separate SQL Server databases and apply their respective 001-schema.sql
scripts. See [database mapping](../database/README.md).
The APIs currently use in-memory stores; SQL integration is separate work.
