# Architecture

The Angular frontend calls the API gateway, which forwards compatibility
routes to the appropriate service. The gateway also hosts SignalR.

| Component | Port | Responsibility |
| --- | --- | --- |
| Gateway | 5000 | Frontend routing and SignalR |
| Identity | 5101 | Users, addresses, profiles, login, KYC |
| Branches | 5102 | Branch and IFSC data |
| Accounts | 5103 | Account types, balances, accounts, transfers |
| Cards | 5104 | Card applications and controls |
| Transactions | 5105 | History, filtering, mini statements |
| Notifications | 5106 | Notifications and OTP |
| Loans | 5107 | Loan applications |
| Support | 5108 | Support chat endpoint |

Services use Domain models, Application use cases, Api endpoints, and
Infrastructure stores where applicable. These layers are folders within
service projects, rather than separate class-library projects per layer.

SQL schemas are separate by service. Cross-service IDs are integration
references rather than cross-database foreign keys. Support has no database
schema. Banking workflows may still depend on other services.

Runtime stores are currently in memory. Durable persistence and production
authentication require further implementation and review.
