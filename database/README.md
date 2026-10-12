# Service Database Schemas

Create each SQL Server database separately and apply its matching 001-schema.sql.

| Folder | Suggested database | Owner |
| --- | --- | --- |
| identity/ | BankIdentityDb | Identity |
| branches/ | BankBranchDb | Branches |
| accounts/ | BankAccountDb | Accounts |
| cards/ | BankCardDb | Cards |
| transactions/ | BankTransactionDb | Transactions |
| notifications/ | BankNotificationDb | Notifications |
| loans/ | BankLoanDb | Loans |

There are no foreign keys into other service databases. Cross-service IDs
remain integration references. Support has no SQL schema in this version.

The APIs currently use in-memory stores. Applying these scripts does not
activate SQL persistence; implement and configure SQL-backed repositories
for each service before relying on durable storage.
