using System;
using System.Collections.Generic;

namespace HomeEmergency.Application.DTOs.Admin;

public class PaginatedListDto<T>
{
    public List<T> Items { get; set; } = new List<T>();
    public int PageIndex { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }

    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public PaginatedListDto()
    {
    }

    public PaginatedListDto(List<T> items, int count, int pageIndex, int pageSize)
    {
        PageIndex = pageIndex;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }
}

