using Bank.CardService.Api.Domain;
using Bank.CardService.Api.Infrastructure;

namespace Bank.CardService.Api.Application;

public sealed class CardUseCases
{
    private readonly CardStore store;

    public CardUseCases(CardStore store)
    {
        this.store = store;
    }

    public DebitCardApplication Apply(ApplyDebitCardDto dto)
    {
        return store.AddApplication(dto);
    }

    public IReadOnlyList<DebitCardApplication> GetPendingApplications()
    {
        return store.Applications.Where(application => application.ApplicationStatus == "Pending").ToList();
    }

    public DebitCardApplication? GetApplicationById(int id)
    {
        return store.Applications.FirstOrDefault(application => application.ApplicationId == id);
    }

    public string ProcessApplication(int id, string status)
    {
        var application = GetApplicationById(id);
        if (application is null)
        {
            throw new InvalidOperationException("Application not found");
        }

        application.ApplicationStatus = status;
        application.ApprovedDate = DateTime.UtcNow;

        if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            store.IssueCard(application);
            return "Card approved and issued";
        }

        return "Card application rejected";
    }

    public bool UserHasActiveCards(int userId)
    {
        return store.Cards.Any(card => card.UserId == userId && card.Status == 1);
    }

    public IReadOnlyList<Card> GetActiveCards(int userId)
    {
        return store.Cards.Where(card => card.UserId == userId).ToList();
    }

    public bool UpdateCardStatus(int cardId, int status)
    {
        var card = store.Cards.FirstOrDefault(candidate => candidate.CardId == cardId);
        if (card is null)
        {
            return false;
        }

        card.Status = status;
        return true;
    }

    public string SetWithdrawLimit(int cardId, decimal limit)
    {
        var card = store.Cards.FirstOrDefault(candidate => candidate.CardId == cardId);
        if (card is null)
        {
            return "Card not found";
        }

        if (limit > card.CardType.MaxLimit)
        {
            return $"Limit cannot exceed {card.CardType.MaxLimit}";
        }

        card.WithdrawLimit = limit;
        return "Withdraw limit updated successfully";
    }

    public bool ResetPin(long cardNumber, int cvv, int newPin)
    {
        var card = store.Cards.FirstOrDefault(candidate => candidate.CardNumber == cardNumber && candidate.Cvv == cvv);
        if (card is null)
        {
            return false;
        }

        card.Pin = newPin;
        return true;
    }
}
