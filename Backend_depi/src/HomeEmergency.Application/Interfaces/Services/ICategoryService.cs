using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Application.DTOs.Categories;

namespace HomeEmergency.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto request);

    Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryDto request);

    Task<bool> DeleteCategoryAsync(Guid id);

    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();

    Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
}