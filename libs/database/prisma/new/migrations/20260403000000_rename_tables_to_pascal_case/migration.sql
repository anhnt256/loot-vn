-- Rename snake_case tables to PascalCase to match project convention
RENAME TABLE `inventory_transactions` TO `InventoryTransaction`;
RENAME TABLE `material_unit_conversions` TO `MaterialUnitConversion`;
RENAME TABLE `materials` TO `Material`;
RENAME TABLE `recipe_items` TO `RecipeItem`;
RENAME TABLE `recipe_versions` TO `RecipeVersion`;
RENAME TABLE `recipes` TO `Recipe`;
