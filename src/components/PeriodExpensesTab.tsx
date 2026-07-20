/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, DirectLaborRecord, ManufacturingOverheadRecord, UtilitiesCostsRecord } from "../types";
import { DerivedData } from "../engine";
import { Plus, Trash2, ShieldCheck, HelpCircle } from "lucide-react";

interface PeriodExpensesTabProps {
  state: AppState;
  derivedData: DerivedData;
  onUpdateState: (newState: AppState) => void;
  selectedPeriod: string;
}

export default function PeriodExpensesTab({
  state,
  derivedData,
  onUpdateState,
  selectedPeriod
}: PeriodExpensesTabProps) {
  const [activeTab, setActiveTab] = useState<"labor" | "moh" | "utilities">("labor");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Shared form period
  const [expensePeriod, setExpensePeriod] = useState("2026-08");

  // Labor inputs
  const [hourlyWorkers, setHourlyWorkers] = useState("15");
  const [actualHours, setActualHours] = useState("160");
  const [hourlyRate, setHourlyRate] = useState("16.00");
  const [salariedWorkers, setSalariedWorkers] = useState("6");
  const [salariedRate, setSalariedRate] = useState("3500.00");

  // MOH inputs
  const [equipmentAsset, setEquipmentAsset] = useState("500000.00");
  const [buildingAsset, setBuildingAsset] = useState("1200000.00");
  const [consumables, setConsumables] = useState("2500.00");
  const [maintenance, setMaintenance] = useState("3000.00");

  // Utilities inputs
  const [elecUsage, setElecUsage] = useState("25000");
  const [waterUsage, setWaterUsage] = useState("500");
  const [gasUsage, setGasUsage] = useState("1200");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    const period = expensePeriod.trim();
    if (!period) return;

    const workers = parseInt(hourlyWorkers);
    const hours = parseFloat(actualHours);
    const rate = parseFloat(hourlyRate);
    const salWorkers = parseInt(salariedWorkers);
    const salRate = parseFloat(salariedRate);

    if (isNaN(workers) || isNaN(hours) || isNaN(rate) || isNaN(salWorkers) || isNaN(salRate)) {
      setMessage({ text: "Please enter valid numbers for direct labor.", type: "error" });
      return;
    }

    // Check if period already exists. If yes, replace it; if no, append.
    let updatedLabor = [...state.directLabor];
    const existingIdx = updatedLabor.findIndex(l => l.period === period);

    const newRecord: DirectLaborRecord = {
      period,
      hourlyWorkers: workers,
      actualHours: hours,
      hourlyRate: rate,
      salariedWorkers: salWorkers,
      salariedRate: salRate
    };

    if (existingIdx !== -1) {
      updatedLabor[existingIdx] = newRecord;
    } else {
      updatedLabor.push(newRecord);
    }

    // Make sure other tables also have this period, or seed with defaults so the app doesn't break
    let updatedMoh = [...state.mfgOverhead];
    if (!updatedMoh.some(m => m.period === period)) {
      updatedMoh.push({
        period,
        equipmentAsset: 500000.00,
        buildingAsset: 1200000.00,
        consumables: 2500.00,
        maintenance: 3000.00
      });
    }

    let updatedUtils = [...state.utilitiesCosts];
    if (!updatedUtils.some(u => u.period === period)) {
      updatedUtils.push({
        period,
        elecUsageKwh: 25000,
        waterUsageM3: 500,
        gasUsageM3: 1200
      });
    }

    onUpdateState({
      ...state,
      directLabor: updatedLabor,
      mfgOverhead: updatedMoh,
      utilitiesCosts: updatedUtils,
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `Labor expenses for period ${period} updated successfully!`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddMoh = (e: React.FormEvent) => {
    e.preventDefault();
    const period = expensePeriod.trim();
    if (!period) return;

    const equip = parseFloat(equipmentAsset);
    const bld = parseFloat(buildingAsset);
    const cons = parseFloat(consumables);
    const maint = parseFloat(maintenance);

    if (isNaN(equip) || isNaN(bld) || isNaN(cons) || isNaN(maint)) {
      setMessage({ text: "Please enter valid overhead numeric values.", type: "error" });
      return;
    }

    let updatedMoh = [...state.mfgOverhead];
    const existingIdx = updatedMoh.findIndex(m => m.period === period);

    const newRecord: ManufacturingOverheadRecord = {
      period,
      equipmentAsset: equip,
      buildingAsset: bld,
      consumables: cons,
      maintenance: maint
    };

    if (existingIdx !== -1) {
      updatedMoh[existingIdx] = newRecord;
    } else {
      updatedMoh.push(newRecord);
    }

    onUpdateState({
      ...state,
      mfgOverhead: updatedMoh,
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `MOH expenses for period ${period} updated successfully!`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddUtilities = (e: React.FormEvent) => {
    e.preventDefault();
    const period = expensePeriod.trim();
    if (!period) return;

    const elec = parseFloat(elecUsage);
    const water = parseFloat(waterUsage);
    const gas = parseFloat(gasUsage);

    if (isNaN(elec) || isNaN(water) || isNaN(gas)) {
      setMessage({ text: "Please enter valid energy usages.", type: "error" });
      return;
    }

    let updatedUtils = [...state.utilitiesCosts];
    const existingIdx = updatedUtils.findIndex(u => u.period === period);

    const newRecord: UtilitiesCostsRecord = {
      period,
      elecUsageKwh: elec,
      waterUsageM3: water,
      gasUsageM3: gas
    };

    if (existingIdx !== -1) {
      updatedUtils[existingIdx] = newRecord;
    } else {
      updatedUtils.push(newRecord);
    }

    onUpdateState({
      ...state,
      utilitiesCosts: updatedUtils,
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `Energy outlays for period ${period} updated successfully!`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">Workshop Period Expenses &amp; CapEx</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Input direct production payroll, fixed capital asset registries, and workshop energy meter readings.
          </p>
        </div>

        {/* Expense Category Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          <button
            onClick={() => setActiveTab("labor")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeTab === "labor"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 07: Direct Labor
          </button>
          <button
            onClick={() => setActiveTab("moh")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeTab === "moh"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 08: Mfg Overhead
          </button>
          <button
            onClick={() => setActiveTab("utilities")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeTab === "utilities"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 09: Utilities Costs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form to update Period expenses */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 self-start">
          <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">
            {activeTab === "labor" && "Record Labor Pool"}
            {activeTab === "moh" && "Record Fixed Overhead"}
            {activeTab === "utilities" && "Record Energy Usage"}
          </h3>

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

          {/* SHARED period picker */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Accounting Period (YYYY-MM)</label>
            <input
              type="text"
              value={expensePeriod}
              onChange={(e) => setExpensePeriod(e.target.value)}
              placeholder="e.g. 2026-08"
              className="input-editable w-full font-mono text-center text-sm font-semibold"
              required
            />
          </div>

          {activeTab === "labor" && (
            <form onSubmit={handleAddLabor} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Hourly Workers</label>
                  <input
                    type="number"
                    value={hourlyWorkers}
                    onChange={(e) => setHourlyWorkers(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Hours/Worker</label>
                  <input
                    type="number"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Salaried Workers</label>
                  <input
                    type="number"
                    value={salariedWorkers}
                    onChange={(e) => setSalariedWorkers(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Avg Salary ($/mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={salariedRate}
                    onChange={(e) => setSalariedRate(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                Save Labor Pool
              </button>
            </form>
          )}

          {activeTab === "moh" && (
            <form onSubmit={handleAddMoh} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Equipment Asset Book Value</label>
                <input
                  type="number"
                  step="100"
                  value={equipmentAsset}
                  onChange={(e) => setEquipmentAsset(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Building &amp; Facility Asset Value</label>
                <input
                  type="number"
                  step="100"
                  value={buildingAsset}
                  onChange={(e) => setBuildingAsset(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Consumables ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={consumables}
                    onChange={(e) => setConsumables(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Maintenance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                Save Overhead
              </button>
            </form>
          )}

          {activeTab === "utilities" && (
            <form onSubmit={handleAddUtilities} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Electricity Usage (kWh)</label>
                <input
                  type="number"
                  value={elecUsage}
                  onChange={(e) => setElecUsage(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Water Usage (m³)</label>
                <input
                  type="number"
                  value={waterUsage}
                  onChange={(e) => setWaterUsage(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Natural Gas Usage (m³)</label>
                <input
                  type="number"
                  value={gasUsage}
                  onChange={(e) => setGasUsage(e.target.value)}
                  className="input-editable w-full font-mono"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                Save Utility Usage
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Display table */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
          
          {activeTab === "labor" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 07: Direct Labor Expense Ledger</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">{derivedData.directLabor.length} period pools</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">Period</th>
                      <th className="table-header text-right py-3 px-4">Hourly headcount</th>
                      <th className="table-header text-right py-3 px-4">Hours logged</th>
                      <th className="table-header text-right py-3 px-4">Hourly Subtotal</th>
                      <th className="table-header text-right py-3 px-4">Salary headcount</th>
                      <th className="table-header text-right py-3 px-4">Salary Subtotal</th>
                      <th className="table-header text-right py-3 px-4">Benefits Cost</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Total DL Pool</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {derivedData.directLabor.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-neutral-50/50 transition ${row.period === selectedPeriod ? "bg-[#2251FF]/2" : ""}`}
                      >
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.period}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{row.hourlyWorkers}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{row.actualHours.toFixed(0)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.hourlySubtotal)}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{row.salariedWorkers}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.salariedSubtotal)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.benefitsCost)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.totalDl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "moh" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 08: Manufacturing Overhead Depreciation &amp; Maint</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">{derivedData.mfgOverhead.length} period pools</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">Period</th>
                      <th className="table-header text-right py-3 px-4">Equipment Assets</th>
                      <th className="table-header text-right py-3 px-4">Building Assets</th>
                      <th className="table-header text-right py-3 px-4">Equipment Depr (Mo)</th>
                      <th className="table-header text-right py-3 px-4">Building Depr (Mo)</th>
                      <th className="table-header text-right py-3 px-4">Consumables</th>
                      <th className="table-header text-right py-3 px-4">Maintenance</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Total MOH Pool</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {derivedData.mfgOverhead.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-neutral-50/50 transition ${row.period === selectedPeriod ? "bg-[#2251FF]/2" : ""}`}
                      >
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.period}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-500">{formatCurrency(row.equipmentAsset)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-500">{formatCurrency(row.buildingAsset)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.equipmentDepr)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.buildingDepr)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.consumables)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.maintenance)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.totalMoh)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "utilities" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 09: Workshop Utilities (Energy)</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">{derivedData.utilitiesCosts.length} period pools</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">Period</th>
                      <th className="table-header text-right py-3 px-4">Elec Usage (kWh)</th>
                      <th className="table-header text-right py-3 px-4">Water Usage (m³)</th>
                      <th className="table-header text-right py-3 px-4">Gas Usage (m³)</th>
                      <th className="table-header text-right py-3 px-4">Elec Cost ($)</th>
                      <th className="table-header text-right py-3 px-4">Water Cost ($)</th>
                      <th className="table-header text-right py-3 px-4">Gas Cost ($)</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Total Utilities Pool</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {derivedData.utilitiesCosts.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-neutral-50/50 transition ${row.period === selectedPeriod ? "bg-[#2251FF]/2" : ""}`}
                      >
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.period}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.elecUsageKwh)}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.waterUsageM3)}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.gasUsageM3)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.elecCost)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.waterCost)}</td>
                        <td className="py-3 px-4 text-right font-medium text-neutral-600">{formatCurrency(row.gasCost)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.totalUtilities)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-neutral-100 text-xs text-neutral-400 bg-neutral-50/20">
            * Highlighted rows identify currently selected reporting period. Changes in labor benefits rate or water/electric rate are fetched from Sheet 10 assumptions dynamically.
          </div>
        </div>

      </div>
    </div>
  );
}
