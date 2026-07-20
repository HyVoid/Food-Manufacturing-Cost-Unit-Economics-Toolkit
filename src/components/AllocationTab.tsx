/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DerivedData, AllocationEngineRow } from "../engine";
import { AppState } from "../types";
import { Info, HelpCircle } from "lucide-react";

interface AllocationTabProps {
  state: AppState;
  derivedData: DerivedData;
  selectedPeriod: string;
}

export default function AllocationTab({
  state,
  derivedData,
  selectedPeriod
}: AllocationTabProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const filteredRows = derivedData.allocationEngine.filter(
    row => row.period === selectedPeriod
  );

  return (
    <div className="animate-fade-up space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">Cost Allocation Engine (Sheet 05)</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Period expenses (Labor, MOH, Utilities) are dynamically distributed to SKU production batches.
          </p>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Period: <span className="text-[#051C2C] font-bold">{selectedPeriod || "No data Selected"}</span>
        </div>
      </div>

      {/* Allocation Methods visualizer cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Labor Allocation card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Labor Allocation Rule</h4>
            <p className="text-sm font-bold text-[#051C2C] mt-1">Volume-Based Allocation</p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Total Direct Labor costs of the period are allocated to each SKU batch based on its production quantity proportion.
            </p>
          </div>
          <div className="bg-neutral-50 p-2 rounded text-[11px] font-mono mt-4 text-[#2251FF] border border-neutral-100 text-center">
            Share = SKU Qty / Total Period Qty
          </div>
        </div>

        {/* MOH Allocation card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Overhead (MOH) Allocation Rule</h4>
            <p className="text-sm font-bold text-[#051C2C] mt-1">
              {state.assumptions.mohAllocationMethod === "Volume" ? "Volume-Based" : "Direct Labor Hour (DLH)"} Allocation
            </p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Manufacturing overhead (depreciation,維保) is distributed based on the active selection in global assumptions.
            </p>
          </div>
          <div className="bg-neutral-50 p-2 rounded text-[11px] font-mono mt-4 text-[#2251FF] border border-neutral-100 text-center">
            {state.assumptions.mohAllocationMethod === "Volume" 
              ? "Share = SKU Qty / Total Period Qty" 
              : "Share = SKU DLH / Total Period DLH"}
          </div>
        </div>

        {/* Utilities Allocation card */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Utilities Allocation Rule</h4>
            <p className="text-sm font-bold text-[#051C2C] mt-1">
              {state.assumptions.utilityAllocationMethod === "Volume" ? "Volume-Based" : "Standard BOM Cost"} Allocation
            </p>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
              Energy outlays (electricity, water, gas) are allocated either strictly by volume proportion or weighted by theoretical recipe complexity.
            </p>
          </div>
          <div className="bg-neutral-50 p-2 rounded text-[11px] font-mono mt-4 text-[#2251FF] border border-neutral-100 text-center">
            {state.assumptions.utilityAllocationMethod === "Volume" 
              ? "Share = SKU Qty / Total Period Qty" 
              : "Share = (SKU Qty × Unit BOM) / Period BOM Sum"}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
        <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
          <h3 className="section-title text-sm">Sheet 05: Allocation Traceability Matrix</h3>
          <span className="text-xs text-neutral-400 font-medium font-mono">Dynamic spill range resolving indirect manufacturing cost paths</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="table-header text-left py-3 px-4">Period</th>
                <th className="table-header text-left py-3 px-4">SKU Code</th>
                <th className="table-header text-left py-3 px-4">SKU Name</th>
                <th className="table-header text-right py-3 px-4">SKU Qty</th>
                <th className="table-header text-right py-3 px-4">SKU DLH</th>
                <th className="table-header text-right py-3 px-4">Allocated Labor</th>
                <th className="table-header text-right py-3 px-4">Allocated MOH</th>
                <th className="table-header text-right py-3 px-4">Allocated Utility</th>
                <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Total Allocated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-neutral-400 text-xs">
                    No records found for the selected reporting period.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-neutral-500">{row.period}</td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.skuCode}</td>
                    <td className="py-3 px-4 text-xs text-neutral-700 font-medium">{row.skuName}</td>
                    <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.actualQty)}</td>
                    <td className="py-3 px-4 text-right font-medium text-neutral-600">{row.actualDlh.toFixed(1)} hrs</td>
                    <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.allocatedLabor)}</td>
                    <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.allocatedMoh)}</td>
                    <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.allocatedUtilities)}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.totalAllocated)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-neutral-100 text-xs text-neutral-500 bg-neutral-50/20 flex gap-2 items-center">
          <Info size={14} className="text-[#2251FF] shrink-0" />
          <span>
            Total Allocated represents the combined overhead allocated to this product batch. In subsequent stages, these are divided by SKU Qty to yield unit overhead cost.
          </span>
        </div>
      </div>
    </div>
  );
}
