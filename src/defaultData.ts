/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState } from "./types";

export const defaultState: AppState = {
  assumptions: {
    electricityRate: 0.12,
    waterRate: 1.50,
    gasRate: 0.80,
    targetGrossMargin: 0.45,
    vatRate: 0.13,
    benefitsRate: 0.15,
    equipmentLifeYears: 10,
    buildingLifeYears: 20,
    mohAllocationMethod: "Volume",
    utilityAllocationMethod: "Volume",
  },
  skus: [
    {
      skuCode: "SKU-001",
      skuName: "500ml Classic Oat Milk",
      category: "Plant Milk",
      volumeMl: 500,
      msrp: 2.99,
      distributorPrice: 1.80,
    },
    {
      skuCode: "SKU-002",
      skuName: "1L Barista Oat Milk",
      category: "Plant Milk",
      volumeMl: 1000,
      msrp: 4.99,
      distributorPrice: 3.00,
    },
    {
      skuCode: "SKU-003",
      skuName: "250ml Organic Almond Milk",
      category: "Plant Milk",
      volumeMl: 250,
      msrp: 1.99,
      distributorPrice: 1.20,
    },
    {
      skuCode: "SKU-004",
      skuName: "500ml Chocolate Coconut Milk",
      category: "Plant Milk",
      volumeMl: 500,
      msrp: 3.29,
      distributorPrice: 2.00,
    }
  ],
  materials: [
    {
      matCode: "RM-001",
      matName: "Organic Oat Base",
      unit: "kg",
      purchasePrice: 1.20,
      lossRate: 0.025,
    },
    {
      matCode: "RM-002",
      matName: "Almond Paste",
      unit: "kg",
      purchasePrice: 8.50,
      lossRate: 0.015,
    },
    {
      matCode: "RM-003",
      matName: "Coconut Cream",
      unit: "kg",
      purchasePrice: 3.80,
      lossRate: 0.020,
    },
    {
      matCode: "RM-004",
      matName: "Refined Sugar",
      unit: "kg",
      purchasePrice: 0.90,
      lossRate: 0.010,
    },
    {
      matCode: "RM-005",
      matName: "Premium Cocoa Powder",
      unit: "kg",
      purchasePrice: 6.00,
      lossRate: 0.020,
    },
    {
      matCode: "RM-006",
      matName: "Stabilizer Blend",
      unit: "kg",
      purchasePrice: 15.00,
      lossRate: 0.005,
    }
  ],
  packaging: [
    {
      pkgCode: "PKG-001",
      pkgName: "500ml PET Bottle",
      unit: "pcs",
      purchasePrice: 0.12,
      lossRate: 0.010,
    },
    {
      pkgCode: "PKG-002",
      pkgName: "1L TetraPak Carton",
      unit: "pcs",
      purchasePrice: 0.25,
      lossRate: 0.015,
    },
    {
      pkgCode: "PKG-003",
      pkgName: "250ml Glass Bottle",
      unit: "pcs",
      purchasePrice: 0.18,
      lossRate: 0.020,
    },
    {
      pkgCode: "PKG-004",
      pkgName: "Plastic Cap & Label",
      unit: "pcs",
      purchasePrice: 0.05,
      lossRate: 0.005,
    },
    {
      pkgCode: "PKG-005",
      pkgName: "Delivery Box (12x)",
      unit: "pcs",
      purchasePrice: 0.60,
      lossRate: 0.010,
    }
  ],
  bomRecipes: [
    // SKU-001
    { recipeId: "SKU-001-RM-001", skuCode: "SKU-001", itemType: "Material", itemCode: "RM-001", standardQty: 0.1500 },
    { recipeId: "SKU-001-RM-004", skuCode: "SKU-001", itemType: "Material", itemCode: "RM-004", standardQty: 0.0200 },
    { recipeId: "SKU-001-RM-006", skuCode: "SKU-001", itemType: "Material", itemCode: "RM-006", standardQty: 0.0010 },
    { recipeId: "SKU-001-PKG-001", skuCode: "SKU-001", itemType: "Packaging", itemCode: "PKG-001", standardQty: 1.0000 },
    { recipeId: "SKU-001-PKG-004", skuCode: "SKU-001", itemType: "Packaging", itemCode: "PKG-004", standardQty: 1.0000 },
    { recipeId: "SKU-001-PKG-005", skuCode: "SKU-001", itemType: "Packaging", itemCode: "PKG-005", standardQty: 0.0833 },

    // SKU-002
    { recipeId: "SKU-002-RM-001", skuCode: "SKU-002", itemType: "Material", itemCode: "RM-001", standardQty: 0.3200 },
    { recipeId: "SKU-002-RM-004", skuCode: "SKU-002", itemType: "Material", itemCode: "RM-004", standardQty: 0.0400 },
    { recipeId: "SKU-002-RM-006", skuCode: "SKU-002", itemType: "Material", itemCode: "RM-006", standardQty: 0.0020 },
    { recipeId: "SKU-002-PKG-002", skuCode: "SKU-002", itemType: "Packaging", itemCode: "PKG-002", standardQty: 1.0000 },
    { recipeId: "SKU-002-PKG-004", skuCode: "SKU-002", itemType: "Packaging", itemCode: "PKG-004", standardQty: 1.0000 },
    { recipeId: "SKU-002-PKG-005", skuCode: "SKU-002", itemType: "Packaging", itemCode: "PKG-005", standardQty: 0.0833 },

    // SKU-003
    { recipeId: "SKU-003-RM-002", skuCode: "SKU-003", itemType: "Material", itemCode: "RM-002", standardQty: 0.0600 },
    { recipeId: "SKU-003-RM-004", skuCode: "SKU-003", itemType: "Material", itemCode: "RM-004", standardQty: 0.0100 },
    { recipeId: "SKU-003-RM-006", skuCode: "SKU-003", itemType: "Material", itemCode: "RM-006", standardQty: 0.0005 },
    { recipeId: "SKU-003-PKG-003", skuCode: "SKU-003", itemType: "Packaging", itemCode: "PKG-003", standardQty: 1.0000 },
    { recipeId: "SKU-003-PKG-004", skuCode: "SKU-003", itemType: "Packaging", itemCode: "PKG-004", standardQty: 1.0000 },
    { recipeId: "SKU-003-PKG-005", skuCode: "SKU-003", itemType: "Packaging", itemCode: "PKG-005", standardQty: 0.0833 },

    // SKU-004
    { recipeId: "SKU-004-RM-003", skuCode: "SKU-004", itemType: "Material", itemCode: "RM-003", standardQty: 0.1200 },
    { recipeId: "SKU-004-RM-005", skuCode: "SKU-004", itemType: "Material", itemCode: "RM-005", standardQty: 0.0150 },
    { recipeId: "SKU-004-RM-004", skuCode: "SKU-004", itemType: "Material", itemCode: "RM-004", standardQty: 0.0250 },
    { recipeId: "SKU-004-RM-006", skuCode: "SKU-004", itemType: "Material", itemCode: "RM-006", standardQty: 0.0010 },
    { recipeId: "SKU-004-PKG-001", skuCode: "SKU-004", itemType: "Packaging", itemCode: "PKG-001", standardQty: 1.0000 },
    { recipeId: "SKU-004-PKG-004", skuCode: "SKU-004", itemType: "Packaging", itemCode: "PKG-004", standardQty: 1.0000 },
    { recipeId: "SKU-004-PKG-005", skuCode: "SKU-004", itemType: "Packaging", itemCode: "PKG-005", standardQty: 0.0833 }
  ],
  productionInputs: [
    // 2026-06 Production Inputs
    { prodId: "PRD-20260601-01", prodDate: "2026-06-01", skuCode: "SKU-001", actualQty: 12000, actualDlh: 24.0 },
    { prodId: "PRD-20260602-01", prodDate: "2026-06-02", skuCode: "SKU-002", actualQty: 6000, actualDlh: 15.0 },
    { prodId: "PRD-20260603-01", prodDate: "2026-06-03", skuCode: "SKU-003", actualQty: 8000, actualDlh: 24.0 },
    { prodId: "PRD-20260604-01", prodDate: "2026-06-04", skuCode: "SKU-004", actualQty: 4000, actualDlh: 10.0 },
    { prodId: "PRD-20260615-01", prodDate: "2026-06-15", skuCode: "SKU-001", actualQty: 13000, actualDlh: 26.0 },
    { prodId: "PRD-20260616-01", prodDate: "2026-06-16", skuCode: "SKU-002", actualQty: 6000, actualDlh: 15.0 },
    { prodId: "PRD-20260617-01", prodDate: "2026-06-17", skuCode: "SKU-003", actualQty: 7000, actualDlh: 21.0 },
    { prodId: "PRD-20260618-01", prodDate: "2026-06-18", skuCode: "SKU-004", actualQty: 4000, actualDlh: 10.0 },

    // 2026-07 Production Inputs
    { prodId: "PRD-20260701-01", prodDate: "2026-07-01", skuCode: "SKU-001", actualQty: 14000, actualDlh: 28.0 },
    { prodId: "PRD-20260702-01", prodDate: "2026-07-02", skuCode: "SKU-002", actualQty: 7000, actualDlh: 17.5 },
    { prodId: "PRD-20260703-01", prodDate: "2026-07-03", skuCode: "SKU-003", actualQty: 9000, actualDlh: 27.0 },
    { prodId: "PRD-20260704-01", prodDate: "2026-07-04", skuCode: "SKU-004", actualQty: 5000, actualDlh: 12.5 },
    { prodId: "PRD-20260715-01", prodDate: "2026-07-15", skuCode: "SKU-001", actualQty: 16000, actualDlh: 32.0 },
    { prodId: "PRD-20260716-01", prodDate: "2026-07-16", skuCode: "SKU-002", actualQty: 8000, actualDlh: 20.0 },
    { prodId: "PRD-20260717-01", prodDate: "2026-07-17", skuCode: "SKU-003", actualQty: 9000, actualDlh: 27.0 },
    { prodId: "PRD-20260718-01", prodDate: "2026-07-18", skuCode: "SKU-004", actualQty: 5000, actualDlh: 12.5 }
  ],
  directLabor: [
    {
      period: "2026-06",
      hourlyWorkers: 12,
      actualHours: 160,
      hourlyRate: 16.00,
      salariedWorkers: 6,
      salariedRate: 3400.00
    },
    {
      period: "2026-07",
      hourlyWorkers: 15,
      actualHours: 150,
      hourlyRate: 16.50,
      salariedWorkers: 6,
      salariedRate: 3500.00
    }
  ],
  mfgOverhead: [
    {
      period: "2026-06",
      equipmentAsset: 500000.00,
      buildingAsset: 1200000.00,
      consumables: 2400.00,
      maintenance: 3000.00
    },
    {
      period: "2026-07",
      equipmentAsset: 500000.00,
      buildingAsset: 1200000.00,
      consumables: 2800.00,
      maintenance: 3500.00
    }
  ],
  utilitiesCosts: [
    {
      period: "2026-06",
      elecUsageKwh: 24000,
      waterUsageM3: 480,
      gasUsageM3: 1100
    },
    {
      period: "2026-07",
      elecUsageKwh: 26000,
      waterUsageM3: 520,
      gasUsageM3: 1250
    }
  ],
  lastSaved: new Date().toISOString()
};
