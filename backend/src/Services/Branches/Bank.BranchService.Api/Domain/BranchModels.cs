namespace Bank.BranchService.Api.Domain;

public sealed class GenericResponse
{
    public bool Status { get; set; }
    public object? Data { get; set; }
    public string? Message { get; set; }
}

public sealed class Branch
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = "";
    public string BranchCode { get; set; } = "";
    public string? BranchLocation { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
    public string? ContactNumber { get; set; }
    public string? Email { get; set; }
    public string? IfscCode { get; set; }
    public DateTime? OpeningDate { get; set; }
    public int? NumEmployees { get; set; }
    public bool IsActive { get; set; } = true;
}
