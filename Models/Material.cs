using System.ComponentModel.DataAnnotations;

namespace LabInventory.API.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string MaterialName { get; set; } = string.Empty;

        [Required]
        [MaxLength(300)]
        public string PhysicalLocation { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;

        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
