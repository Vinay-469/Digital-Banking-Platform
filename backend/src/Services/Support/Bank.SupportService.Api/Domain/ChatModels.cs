namespace Bank.SupportService.Api.Domain;

public sealed class ChatRequest
{
    public string Question { get; set; } = "";
    public string? UserName { get; set; }
}
