/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppState } from "./types";
import { defaultState } from "./defaultData";
import { calculateDerivedData } from "./engine";
import { 
  FileJson, 
  RotateCcw, 
  Upload, 
  Settings, 
  FileText, 
  BarChart3, 
  Activity, 
  FileSpreadsheet, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

// Import custom sheet components
import DashboardTab from "./components/DashboardTab";
import CostAnalysisTab from "./components/CostAnalysisTab";
import AllocationTab from "./components/AllocationTab";
import BOMRecipeTab from "./components/BOMRecipeTab";
import InputsTab from "./components/InputsTab";
import MasterListsTab from "./components/MasterListsTab";
import PeriodExpensesTab from "./components/PeriodExpensesTab";
import AssumptionsTab from "./components/AssumptionsTab";

export default function App() {
  // Load initial state from local storage or fallback to defaults
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("food_mfg_toolkit_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.assumptions && parsed.skus) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved state, loading default.", e);
      }
    }
    return defaultState;
  });

  // Dynamic calculations compiled on state change
  const derivedData = calculateDerivedData(state);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "economics" | "allocation" | "bom" | "inputs" | "catalog" | "period" | "assumptions"
  >("dashboard");

  // Selected reporting period for the calculations, defaults to latest period
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Sync selected reporting period to the latest available period when derivedData updates
  useEffect(() => {
    if (derivedData.availablePeriods.length > 0) {
      // If selectedPeriod is empty or not in the available list, select the latest one
      if (!selectedPeriod || !derivedData.availablePeriods.includes(selectedPeriod)) {
        setSelectedPeriod(derivedData.availablePeriods[0]);
      }
    }
  }, [derivedData.availablePeriods, selectedPeriod]);

  // Persist State to Local Storage on Change
  const updateState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem("food_mfg_toolkit_state", JSON.stringify(newState));
  };

  // Export Backup File
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Food_MFG_Cost_Econ_Backup_${selectedPeriod || "All"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Backup File
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.assumptions && parsed.skus && parsed.bomRecipes) {
          updateState({
            ...parsed,
            lastSaved: new Date().toISOString()
          });
          alert("Backup restored successfully!");
        } else {
          alert("Invalid backup file. Missing critical worksheet data structures.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file. Ensure correct format.");
      }
    };
    reader.readAsText(file);
    // Reset file input target
    e.target.value = "";
  };

  // Reset State to Defaults
  const handleResetData = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to reset all manufacturing logs, prices, and settings to original factory seed defaults? This cannot be undone."
    );
    if (isConfirmed) {
      updateState({
        ...defaultState,
        lastSaved: new Date().toISOString()
      });
      alert("All worksheets restored to seed defaults.");
    }
  };

  // Format local timestamps beautifully
  const formatSavedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F2] text-[#1A1A2E]">
      
      {/* Horizonal Header Nav Bar (Sticky, 56px height, 1px bottom border) */}
      <nav className="sticky top-0 bg-white border-b border-[#E8E8E6] z-40 h-[56px] shadow-sm select-none">
        <div className="max-w-[1400px] mx-auto h-full px-10 flex items-center justify-between">
          
          {/* Brand Logo & title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#051C2C] flex items-center justify-center text-white font-serif-title font-bold text-base shadow-sm">
              F
            </div>
            <div>
              <span className="font-serif-title text-[#051C2C] font-semibold text-sm tracking-tight block">
                Food Manufacturing Cost &amp; Unit Economics Toolkit
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase block -mt-0.5">
                Financial Toolkit
              </span>
            </div>
          </div>

          {/* Core horizontal Tab switching views */}
          <div className="hidden lg:flex items-center h-full space-x-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "economics", label: "Unit Economics", icon: FileText },
              { id: "allocation", label: "Allocation", icon: Activity },
              { id: "bom", label: "Recipes / BOM", icon: FileSpreadsheet },
              { id: "inputs", label: "Production", icon: Clock },
              { id: "catalog", label: "Catalogs", icon: Briefcase },
              { id: "period", label: "Expenses", icon: Settings },
              { id: "assumptions", label: "Assumptions", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`h-[56px] px-3 font-medium text-xs flex items-center gap-1.5 transition-all relative outline-none ${
                    isActive 
                      ? "text-[#2251FF] font-semibold" 
                      : "text-neutral-500 hover:text-[#051C2C]"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#2251FF] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Simple Dropdown for small screens */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="input-editable font-medium text-xs text-[#051C2C] py-1 px-2.5 rounded-md"
            >
              <option value="dashboard">Dashboard</option>
              <option value="economics">Unit Economics</option>
              <option value="allocation">Allocation Engine</option>
              <option value="bom">Recipes / BOM</option>
              <option value="inputs">Production Logs</option>
              <option value="catalog">Master Lists</option>
              <option value="period">Period Expenses</option>
              <option value="assumptions">Global Assumptions</option>
            </select>
          </div>

        </div>
      </nav>

      {/* Main Content Area (Max width 1400px centered, 40px left/right padding) */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-10 py-8 space-y-8">
        
        {/* Render Active View Tab */}
        {activeTab === "dashboard" && (
          <DashboardTab
            state={state}
            derivedData={derivedData}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />
        )}

        {activeTab === "economics" && (
          <CostAnalysisTab
            state={state}
            derivedData={derivedData}
            selectedPeriod={selectedPeriod}
          />
        )}

        {activeTab === "allocation" && (
          <AllocationTab
            state={state}
            derivedData={derivedData}
            selectedPeriod={selectedPeriod}
          />
        )}

        {activeTab === "bom" && (
          <BOMRecipeTab
            state={state}
            derivedData={derivedData}
            onUpdateState={updateState}
          />
        )}

        {activeTab === "inputs" && (
          <InputsTab
            state={state}
            onUpdateState={updateState}
          />
        )}

        {activeTab === "catalog" && (
          <MasterListsTab
            state={state}
            derivedData={derivedData}
            onUpdateState={updateState}
          />
        )}

        {activeTab === "period" && (
          <PeriodExpensesTab
            state={state}
            derivedData={derivedData}
            onUpdateState={updateState}
            selectedPeriod={selectedPeriod}
          />
        )}

        {activeTab === "assumptions" && (
          <AssumptionsTab
            state={state}
            onUpdateState={updateState}
          />
        )}

      </main>

      {/* Bottom Sticky Action Footer for Backups & Status */}
      <footer className="bg-white border-t border-[#E8E8E6] select-none text-neutral-500 text-xs py-4 px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Left: Last Saved indicator aligned with specifications */}
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">
              Autosaved to LocalStorage. Last saved: <span className="font-semibold font-mono text-[#051C2C]">{formatSavedTime(state.lastSaved)}</span>
            </span>
          </div>

          {/* Right: Export Backup, Import Backup, Reset Data */}
          <div className="flex items-center gap-3">
            
            {/* Export */}
            <button
              onClick={handleExportBackup}
              className="hover:text-[#2251FF] hover:bg-neutral-50 transition border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <FileJson size={14} /> Export Backup
            </button>

            {/* Import file wrap */}
            <label className="hover:text-[#2251FF] hover:bg-neutral-50 transition border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer">
              <Upload size={14} /> Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            {/* Reset */}
            <button
              onClick={handleResetData}
              className="text-[#D32F2F] hover:bg-red-50 border border-red-100 hover:border-red-200 transition px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <RotateCcw size={14} /> Reset Data
            </button>

          </div>

        </div>
      </footer>

    </div>
  );
}
