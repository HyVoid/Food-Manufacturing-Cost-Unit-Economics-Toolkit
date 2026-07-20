/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Assumptions {
  electricityRate: number; // B4
  waterRate: number; // B5
  gasRate: number; // B6
  targetGrossMargin: number; // B7
  vatRate: number; // B8
  benefitsRate: number; // B9
  equipmentLifeYears: number; // B15
  buildingLifeYears: number; // B16
  mohAllocationMethod: "Volume" | "DLH"; // B23
  utilityAllocationMethod: "Volume" | "Standard BOM"; // B24
}

export interface SKURecord {
  skuCode: string;
  skuName: string;
  category: string;
  volumeMl: number;
  msrp: number;
  distributorPrice: number;
}

export interface MaterialCostRecord {
  matCode: string;
  matName: string;
  unit: string;
  purchasePrice: number;
  lossRate: number; // decimal, e.g. 0.03
}

export interface PackagingCostRecord {
  pkgCode: string;
  pkgName: string;
  unit: string;
  purchasePrice: number;
  lossRate: number; // decimal, e.g. 0.015
}

export interface BOMRecipeRecord {
  recipeId: string; // SKU_Code + "-" + Item_Code
  skuCode: string;
  itemType: "Material" | "Packaging";
  itemCode: string;
  standardQty: number;
}

export interface ProductionInputRecord {
  prodId: string;
  prodDate: string; // YYYY-MM-DD
  skuCode: string;
  actualQty: number;
  actualDlh: number; // hours
}

export interface DirectLaborRecord {
  period: string; // YYYY-MM
  hourlyWorkers: number;
  actualHours: number;
  hourlyRate: number;
  salariedWorkers: number;
  salariedRate: number;
}

export interface ManufacturingOverheadRecord {
  period: string; // YYYY-MM
  equipmentAsset: number;
  buildingAsset: number;
  consumables: number;
  maintenance: number;
}

export interface UtilitiesCostsRecord {
  period: string; // YYYY-MM
  elecUsageKwh: number;
  waterUsageM3: number;
  gasUsageM3: number;
}

// Full app state
export interface AppState {
  assumptions: Assumptions;
  skus: SKURecord[];
  materials: MaterialCostRecord[];
  packaging: PackagingCostRecord[];
  bomRecipes: BOMRecipeRecord[];
  productionInputs: ProductionInputRecord[];
  directLabor: DirectLaborRecord[];
  mfgOverhead: ManufacturingOverheadRecord[];
  utilitiesCosts: UtilitiesCostsRecord[];
  lastSaved: string; // ISO date string
}
