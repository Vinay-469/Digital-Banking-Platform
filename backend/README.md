# Banking Backend

Bank.Microservices.sln contains the .NET 8 API gateway and eight service projects.
Services use Domain, Application, Api, and Infrastructure folders as applicable.
Runtime persistence currently uses in-memory stores.

Build from this directory:

```powershell
dotnet restore Bank.Microservices.sln
dotnet build Bank.Microservices.sln
```

See [local setup](../docs/SETUP.md) for service startup commands and ports.
The gateway is http://localhost:5000 and frontend is http://localhost:4300.
SQL schemas are in ../database/.
