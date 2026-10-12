using Bank.SupportService.Api.Domain;

namespace Bank.SupportService.Api.Application;

public sealed class ChatUseCases
{
    public string Ask(ChatRequest request)
    {
        var name = string.IsNullOrWhiteSpace(request.UserName) ? "there" : request.UserName;
        var question = request.Question.ToLowerInvariant();

        if (question.Contains("balance"))
        {
            return $"Hi {name}, open My Accounts and choose View Balance. For security, the account PIN is required.";
        }

        if (question.Contains("card"))
        {
            return $"Hi {name}, you can apply for a debit card from Cards, and track approvals from Debit Card Applications.";
        }

        if (question.Contains("transfer") || question.Contains("ifsc"))
        {
            return $"Hi {name}, use Bank Transfer with the receiver account number and IFSC. The gateway will route the request to the account service.";
        }

        return $"Hi {name}, I can help with accounts, cards, transfers, KYC, notifications, OTP, and mini statements.";
    }
}
