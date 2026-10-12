# Digital Banking Platform

Angular banking frontend with an ASP.NET Core API gateway, eight services,
and SQL Server schema scripts separated by service ownership.

## Structure

```text
frontend/                    Angular application and assets
backend/
  Bank.Microservices.sln     .NET 8 solution
  src/Gateway/               API gateway
  src/Services/              Identity, Branches, Accounts, Cards,
                             Transactions, Notifications, Loans, Support
database/                    SQL schemas for seven stateful services
docs/                        Setup, architecture, and upload instructions
.gitignore                   Dependency, build, editor, and secret exclusions
```

## Features

- Registration, login, profiles, addresses, and KYC
- Branch and IFSC data
- Accounts, balances, account types, and transfers
- Card applications and controls
- Transaction history, filtering, and mini statements
- Loans, notifications, OTP, and support chat

## Getting Started

Install .NET 8 SDK and Node.js compatible with Angular 20.
Follow [local setup](docs/SETUP.md) to build and start the services.
The frontend runs at http://localhost:4300 and calls the gateway at
http://localhost:5000. The gateway route catalog is at /routes.

Demo profiles use synthetic addresses such as customer@example.invalid and
manager@example.invalid. No demo passwords or PINs are committed. Configure
them locally as described in [local setup](docs/SETUP.md).

## Persistence

The services currently use seeded in-memory stores. Runtime changes are lost
when a service restarts. The SQL scripts supply separate database schemas;
applying them does not automatically connect the APIs to SQL Server.
Durable persistence requires SQL-backed repositories and connection configuration.

See [database mapping](database/README.md) and [architecture](docs/ARCHITECTURE.md).

## GitHub Upload

Upload this folder's contents to the repository root, so frontend/, backend/,
database/, and docs/ appear directly in the repository.
See [manual upload](docs/REPOSITORY_UPLOAD.md).
