/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { DerivedData, COGSUnitCostRow, MarginBreakevenRow } from "../engine";
import { AppState } from "../types";
import { Search, Info, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

interface CostAnalysisTabProps {
  state: AppState;
  derivedData: DerivedData;
  selectedPeriod: string;
}

export default function CostAnalysisTab({
  state,
  derivedData,
  selectedPeriod
}: CostAnalysisTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"cogs" | "margin">("cogs");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatPercentage = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  // Filter rows by period and search term
  const filteredCogsRows = derivedData.cogsUnitCost.filter(r => 
    r.period === selectedPeriod &&
    (r.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.skuName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMarginRows = derivedData.marginBreakeven.filter(r => 
    r.period === selectedPeriod &&
    r.skuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the SKU name for Margin rows
  const getSkuName = (skuCode: string) => {
    const s = state.skus.find(sk => sk.skuCode === skuCode);
    return s ? s.skuName : "Unknown SKU";
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header and Sub-Tab switching */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">Unit Economics &amp; Margin Analysis</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Evaluate ex-factory product gross margins, contribution metrics, and break-even output rates.
          </p>
        </div>

        {/* Sub tab toggles */}
        <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          <button
            onClick={() => setActiveSubTab("cogs")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "cogs"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 02: SKU Unit Cost
          </button>
          <button
            onClick={() => setActiveSubTab("margin")}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              activeSubTab === "margin"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 03: Margin &amp; Breakeven
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by SKU Code or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-[#2251FF] transition"
          />
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Reporting period: <span className="text-[#051C2C] font-bold">{selectedPeriod || "No data Selected"}</span>
        </div>
      </div>

      {activeSubTab === "cogs" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="section-title text-sm">Sheet 02: SKU Unit Cost Details</h3>
            <span className="text-xs text-neutral-400 font-medium font-mono">Formulaic synthesis of BOM + Allocated Overheads</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="table-header text-left py-3 px-4">SKU Code</th>
                  <th className="table-header text-left py-3 px-4">SKU Name</th>
                  <th className="table-header text-right py-3 px-4">Actual Qty</th>
                  <th className="table-header text-right py-3 px-4">Unit BOM Cost</th>
                  <th className="table-header text-right py-3 px-4">Unit Labor</th>
                  <th className="table-header text-right py-3 px-4">Unit MOH</th>
                  <th className="table-header text-right py-3 px-4">Unit Util</th>
                  <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Real Unit Cost</th>
                  <th className="table-header text-right py-3 px-4">Total Period COGS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCogsRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-neutral-400 text-xs">
                      No records match the current period and filters.
                    </td>
                  </tr>
                ) : (
                  filteredCogsRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.skuCode}</td>
                      <td className="py-3 px-4 text-xs text-neutral-700 font-medium">{row.skuName}</td>
                      <td className="py-3 px-4 text-right font-semibold text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.actualQty)}</td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitBomCost)}</td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitLaborCost)}</td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitMohCost)}</td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitUtilCost)}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.actualUnitCost)}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#051C2C]">{formatCurrency(row.totalCogs)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-500 bg-neutral-50/20 flex gap-2 items-center">
            <Info size={14} className="text-[#2251FF] shrink-0" />
            <span>
              Real Unit Cost is computed as: <span className="font-semibold">Unit BOM + Unit Labor + Unit MOH + Unit Utilities</span>. This reflects full manufacturing absorption costs.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="section-title text-sm">Sheet 03: Margin &amp; Breakeven Analysis</h3>
            <span className="text-xs text-neutral-400 font-medium font-mono">Breakeven Qty = Total Fixed Costs / Unit Contribution Margin</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="table-header text-left py-3 px-4">SKU Code</th>
                  <th className="table-header text-left py-3 px-4">SKU Name</th>
                  <th className="table-header text-right py-3 px-4">Ex-Factory Price</th>
                  <th className="table-header text-right py-3 px-4">Real Unit COGS</th>
                  <th className="table-header text-right py-3 px-4">Unit Margin</th>
                  <th className="table-header text-right py-3 px-4">Gross Margin %</th>
                  <th className="table-header text-center py-3 px-4">Target Check</th>
                  <th className="table-header text-right py-3 px-4">Unit Contribution</th>
                  <th className="table-header text-right py-3 px-4">Breakeven Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredMarginRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-neutral-400 text-xs">
                      No records match the current period and filters.
                    </td>
                  </tr>
                ) : (
                  filteredMarginRows.map((row, idx) => {
                    const pass = row.targetCheck === "✅ Pass";
                    return (
                      <tr key={idx} className="hover:bg-neutral-50/50 transition">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.skuCode}</td>
                        <td className="py-3 px-4 text-xs text-neutral-700 font-medium">{getSkuName(row.skuCode)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#051C2C]">{formatCurrency(row.distPrice)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitCogs)}</td>
                        <td className={`py-3 px-4 text-right font-semibold ${row.unitMargin < 0 ? "text-[#D32F2F]" : "text-[#051C2C]"}`}>
                          {formatCurrency(row.unitMargin)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${pass ? "text-[#00C853]" : "text-[#D32F2F]"}`}>
                          {formatPercentage(row.marginPct)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {pass ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-[#00C853] uppercase border border-green-100">
                              <ShieldCheck size={12} /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-[#D32F2F] uppercase border border-red-100">
                              <AlertTriangle size={12} /> Below Target
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.unitCm)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">
                          {new Intl.NumberFormat("en-US").format(Math.ceil(row.breakevenQty))} units
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Management accounting methodology details */}
          <div className="p-5 bg-neutral-50 border-t border-neutral-100 space-y-3">
            <h4 className="font-bold text-[#051C2C] text-xs uppercase tracking-wider">Methodology Specification:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-600">
              <div className="space-y-1.5">
                <p>
                  <span className="font-semibold text-[#051C2C]">Unit Contribution Margin (Unit CM):</span> Unit Distributor Price minus Unit Variable Costs. 
                  In this model, <span className="italic">Raw Materials (BOM RM)</span> and <span className="italic">Utilities (Energy)</span> are classified as Variable.
                </p>
                <p className="font-mono text-[11px] text-[#2251FF]">Unit CM = Dist Price - (Unit BOM + Unit Utilities)</p>
              </div>
              <div className="space-y-1.5">
                <p>
                  <span className="font-semibold text-[#051C2C]">Total Fixed Costs (FC):</span> Direct labor (which contains permanent staff + monthly benefits) plus fixed factory overhead (straight-line depreciation and maintenance).
                </p>
                <p className="font-mono text-[11px] text-[#2251FF]">Total FC = Total Direct Labor + Total MOH</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
