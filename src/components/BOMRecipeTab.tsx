/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DerivedData, DerivedBOMRecipe } from "../engine";
import { AppState, BOMRecipeRecord } from "../types";
import { Plus, Trash2, Filter, Sparkles, CheckCircle2 } from "lucide-react";

interface BOMRecipeTabProps {
  state: AppState;
  derivedData: DerivedData;
  onUpdateState: (newState: AppState) => void;
}

export default function BOMRecipeTab({
  state,
  derivedData,
  onUpdateState
}: BOMRecipeTabProps) {
  const [selectedSKUFilter, setSelectedSKUFilter] = useState<string>("ALL");
  const [skuInput, setSkuInput] = useState(state.skus[0]?.skuCode || "");
  const [itemTypeInput, setItemTypeInput] = useState<"Material" | "Packaging">("Material");
  const [itemCodeInput, setItemCodeInput] = useState("");
  const [standardQtyInput, setStandardQtyInput] = useState("0.1000");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 3,
      maximumFractionDigits: 4
    }).format(val);
  };

  // Get eligible item codes based on selected type
  const getEligibleItems = () => {
    if (itemTypeInput === "Material") {
      return state.materials.map(m => ({ code: m.matCode, name: m.matName }));
    } else {
      return state.packaging.map(p => ({ code: p.pkgCode, name: p.pkgName }));
    }
  };

  const eligibleItems = getEligibleItems();

  // Handle addition of a recipe record
  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCode = itemCodeInput || eligibleItems[0]?.code;
    if (!currentCode) {
      setMessage({ text: "Please select a valid material or packaging code.", type: "error" });
      return;
    }

    const qty = parseFloat(standardQtyInput);
    if (isNaN(qty) || qty <= 0) {
      setMessage({ text: "Please enter a valid, positive standard quantity.", type: "error" });
      return;
    }

    // Recipe ID: SKU_Code + "-" + Item_Code
    const recipeId = `${skuInput}-${currentCode}`;

    // Check if recipeId already exists
    if (state.bomRecipes.some(b => b.recipeId === recipeId)) {
      setMessage({ text: `Recipe mapping for SKU ${skuInput} and item ${currentCode} already exists.`, type: "error" });
      return;
    }

    const newRecord: BOMRecipeRecord = {
      recipeId,
      skuCode: skuInput,
      itemType: itemTypeInput,
      itemCode: currentCode,
      standardQty: qty
    };

    const updatedRecipes = [...state.bomRecipes, newRecord];
    onUpdateState({
      ...state,
      bomRecipes: updatedRecipes,
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: "Recipe item added successfully!", type: "success" });
    setStandardQtyInput("0.1000");
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle delete
  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = state.bomRecipes.filter(b => b.recipeId !== recipeId);
    onUpdateState({
      ...state,
      bomRecipes: updatedRecipes,
      lastSaved: new Date().toISOString()
    });
    setMessage({ text: "Recipe item deleted successfully.", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Filter rows
  const filteredRecipes = derivedData.bomRecipes.filter(
    r => selectedSKUFilter === "ALL" || r.skuCode === selectedSKUFilter
  );

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">BOM Recipes &amp; Process Specifications (Sheet 06)</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Define theoretical raw materials and packaging units required to produce one unit of SKU.
          </p>
        </div>
        
        {/* SKU filter tab select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1"><Filter size={14} /> Filter SKU:</span>
          <select
            value={selectedSKUFilter}
            onChange={(e) => setSelectedSKUFilter(e.target.value)}
            className="input-editable font-medium text-[#051C2C]"
            style={{ width: "200px" }}
          >
            <option value="ALL">Show All Recipes</option>
            {state.skus.map(s => (
              <option key={s.skuCode} value={s.skuCode}>
                {s.skuCode} - {s.skuName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Add/Modify Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 self-start">
          <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">Add Recipe Item</h3>
          
          {message && (
            <div 
              className={`p-3 rounded-md text-xs font-medium mb-4 ${
                message.type === "success" 
                  ? "bg-green-50 text-[#00C853] border border-green-100" 
                  : "bg-red-50 text-[#D32F2F] border border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleAddRecipe} className="space-y-4">
            {/* SKU selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Target SKU</label>
              <select
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                className="input-editable w-full"
              >
                {state.skus.map(s => (
                  <option key={s.skuCode} value={s.skuCode}>
                    {s.skuCode} - {s.skuName}
                  </option>
                ))}
              </select>
            </div>

            {/* Type selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Item Type</label>
              <select
                value={itemTypeInput}
                onChange={(e) => {
                  const type = e.target.value as "Material" | "Packaging";
                  setItemTypeInput(type);
                  // Update current selected item code to prevent mismatches
                  const items = type === "Material" 
                    ? state.materials.map(m => m.matCode)
                    : state.packaging.map(p => p.pkgCode);
                  setItemCodeInput(items[0] || "");
                }}
                className="input-editable w-full"
              >
                <option value="Material">Raw Material (Material)</option>
                <option value="Packaging">Packaging (Packaging)</option>
              </select>
            </div>

            {/* Item code selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Item Code &amp; Name</label>
              <select
                value={itemCodeInput}
                onChange={(e) => setItemCodeInput(e.target.value)}
                className="input-editable w-full"
              >
                {eligibleItems.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.code} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Standard Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Standard Qty (per SKU unit)</label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={standardQtyInput}
                onChange={(e) => setStandardQtyInput(e.target.value)}
                className="input-editable w-full"
                placeholder="e.g. 0.1500"
                required
              />
              <span className="text-[10px] text-neutral-400">
                {itemTypeInput === "Material" ? "Unit of measure: kg" : "Unit of measure: pcs"}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-medium py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Add Recipe Row
            </button>
          </form>

          {/* Quick note */}
          <div className="insight-block mt-6">
            <div className="flex items-start gap-1.5">
              <span className="text-[#2251FF] mt-0.5"><Sparkles size={14} /></span>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                Adding items dynamically updates standard cost. If you edit Raw Material or Packaging catalog prices, the theoretical BOM sum is instantly recalculated across all dependent SKUs.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Table of Items */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <h3 className="section-title text-sm">Sheet 06: BOM Catalog and Cost Structure</h3>
              <span className="text-xs text-neutral-400 font-medium font-mono">{filteredRecipes.length} rows loaded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="table-header text-left py-3 px-4">SKU Code</th>
                    <th className="table-header text-left py-3 px-4">Type</th>
                    <th className="table-header text-left py-3 px-4">Item Code</th>
                    <th className="table-header text-left py-3 px-4">Item Name</th>
                    <th className="table-header text-right py-3 px-4">Standard Qty</th>
                    <th className="table-header text-right py-3 px-4">Standard Unit Cost</th>
                    <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Item BOM Cost</th>
                    <th className="table-header text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredRecipes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-neutral-400 text-xs">
                        No recipe mappings found for SKU filter: <span className="font-semibold">{selectedSKUFilter}</span>
                      </td>
                    </tr>
                  ) : (
                    filteredRecipes.map((row, idx) => {
                      const isMaterial = row.itemType === "Material";
                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition">
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-neutral-500">{row.skuCode}</td>
                          <td className="py-2.5 px-4 text-xs">
                            <span 
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                isMaterial 
                                  ? "bg-emerald-50 text-[#00C853] border border-emerald-100" 
                                  : "bg-blue-50 text-[#2251FF] border border-blue-100"
                              }`}
                            >
                              {row.itemType}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.itemCode}</td>
                          <td className="py-2.5 px-4 text-xs text-neutral-700 font-medium">{row.itemName}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-[#051C2C]">{row.standardQty.toFixed(4)}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.standardUnitCost)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.itemBomCost)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteRecipe(row.recipeId)}
                              className="p-1 text-neutral-400 hover:text-[#D32F2F] hover:bg-red-50 rounded transition duration-150"
                              title="Delete Recipe Row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400 bg-neutral-50/20">
            * Standard Unit Cost is automatically fetched from Materials or Packaging master lists. It includes standard production loss rate mapping dynamically.
          </div>
        </div>

      </div>
    </div>
  );
}
