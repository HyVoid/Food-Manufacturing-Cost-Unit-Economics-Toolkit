/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, BOMRecipeRecord, SKURecord } from "./types";

// Derived Row Interfaces for displaying tables
export interface DerivedMaterialCost {
  matCode: string;
  matName: string;
  unit: string;
  purchasePrice: number;
  lossRate: number;
  standardCost: number; // Purchase_Price / (1 - Loss_Rate)
}

export interface DerivedPackagingCost {
  pkgCode: string;
  pkgName: string;
  unit: string;
  purchasePrice: number;
  lossRate: number;
  standardCost: number; // Purchase_Price / (1 - Loss_Rate)
}

export interface DerivedBOMRecipe {
  recipeId: string;
  skuCode: string;
  itemType: "Material" | "Packaging";
  itemCode: string;
  itemName: string;
  standardQty: number;
  standardUnitCost: number;
  itemBomCost: number; // standardQty * standardUnitCost
}

export interface DerivedDirectLabor {
  period: string;
  hourlyWorkers: number;
  actualHours: number;
  hourlyRate: number;
  hourlySubtotal: number; // Hourly_Workers * Actual_Hours * Hourly_Rate
  salariedWorkers: number;
  salariedRate: number;
  salariedSubtotal: number; // Salaried_Workers * Salaried_Rate
  benefitsCost: number; // (Hourly_Subtotal + Salaried_Subtotal) * benefitsRate
  totalDl: number; // Hourly_Subtotal + Salaried_Subtotal + Benefits_Cost
}

export interface DerivedManufacturingOverhead {
  period: string;
  equipmentAsset: number;
  buildingAsset: number;
  equipmentDepr: number; // Equipment_Asset / equipmentLifeYears / 12
  buildingDepr: number; // Building_Asset / buildingLifeYears / 12
  consumables: number;
  maintenance: number;
  totalMoh: number; // Equipment_Depr + Building_Depr + Consumables + Maintenance
}

export interface DerivedUtilitiesCosts {
  period: string;
  elecUsageKwh: number;
  waterUsageM3: number;
  gasUsageM3: number;
  elecCost: number; // Elec_Usage * electricityRate
  waterCost: number; // Water_Usage * waterRate
  gasCost: number; // Gas_Usage * gasRate
  totalUtilities: number; // Elec_Cost + Water_Cost + Gas_Cost
}

export interface AllocationEngineRow {
  period: string;
  skuCode: string;
  skuName: string;
  actualQty: number;
  actualDlh: number;
  totalPeriodQty: number;
  totalPeriodDlh: number;
  allocatedLabor: number;
  allocatedMoh: number;
  allocatedUtilities: number;
  totalAllocated: number;
}

export interface COGSUnitCostRow {
  period: string;
  skuCode: string;
  skuName: string;
  actualQty: number;
  unitBomCost: number;
  unitLaborCost: number;
  unitMohCost: number;
  unitUtilCost: number;
  actualUnitCost: number; // sum of unit costs
  totalCogs: number; // actualUnitCost * actualQty
}

export interface MarginBreakevenRow {
  period: string;
  skuCode: string;
  distPrice: number;
  unitCogs: number;
  unitMargin: number; // distPrice - unitCogs
  marginPct: number; // unitMargin / distPrice
  targetCheck: "✅ Pass" | "❌ Fail";
  unitCm: number; // distPrice - (unitBomCost + unitUtilCost)
  totalFc: number; // totalDl + totalMoh
  breakevenQty: number; // totalFc / unitCm
}

export interface DerivedDashboardData {
  period: string;
  totalQty: number;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  skuPassRate: number; // percentage of SKUs that pass target margin
}

export interface SpendingMapRow {
  category: string;
  amount: number;
  percentage: number;
}

export interface DerivedData {
  materials: DerivedMaterialCost[];
  packaging: DerivedPackagingCost[];
  bomRecipes: DerivedBOMRecipe[];
  directLabor: DerivedDirectLabor[];
  mfgOverhead: DerivedManufacturingOverhead[];
  utilitiesCosts: DerivedUtilitiesCosts[];
  allocationEngine: AllocationEngineRow[];
  cogsUnitCost: COGSUnitCostRow[];
  marginBreakeven: MarginBreakevenRow[];
  spendingMapsByPeriod: Record<string, SpendingMapRow[]>;
  dashboardsByPeriod: Record<string, DerivedDashboardData>;
  availablePeriods: string[];
}

export function calculateDerivedData(state: AppState): DerivedData {
  const { assumptions, skus, materials, packaging, bomRecipes, productionInputs, directLabor, mfgOverhead, utilitiesCosts } = state;

  // 1. Materials with 含损标准采购价
  const derivedMaterials: DerivedMaterialCost[] = materials.map(m => {
    const standardCost = m.lossRate < 1 ? m.purchasePrice / (1 - m.lossRate) : m.purchasePrice;
    return {
      ...m,
      standardCost
    };
  });

  // 2. Packaging with 含损标准装配价
  const derivedPackaging: DerivedPackagingCost[] = packaging.map(p => {
    const standardCost = p.lossRate < 1 ? p.purchasePrice / (1 - p.lossRate) : p.purchasePrice;
    return {
      ...p,
      standardCost
    };
  });

  // Helper maps for standard costs
  const materialCostMap = new Map<string, number>();
  derivedMaterials.forEach(m => materialCostMap.set(m.matCode, m.standardCost));

  const packagingCostMap = new Map<string, number>();
  derivedPackaging.forEach(p => packagingCostMap.set(p.pkgCode, p.standardCost));

  const materialNameMap = new Map<string, string>();
  materials.forEach(m => materialNameMap.set(m.matCode, m.matName));

  const packagingNameMap = new Map<string, string>();
  packaging.forEach(p => packagingNameMap.set(p.pkgCode, p.pkgName));

  // 3. BOM Recipe details
  const derivedBOMRecipes: DerivedBOMRecipe[] = bomRecipes.map(b => {
    let standardUnitCost = 0;
    let itemName = "Unknown";
    if (b.itemType === "Material") {
      standardUnitCost = materialCostMap.get(b.itemCode) || 0;
      itemName = materialNameMap.get(b.itemCode) || "Unknown";
    } else {
      standardUnitCost = packagingCostMap.get(b.itemCode) || 0;
      itemName = packagingNameMap.get(b.itemCode) || "Unknown";
    }
    return {
      ...b,
      itemName,
      standardUnitCost,
      itemBomCost: b.standardQty * standardUnitCost
    };
  });

  // Helper for SKU total BOM standard cost
  const skuBomCostMap = new Map<string, number>();
  skus.forEach(s => {
    const totalBom = derivedBOMRecipes
      .filter(b => b.skuCode === s.skuCode)
      .reduce((sum, item) => sum + item.itemBomCost, 0);
    skuBomCostMap.set(s.skuCode, totalBom);
  });

  // 4. Direct Labor by Period
  const derivedLabor: DerivedDirectLabor[] = directLabor.map(dl => {
    const hourlySubtotal = dl.hourlyWorkers * dl.actualHours * dl.hourlyRate;
    const salariedSubtotal = dl.salariedWorkers * dl.salariedRate;
    const benefitsCost = (hourlySubtotal + salariedSubtotal) * assumptions.benefitsRate;
    const totalDl = hourlySubtotal + salariedSubtotal + benefitsCost;
    return {
      ...dl,
      hourlySubtotal,
      salariedSubtotal,
      benefitsCost,
      totalDl
    };
  });

  const laborCostMap = new Map<string, DerivedDirectLabor>();
  derivedLabor.forEach(dl => laborCostMap.set(dl.period, dl));

  // 5. Manufacturing Overhead by Period
  const derivedMOH: DerivedManufacturingOverhead[] = mfgOverhead.map(m => {
    const equipmentDepr = assumptions.equipmentLifeYears > 0 ? m.equipmentAsset / assumptions.equipmentLifeYears / 12 : 0;
    const buildingDepr = assumptions.buildingLifeYears > 0 ? m.buildingAsset / assumptions.buildingLifeYears / 12 : 0;
    const totalMoh = equipmentDepr + buildingDepr + m.consumables + m.maintenance;
    return {
      ...m,
      equipmentDepr,
      buildingDepr,
      totalMoh
    };
  });

  const mohCostMap = new Map<string, DerivedManufacturingOverhead>();
  derivedMOH.forEach(m => mohCostMap.set(m.period, m));

  // 6. Utilities Costs by Period
  const derivedUtilities: DerivedUtilitiesCosts[] = utilitiesCosts.map(u => {
    const elecCost = u.elecUsageKwh * assumptions.electricityRate;
    const waterCost = u.waterUsageM3 * assumptions.waterRate;
    const gasCost = u.gasUsageM3 * assumptions.gasRate;
    const totalUtilities = elecCost + waterCost + gasCost;
    return {
      ...u,
      elecCost,
      waterCost,
      gasCost,
      totalUtilities
    };
  });

  const utilitiesCostMap = new Map<string, DerivedUtilitiesCosts>();
  derivedUtilities.forEach(u => utilitiesCostMap.set(u.period, u));

  // 7. Allocation Engine and COGS and Margin Breakeven
  // Get all unique combinations of (Period, SKU_Code) from ProductionInputs
  const prodInputsWithPeriod = productionInputs.map(pi => {
    const period = pi.prodDate.slice(0, 7); // YYYY-MM
    return {
      ...pi,
      period
    };
  });

  const uniqueCombosMap = new Map<string, { period: string; skuCode: string }>();
  prodInputsWithPeriod.forEach(pi => {
    if (pi.period && pi.skuCode) {
      const key = `${pi.period}|${pi.skuCode}`;
      uniqueCombosMap.set(key, { period: pi.period, skuCode: pi.skuCode });
    }
  });

  // Sorted unique periods and combos
  const combos = Array.from(uniqueCombosMap.values()).sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period); // newest first
    return a.skuCode.localeCompare(b.skuCode);
  });

  const uniquePeriods = Array.from(new Set(combos.map(c => c.period))).sort((a, b) => b.localeCompare(a));

  // Pre-calculate Period totals for volume and DLH
  const periodTotals = new Map<string, { totalQty: number; totalDlh: number; totalStandardBomCost: number }>();
  uniquePeriods.forEach(p => {
    const inputsInPeriod = prodInputsWithPeriod.filter(pi => pi.period === p);
    const totalQty = inputsInPeriod.reduce((sum, item) => sum + item.actualQty, 0);
    const totalDlh = inputsInPeriod.reduce((sum, item) => sum + item.actualDlh, 0);

    // Calculate total Standard BOM cost of all production in this period
    let totalStandardBomCost = 0;
    inputsInPeriod.forEach(item => {
      const bomCost = skuBomCostMap.get(item.skuCode) || 0;
      totalStandardBomCost += item.actualQty * bomCost;
    });

    periodTotals.set(p, { totalQty, totalDlh, totalStandardBomCost });
  });

  // Helper Maps for SKU attributes
  const skuMap = new Map<string, SKURecord>();
  skus.forEach(s => skuMap.set(s.skuCode, s));

  // 7a. Allocation Engine Rows
  const allocationEngine: AllocationEngineRow[] = combos.map(combo => {
    const { period, skuCode } = combo;
    const sku = skuMap.get(skuCode);
    const skuName = sku ? sku.skuName : "Unknown SKU";

    // Sum actualQty & actualDlh in this period for this SKU
    const inputsThisCombo = prodInputsWithPeriod.filter(pi => pi.period === period && pi.skuCode === skuCode);
    const actualQty = inputsThisCombo.reduce((sum, item) => sum + item.actualQty, 0);
    const actualDlh = inputsThisCombo.reduce((sum, item) => sum + item.actualDlh, 0);

    const totals = periodTotals.get(period) || { totalQty: 0, totalDlh: 0, totalStandardBomCost: 0 };
    const { totalQty: totalPeriodQty, totalDlh: totalPeriodDlh, totalStandardBomCost } = totals;

    // Direct Labor allocation
    const laborPool = laborCostMap.get(period)?.totalDl || 0;
    const allocatedLabor = totalPeriodQty > 0 ? (actualQty / totalPeriodQty) * laborPool : 0;

    // MOH Allocation
    const mohPool = mohCostMap.get(period)?.totalMoh || 0;
    let allocatedMoh = 0;
    if (assumptions.mohAllocationMethod === "Volume") {
      allocatedMoh = totalPeriodQty > 0 ? (actualQty / totalPeriodQty) * mohPool : 0;
    } else {
      allocatedMoh = totalPeriodDlh > 0 ? (actualDlh / totalPeriodDlh) * mohPool : 0;
    }

    // Utilities Allocation
    const utilPool = utilitiesCostMap.get(period)?.totalUtilities || 0;
    let allocatedUtilities = 0;
    if (assumptions.utilityAllocationMethod === "Volume") {
      allocatedUtilities = totalPeriodQty > 0 ? (actualQty / totalPeriodQty) * utilPool : 0;
    } else {
      // Standard BOM Allocation: based on (actualQty * unitBomCost) / totalStandardBomCost
      const skuBomCost = skuBomCostMap.get(skuCode) || 0;
      const skuTotalBomThisPeriod = actualQty * skuBomCost;
      allocatedUtilities = totalStandardBomCost > 0 ? (skuTotalBomThisPeriod / totalStandardBomCost) * utilPool : 0;
    }

    const totalAllocated = allocatedLabor + allocatedMoh + allocatedUtilities;

    return {
      period,
      skuCode,
      skuName,
      actualQty,
      actualDlh,
      totalPeriodQty,
      totalPeriodDlh,
      allocatedLabor,
      allocatedMoh,
      allocatedUtilities,
      totalAllocated
    };
  });

  const allocationRowMap = new Map<string, AllocationEngineRow>();
  allocationEngine.forEach(row => allocationRowMap.set(`${row.period}|${row.skuCode}`, row));

  // 7b. COGS Unit Cost Rows
  const cogsUnitCost: COGSUnitCostRow[] = combos.map(combo => {
    const { period, skuCode } = combo;
    const allocRow = allocationRowMap.get(`${period}|${skuCode}`);
    const actualQty = allocRow ? allocRow.actualQty : 0;
    const unitBomCost = skuBomCostMap.get(skuCode) || 0;

    const allocatedLabor = allocRow ? allocRow.allocatedLabor : 0;
    const allocatedMoh = allocRow ? allocRow.allocatedMoh : 0;
    const allocatedUtilities = allocRow ? allocRow.allocatedUtilities : 0;

    const unitLaborCost = actualQty > 0 ? allocatedLabor / actualQty : 0;
    const unitMohCost = actualQty > 0 ? allocatedMoh / actualQty : 0;
    const unitUtilCost = actualQty > 0 ? allocatedUtilities / actualQty : 0;

    const actualUnitCost = unitBomCost + unitLaborCost + unitMohCost + unitUtilCost;
    const totalCogs = actualUnitCost * actualQty;

    return {
      period,
      skuCode,
      skuName: allocRow?.skuName || "Unknown SKU",
      actualQty,
      unitBomCost,
      unitLaborCost,
      unitMohCost,
      unitUtilCost,
      actualUnitCost,
      totalCogs
    };
  });

  const cogsRowMap = new Map<string, COGSUnitCostRow>();
  cogsUnitCost.forEach(row => cogsRowMap.set(`${row.period}|${row.skuCode}`, row));

  // 7c. Margin & Breakeven Rows
  const marginBreakeven: MarginBreakevenRow[] = combos.map(combo => {
    const { period, skuCode } = combo;
    const sku = skuMap.get(skuCode);
    const distPrice = sku ? sku.distributorPrice : 0;

    const cogsRow = cogsRowMap.get(`${period}|${skuCode}`);
    const unitCogs = cogsRow ? cogsRow.actualUnitCost : 0;
    const unitBomCost = cogsRow ? cogsRow.unitBomCost : 0;
    const unitUtilCost = cogsRow ? cogsRow.unitUtilCost : 0;

    const unitMargin = distPrice - unitCogs;
    const marginPct = distPrice > 0 ? unitMargin / distPrice : 0;
    const targetCheck = marginPct >= assumptions.targetGrossMargin ? "✅ Pass" : "❌ Fail";

    // Unit Contribution Margin = distributorPrice - (unitBomCost + unitUtilCost)
    // (Materials and energy are considered variable, direct labor and moh are considered fixed)
    const unitCm = distPrice - (unitBomCost + unitUtilCost);

    // Total Fixed Cost of the Period = Total Labor + Total MOH
    const laborPool = laborCostMap.get(period)?.totalDl || 0;
    const mohPool = mohCostMap.get(period)?.totalMoh || 0;
    const totalFc = laborPool + mohPool;

    const breakevenQty = unitCm > 0 ? totalFc / unitCm : 0;

    return {
      period,
      skuCode,
      distPrice,
      unitCogs,
      unitMargin,
      marginPct,
      targetCheck,
      unitCm,
      totalFc,
      breakevenQty
    };
  });

  const marginRowMap = new Map<string, MarginBreakevenRow>();
  marginBreakeven.forEach(row => marginRowMap.set(`${row.period}|${row.skuCode}`, row));

  // 8. Spending Maps & Dashboards by Period
  const dashboardsByPeriod: Record<string, DerivedDashboardData> = {};
  const spendingMapsByPeriod: Record<string, SpendingMapRow[]> = {};

  uniquePeriods.forEach(p => {
    const cogsRowsThisPeriod = cogsUnitCost.filter(r => r.period === p);
    const marginRowsThisPeriod = marginBreakeven.filter(r => r.period === p);

    // Total Qty produced in this period
    const totalQty = cogsRowsThisPeriod.reduce((sum, row) => sum + row.actualQty, 0);

    // Total Estimated Revenue in this period = Sum(Actual_Qty * Distributor_Price)
    const totalRevenue = cogsRowsThisPeriod.reduce((sum, row) => {
      const marginRow = marginRowMap.get(`${p}|${row.skuCode}`);
      const price = marginRow ? marginRow.distPrice : 0;
      return sum + (row.actualQty * price);
    }, 0);

    // Total COGS = Sum(Total_COGS)
    const totalCogs = cogsRowsThisPeriod.reduce((sum, row) => sum + row.totalCogs, 0);

    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = totalRevenue > 0 ? grossProfit / totalRevenue : 0;

    // SKU margin pass rate
    const passedSkuCount = marginRowsThisPeriod.filter(r => r.targetCheck === "✅ Pass").length;
    const totalSkuCount = marginRowsThisPeriod.length;
    const skuPassRate = totalSkuCount > 0 ? passedSkuCount / totalSkuCount : 0;

    dashboardsByPeriod[p] = {
      period: p,
      totalQty,
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMarginPct,
      skuPassRate
    };

    // Calculate Spending Map Category Expenditures
    // Standard RM Cost = Sum(Actual_Qty * Standard_Cost_of_Materials_For_SKU)
    const totalRmSpend = cogsRowsThisPeriod.reduce((sum, row) => {
      // RM standard cost portion in BOM: we filter bomRecipe for materials of this sku
      const materialBomCost = derivedBOMRecipes
        .filter(b => b.skuCode === row.skuCode && b.itemType === "Material")
        .reduce((sSum, item) => sSum + item.itemBomCost, 0);
      return sum + (row.actualQty * materialBomCost);
    }, 0);

    // Standard PKG Cost = Sum(Actual_Qty * Standard_Cost_of_Pkg_For_SKU)
    const totalPkgSpend = cogsRowsThisPeriod.reduce((sum, row) => {
      const pkgBomCost = derivedBOMRecipes
        .filter(b => b.skuCode === row.skuCode && b.itemType === "Packaging")
        .reduce((sSum, item) => sSum + item.itemBomCost, 0);
      return sum + (row.actualQty * pkgBomCost);
    }, 0);

    const laborSpend = laborCostMap.get(p)?.totalDl || 0;
    const mohSpend = mohCostMap.get(p)?.totalMoh || 0;
    const utilitiesSpend = utilitiesCostMap.get(p)?.totalUtilities || 0;

    const totalSpend = totalRmSpend + totalPkgSpend + laborSpend + mohSpend + utilitiesSpend;

    spendingMapsByPeriod[p] = [
      { category: "Raw Materials (BOM RM)", amount: totalRmSpend, percentage: totalSpend > 0 ? totalRmSpend / totalSpend : 0 },
      { category: "Packaging Materials (BOM PKG)", amount: totalPkgSpend, percentage: totalSpend > 0 ? totalPkgSpend / totalSpend : 0 },
      { category: "Direct Labor (Salaries & Benefits)", amount: laborSpend, percentage: totalSpend > 0 ? laborSpend / totalSpend : 0 },
      { category: "Manufacturing Overhead (MOH Depr & Maint)", amount: mohSpend, percentage: totalSpend > 0 ? mohSpend / totalSpend : 0 },
      { category: "Utilities & Power (Energy)", amount: utilitiesSpend, percentage: totalSpend > 0 ? utilitiesSpend / totalSpend : 0 },
    ];
  });

  return {
    materials: derivedMaterials,
    packaging: derivedPackaging,
    bomRecipes: derivedBOMRecipes,
    directLabor: derivedLabor,
    mfgOverhead: derivedMOH,
    utilitiesCosts: derivedUtilities,
    allocationEngine,
    cogsUnitCost,
    marginBreakeven,
    spendingMapsByPeriod,
    dashboardsByPeriod,
    availablePeriods: uniquePeriods
  };
}
