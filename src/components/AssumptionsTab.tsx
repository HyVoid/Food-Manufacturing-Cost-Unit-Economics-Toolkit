/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppState, Assumptions } from "../types";
import { Info, ShieldAlert, Sparkles, Sliders } from "lucide-react";

interface AssumptionsTabProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export default function AssumptionsTab({
  state,
  onUpdateState
}: AssumptionsTabProps) {
  const { assumptions } = state;

  const handleUpdateAssumptions = (key: keyof Assumptions, val: any) => {
    onUpdateState({
      ...state,
      assumptions: {
        ...state.assumptions,
        [key]: val
      },
      lastSaved: new Date().toISOString()
    });
  };

  return (
    <div className="animate-fade-up space-y-6">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title flex items-center gap-1.5"><Sliders size={20} className="text-[#2251FF]" /> Global Assumptions &amp; Settings (Sheet 10)</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Configure default utility tariff rates, depreciation terms, corporate gross margin thresholds, and allocation methods.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Utility Rates & Margin Targets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">Rates &amp; Gross Targets</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Electricity Rate ($ / kWh)</label>
                <input
                  type="number"
                  step="0.001"
                  value={assumptions.electricityRate}
                  onChange={(e) => handleUpdateAssumptions("electricityRate", parseFloat(e.target.value) || 0)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Production Water Rate ($ / m³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={assumptions.waterRate}
                  onChange={(e) => handleUpdateAssumptions("waterRate", parseFloat(e.target.value) || 0)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Natural Gas Rate ($ / m³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={assumptions.gasRate}
                  onChange={(e) => handleUpdateAssumptions("gasRate", parseFloat(e.target.value) || 0)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Corporate Margin Target (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={assumptions.targetGrossMargin * 100}
                  onChange={(e) => handleUpdateAssumptions("targetGrossMargin", (parseFloat(e.target.value) || 0) / 100)}
                  className="input-editable font-mono font-semibold text-[#00C853]"
                />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-4 italic">
            * Higher target margin increases strictness of SKU Pass evaluation.
          </div>
        </div>

        {/* Card 2: Regulatory Tax & Capital Assets Depreciation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">Depreciation &amp; Taxes</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Value Added Tax (VAT %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={assumptions.vatRate * 100}
                  onChange={(e) => handleUpdateAssumptions("vatRate", (parseFloat(e.target.value) || 0) / 100)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Direct Labor Benefits (Multiplier %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={assumptions.benefitsRate * 100}
                  onChange={(e) => handleUpdateAssumptions("benefitsRate", (parseFloat(e.target.value) || 0) / 100)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Equipment Depr Term (Years)</label>
                <input
                  type="number"
                  value={assumptions.equipmentLifeYears}
                  onChange={(e) => handleUpdateAssumptions("equipmentLifeYears", parseInt(e.target.value) || 0)}
                  className="input-editable font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Building Depr Term (Years)</label>
                <input
                  type="number"
                  value={assumptions.buildingLifeYears}
                  onChange={(e) => handleUpdateAssumptions("buildingLifeYears", parseInt(e.target.value) || 0)}
                  className="input-editable font-mono"
                />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-4 italic">
            *直线折旧 (Straight-line depreciation) method is used to amortize overhead.
          </div>
        </div>

        {/* Card 3: Overhead Cost Allocation Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">Allocation Methodology</h3>
            <div className="space-y-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Manufacturing Overhead (MOH) Method</label>
                <select
                  value={assumptions.mohAllocationMethod}
                  onChange={(e) => handleUpdateAssumptions("mohAllocationMethod", e.target.value as "Volume" | "DLH")}
                  className="input-editable font-semibold text-[#051C2C]"
                >
                  <option value="Volume">Volume-based (By SKU Output Qty)</option>
                  <option value="DLH">Labor-based (By Batch Direct Hours)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Workshop Energy &amp; Utilities Method</label>
                <select
                  value={assumptions.utilityAllocationMethod}
                  onChange={(e) => handleUpdateAssumptions("utilityAllocationMethod", e.target.value as "Volume" | "Standard BOM")}
                  className="input-editable font-semibold text-[#051C2C]"
                >
                  <option value="Volume">Volume-based (By SKU Output Qty)</option>
                  <option value="Standard BOM">BOM Cost-based (Weighted Recipe Cost)</option>
                </select>
              </div>
            </div>

            <div className="insight-block mt-6">
              <div className="flex items-start gap-1.5">
                <span className="text-[#2251FF] mt-0.5"><Sparkles size={14} /></span>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Toggling these settings forces instant, full-absorption reallocation across all production batches and cost rows on the fly!
                </p>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-neutral-400 mt-4 italic">
            * Aligned with management accounting standard guidelines.
          </div>
        </div>

      </div>

      <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 text-xs text-[#051C2C] flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-[#D32F2F] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Caution on Change:</span> Any modification made in this sheet is instantly propagated to the calculation layers. Standard rates directly affect the computed Unit Cost and Gross Margin percent checks. Changes are auto-saved to localStorage.
        </div>
      </div>

    </div>
  );
}
