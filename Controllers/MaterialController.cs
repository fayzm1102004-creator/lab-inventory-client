using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabInventory.API.Data;
using LabInventory.API.DTOs;
using LabInventory.API.Models;

namespace LabInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class MaterialController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaterialController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all materials, optionally filtered by search keyword.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Materials.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(m =>
                    m.MaterialName.Contains(search));
            }

            var materials = await query
                .OrderBy(m => m.MaterialName)
                .ToListAsync();

            return Ok(materials);
        }

        /// <summary>
        /// Get a single material by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return NotFound(new { message = "Material not found." });

            return Ok(material);
        }

        /// <summary>
        /// Create a new material (Admin only).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.MaterialName))
                return BadRequest(new { message = "Material name is required." });

            var material = new Material
            {
                MaterialName = dto.MaterialName,
                PhysicalLocation = dto.PhysicalLocation,
                IsAvailable = dto.IsAvailable,
                Quantity = dto.Quantity
            };

            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = material.Id }, material);
        }

        /// <summary>
        /// Update an existing material (Admin only).
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MaterialDto dto)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return NotFound(new { message = "Material not found." });

            material.MaterialName = dto.MaterialName;
            material.PhysicalLocation = dto.PhysicalLocation;
            material.IsAvailable = dto.IsAvailable;
            material.Quantity = dto.Quantity;

            await _context.SaveChangesAsync();

            return Ok(material);
        }

        /// <summary>
        /// Delete a material (Admin only).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return NotFound(new { message = "Material not found." });

            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Material deleted successfully." });
        }
    }
}
