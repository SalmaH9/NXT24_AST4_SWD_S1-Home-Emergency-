namespace HomeEmergency.Application.DTOs.Admin;

public class UserSearchFilterDto
{
    public string? SearchTerm { get; set; }
    public string? RoleFilter { get; set; }
    public string? StatusFilter { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    public string SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}

