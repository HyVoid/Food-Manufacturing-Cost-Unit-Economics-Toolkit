/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, ProductionInputRecord } from "../types";
import { Plus, Trash2, Upload, AlertCircle, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { parseCSV } from "../csvUtils";

interface InputsTabProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export default function InputsTab({
  state,
  onUpdateState
}: InputsTabProps) {
  const [prodDate, setProdDate] = useState("2026-07-20");
  const [skuCode, setSkuCode] = useState(state.skus[0]?.skuCode || "");
  const [actualQty, setActualQty] = useState("5000");
  const [actualDlh, setActualDlh] = useState("12.5");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Bulk CSV Paste & Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvImportType, setCsvImportType] = useState<"production" | "skus" | "materials" | "packaging">("production");

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseInt(actualQty);
    const dlh = parseFloat(actualDlh);

    if (isNaN(qty) || qty <= 0) {
      setMessage({ text: "Please enter a valid, positive actual quantity.", type: "error" });
      return;
    }
    if (isNaN(dlh) || dlh < 0) {
      setMessage({ text: "Please enter a valid, positive direct labor hours value.", type: "error" });
      return;
    }

    if (!prodDate) {
      setMessage({ text: "Please select a valid date.", type: "error" });
      return;
    }

    // Generate production ID based on date and uniqueness
    const suffix = String(state.productionInputs.length + 1).padStart(2, "0");
    const cleanDate = prodDate.replace(/-/g, "");
    const prodId = `PRD-${cleanDate}-${suffix}`;

    const newRecord: ProductionInputRecord = {
      prodId,
      prodDate,
      skuCode,
      actualQty: qty,
      actualDlh: dlh
    };

    onUpdateState({
      ...state,
      productionInputs: [...state.productionInputs, newRecord],
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `Production log ${prodId} added successfully!`, type: "success" });
    setActualQty("5000");
    setActualDlh("12.5");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteLog = (prodId: string) => {
    onUpdateState({
      ...state,
      productionInputs: state.productionInputs.filter(p => p.prodId !== prodId),
      lastSaved: new Date().toISOString()
    });
    setMessage({ text: "Production log deleted successfully.", type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  // Bulk CSV Import Logic
  const handleCSVImport = () => {
    if (!csvText.trim()) {
      alert("Please paste some CSV text first.");
      return;
    }

    try {
      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        alert("CSV contains no data rows or headers.");
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());

      if (csvImportType === "production") {
        // Required headers: proddate, skucode, actualqty, actualdlh
        const dateIdx = headers.indexOf("proddate");
        const skuIdx = headers.indexOf("skucode");
        const qtyIdx = headers.indexOf("actualqty");
        const dlhIdx = headers.indexOf("actualdlh");

        if (dateIdx === -1 || skuIdx === -1 || qtyIdx === -1 || dlhIdx === -1) {
          alert("Missing required headers: prodDate, skuCode, actualQty, actualDlh");
          return;
        }

        const newLogs: ProductionInputRecord[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < headers.length) continue;

          const date = row[dateIdx];
          const sku = row[skuIdx];
          const qty = parseInt(row[qtyIdx]);
          const dlh = parseFloat(row[dlhIdx]);

          if (!date || !sku || isNaN(qty) || isNaN(dlh)) continue;

          const suffix = String(state.productionInputs.length + newLogs.length + 1).padStart(2, "0");
          const cleanDate = date.replace(/-/g, "");
          const prodId = `PRD-${cleanDate}-${suffix}`;

          newLogs.push({
            prodId,
            prodDate: date,
            skuCode: sku,
            actualQty: qty,
            actualDlh: dlh
          });
        }

        if (newLogs.length === 0) {
          alert("No valid production logs were parsed from the CSV.");
          return;
        }

        onUpdateState({
          ...state,
          productionInputs: [...state.productionInputs, ...newLogs],
          lastSaved: new Date().toISOString()
        });

        alert(`Successfully imported ${newLogs.length} production logs!`);

      } else if (csvImportType === "skus") {
        // Required headers: skucode, skuname, category, volumeml, msrp, distributorprice
        const codeIdx = headers.indexOf("skucode");
        const nameIdx = headers.indexOf("skuname");
        const catIdx = headers.indexOf("category");
        const volIdx = headers.indexOf("volumeml");
        const msrpIdx = headers.indexOf("msrp");
        const distIdx = headers.indexOf("distributorprice");

        if (codeIdx === -1 || nameIdx === -1 || catIdx === -1 || volIdx === -1 || msrpIdx === -1 || distIdx === -1) {
          alert("Missing required headers: skuCode, skuName, category, volumeMl, msrp, distributorPrice");
          return;
        }

        const newSkus = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < headers.length) continue;

          const code = row[codeIdx];
          const name = row[nameIdx];
          const cat = row[catIdx];
          const vol = parseInt(row[volIdx]);
          const msrp = parseFloat(row[msrpIdx]);
          const dist = parseFloat(row[distIdx]);

          if (!code || !name || isNaN(vol) || isNaN(msrp) || isNaN(dist)) continue;

          newSkus.push({
            skuCode: code,
            skuName: name,
            category: cat,
            volumeMl: vol,
            msrp,
            distributorPrice: dist
          });
        }

        if (newSkus.length === 0) {
          alert("No valid SKUs parsed.");
          return;
        }

        // Merge, avoiding duplicates
        const existingCodes = new Set(state.skus.map(s => s.skuCode));
        const filteredNew = newSkus.filter(s => !existingCodes.has(s.skuCode));

        onUpdateState({
          ...state,
          skus: [...state.skus, ...filteredNew],
          lastSaved: new Date().toISOString()
        });

        alert(`Imported ${filteredNew.length} new SKUs! (Skipped ${newSkus.length - filteredNew.length} duplicates)`);

      } else if (csvImportType === "materials") {
        // Required: matcode, matname, unit, purchaseprice, lossrate
        const codeIdx = headers.indexOf("matcode");
        const nameIdx = headers.indexOf("matname");
        const unitIdx = headers.indexOf("unit");
        const priceIdx = headers.indexOf("purchaseprice");
        const lossIdx = headers.indexOf("lossrate");

        if (codeIdx === -1 || nameIdx === -1 || unitIdx === -1 || priceIdx === -1 || lossIdx === -1) {
          alert("Missing headers: matCode, matName, unit, purchasePrice, lossRate");
          return;
        }

        const newMats = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < headers.length) continue;

          const code = row[codeIdx];
          const name = row[nameIdx];
          const unit = row[unitIdx];
          const price = parseFloat(row[priceIdx]);
          const loss = parseFloat(row[lossIdx]);

          if (!code || !name || !unit || isNaN(price) || isNaN(loss)) continue;

          newMats.push({
            matCode: code,
            matName: name,
            unit,
            purchasePrice: price,
            lossRate: loss
          });
        }

        const existingCodes = new Set(state.materials.map(m => m.matCode));
        const filteredNew = newMats.filter(m => !existingCodes.has(m.matCode));

        onUpdateState({
          ...state,
          materials: [...state.materials, ...filteredNew],
          lastSaved: new Date().toISOString()
        });

        alert(`Imported ${filteredNew.length} new Raw Materials!`);

      } else if (csvImportType === "packaging") {
        // Required: pkgcode, pkgname, unit, purchaseprice, lossrate
        const codeIdx = headers.indexOf("pkgcode");
        const nameIdx = headers.indexOf("pkgname");
        const unitIdx = headers.indexOf("unit");
        const priceIdx = headers.indexOf("purchaseprice");
        const lossIdx = headers.indexOf("lossrate");

        if (codeIdx === -1 || nameIdx === -1 || unitIdx === -1 || priceIdx === -1 || lossIdx === -1) {
          alert("Missing headers: pkgCode, pkgName, unit, purchasePrice, lossRate");
          return;
        }

        const newPkgs = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < headers.length) continue;

          const code = row[codeIdx];
          const name = row[nameIdx];
          const unit = row[unitIdx];
          const price = parseFloat(row[priceIdx]);
          const loss = parseFloat(row[lossIdx]);

          if (!code || !name || !unit || isNaN(price) || isNaN(loss)) continue;

          newPkgs.push({
            pkgCode: code,
            pkgName: name,
            unit,
            purchasePrice: price,
            lossRate: loss
          });
        }

        const existingCodes = new Set(state.packaging.map(p => p.pkgCode));
        const filteredNew = newPkgs.filter(p => !existingCodes.has(p.pkgCode));

        onUpdateState({
          ...state,
          packaging: [...state.packaging, ...filteredNew],
          lastSaved: new Date().toISOString()
        });

        alert(`Imported ${filteredNew.length} new Packaging components!`);
      }

      setShowCSVModal(false);
      setCsvText("");

    } catch (e) {
      alert("Failed to parse CSV. Please check formatting.");
    }
  };

  // Sort logs by date descending
  const sortedLogs = [...state.productionInputs].sort((a, b) => b.prodDate.localeCompare(a.prodDate));

  return (
    <div className="animate-fade-up space-y-6">
      
      {/* Header and Bulk Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">Production actual inputs (Sheet 14)</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Log daily batch outputs and actual manual labor hours. Drives allocation calculations instantly.
          </p>
        </div>
        
        {/* Bulk CSV button */}
        <button
          onClick={() => {
            setCsvImportType("production");
            setShowCSVModal(true);
          }}
          className="bg-[#051C2C] hover:bg-[#051C2C]/90 text-white font-medium py-2 px-4 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center gap-1.5"
        >
          <Upload size={14} /> Bulk CSV Import
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Add Production Batch */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 self-start">
          <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">Log Daily Production</h3>
          
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

          <form onSubmit={handleAddLog} className="space-y-4">
            
            {/* Prod Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Production Date</label>
              <input
                type="date"
                value={prodDate}
                onChange={(e) => setProdDate(e.target.value)}
                className="input-editable w-full font-mono"
                required
              />
            </div>

            {/* Target SKU dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Produced SKU</label>
              <select
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                className="input-editable w-full"
              >
                {state.skus.map(s => (
                  <option key={s.skuCode} value={s.skuCode}>
                    {s.skuCode} - {s.skuName}
                  </option>
                ))}
              </select>
            </div>

            {/* Actual Output Qty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Actual Output Qty (Bottles / Bags)</label>
              <input
                type="number"
                min="1"
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                className="input-editable w-full"
                placeholder="e.g. 10000"
                required
              />
            </div>

            {/* Actual DLH */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Actual Labor Spent (DLH Hours)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={actualDlh}
                onChange={(e) => setActualDlh(e.target.value)}
                className="input-editable w-full"
                placeholder="e.g. 24.5"
                required
              />
              <span className="text-[10px] text-neutral-400">
                Sum of hours worked by all operators for this batch
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-medium py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Log Production Batch
            </button>
          </form>
        </div>

        {/* Right Table: Log History */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <h3 className="section-title text-sm">Sheet 14: Historical Production Log Book</h3>
              <span className="text-xs text-neutral-400 font-medium font-mono">{sortedLogs.length} batches logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="table-header text-left py-3 px-4">Batch ID</th>
                    <th className="table-header text-left py-3 px-4">Production Date</th>
                    <th className="table-header text-left py-3 px-4">Period</th>
                    <th className="table-header text-left py-3 px-4">SKU Code</th>
                    <th className="table-header text-left py-3 px-4">SKU Name</th>
                    <th className="table-header text-right py-3 px-4">Actual Qty</th>
                    <th className="table-header text-right py-3 px-4">Actual DLH</th>
                    <th className="table-header text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sortedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-neutral-400 text-xs">
                        No production logs registered yet. Use form on the left or Bulk CSV Import.
                      </td>
                    </tr>
                  ) : (
                    sortedLogs.map((row, idx) => {
                      const skuName = state.skus.find(s => s.skuCode === row.skuCode)?.skuName || "Unknown SKU";
                      return (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition">
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-neutral-400">{row.prodId}</td>
                          <td className="py-2.5 px-4 font-mono text-xs text-neutral-700">{row.prodDate}</td>
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-neutral-500">{row.prodDate.slice(0, 7)}</td>
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.skuCode}</td>
                          <td className="py-2.5 px-4 text-xs text-neutral-700 font-medium">{skuName}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.actualQty)}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-neutral-600">{row.actualDlh.toFixed(1)} hrs</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteLog(row.prodId)}
                              className="p-1 text-neutral-400 hover:text-[#D32F2F] hover:bg-red-50 rounded transition duration-150"
                              title="Delete Production Batch Log"
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
            * Adding rows triggers immediate reallocation in the background. The reporting period is dynamically derived from Date (YYYY-MM).
          </div>
        </div>

      </div>

      {/* Bulk CSV Importer Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-[#051C2C]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 w-full max-w-2xl overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <h3 className="section-title text-base flex items-center gap-1.5"><FileSpreadsheet size={18} className="text-[#2251FF]" /> Bulk CSV Importer Workspace</h3>
              <button 
                onClick={() => setShowCSVModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">1. Select Target catalog:</span>
                <div className="flex gap-2">
                  {(["production", "skus", "materials", "packaging"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCsvImportType(type)}
                      className={`px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider transition ${
                        csvImportType === type
                          ? "bg-[#2251FF] text-white"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template help details */}
              <div className="bg-blue-50/50 p-4 rounded-lg text-xs space-y-1.5 border border-blue-100">
                <p className="font-semibold text-[#051C2C]">CSV Header Format Requirements:</p>
                {csvImportType === "production" && (
                  <p className="font-mono text-neutral-600 text-[11px]">prodDate, skuCode, actualQty, actualDlh</p>
                )}
                {csvImportType === "skus" && (
                  <p className="font-mono text-neutral-600 text-[11px]">skuCode, skuName, category, volumeMl, msrp, distributorPrice</p>
                )}
                {csvImportType === "materials" && (
                  <p className="font-mono text-neutral-600 text-[11px]">matCode, matName, unit, purchasePrice, lossRate</p>
                )}
                {csvImportType === "packaging" && (
                  <p className="font-mono text-neutral-600 text-[11px]">pkgCode, pkgName, unit, purchasePrice, lossRate</p>
                )}
                <p className="text-[10px] text-neutral-400">Note: Headers are case-insensitive. Standard copy/paste from Excel is fully supported.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">2. Paste CSV Content Here (Comma separated)</label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full h-44 input-editable font-mono text-[11px] p-3 rounded-lg border border-neutral-200 bg-neutral-50 outline-none"
                  placeholder={`e.g. for Production:\nprodDate,skuCode,actualQty,actualDlh\n2026-07-20,SKU-001,8000,16.5\n2026-07-21,SKU-002,4500,11.0`}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4 mt-6">
                <button
                  onClick={() => setShowCSVModal(false)}
                  className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-500 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVImport}
                  className="px-4 py-2 bg-[#2251FF] hover:bg-[#2251FF]/90 text-white rounded-lg text-xs font-semibold transition shadow-sm"
                >
                  Parse and Import Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
