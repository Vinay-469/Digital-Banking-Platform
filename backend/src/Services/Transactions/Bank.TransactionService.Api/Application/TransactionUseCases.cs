using System.Text;
using Bank.TransactionService.Api.Domain;
using Bank.TransactionService.Api.Infrastructure;

namespace Bank.TransactionService.Api.Application;

public sealed class TransactionUseCases
{
    private readonly TransactionStore store;

    public TransactionUseCases(TransactionStore store)
    {
        this.store = store;
    }

    public IReadOnlyList<Transaction> GetByUserId(int userId)
    {
        return store.Transactions
            .Where(transaction => transaction.UserId == userId)
            .OrderByDescending(transaction => transaction.TransactionDate)
            .ToList();
    }

    public IReadOnlyList<Transaction> GetRecentTransactions(int userId)
    {
        return GetByUserId(userId).Take(5).ToList();
    }

    public Transaction? GetByTransactionId(long id)
    {
        return store.Transactions.FirstOrDefault(transaction => transaction.TransactionId == id);
    }

    public IReadOnlyList<Transaction> FilterTransactions(int userId, bool type, DateTime? fromDate, DateTime? toDate)
    {
        return GetByUserId(userId)
            .Where(transaction => transaction.TransactionType == type)
            .Where(transaction => fromDate is null || transaction.TransactionDate >= fromDate.Value)
            .Where(transaction => toDate is null || transaction.TransactionDate <= toDate.Value)
            .ToList();
    }

    public IReadOnlyList<Transaction> SearchTransactions(int userId, string keyword)
    {
        keyword ??= "";
        return GetByUserId(userId)
            .Where(transaction =>
                transaction.Account.User.FullName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                (transaction.ReferenceAccount?.User.FullName.Contains(keyword, StringComparison.OrdinalIgnoreCase) ?? false) ||
                transaction.TransactionId.ToString().Contains(keyword, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public Transaction CreateTransaction(TransactionDto dto)
    {
        return store.Add(dto);
    }

    public byte[] GenerateMiniStatement(int accountId, DateTime fromDate, DateTime toDate)
    {
        var transactions = store.Transactions
            .Where(transaction => transaction.AccountId == accountId)
            .Where(transaction => transaction.TransactionDate >= fromDate && transaction.TransactionDate <= toDate)
            .OrderBy(transaction => transaction.TransactionDate)
            .ToList();

        var lines = new List<string>
        {
            "%PDF-1.4",
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj"
        };
        var text = $"Mini Statement Account {accountId} {fromDate:yyyy-MM-dd} to {toDate:yyyy-MM-dd} Transactions: {transactions.Count}";
        var stream = $"BT /F1 16 Tf 50 740 Td ({text}) Tj ET";
        lines.Add($"4 0 obj << /Length {stream.Length} >> stream");
        lines.Add(stream);
        lines.Add("endstream endobj");
        lines.Add("trailer << /Root 1 0 R >>");
        lines.Add("%%EOF");
        return Encoding.UTF8.GetBytes(string.Join('\n', lines));
    }
}
