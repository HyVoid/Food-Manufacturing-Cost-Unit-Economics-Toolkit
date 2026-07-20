/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AppState, SKURecord, MaterialCostRecord, PackagingCostRecord } from "../types";
import { DerivedData } from "../engine";
import { Plus, Trash2, Search, HelpCircle, ShieldCheck } from "lucide-react";

interface MasterListsTabProps {
  state: AppState;
  derivedData: DerivedData;
  onUpdateState: (newState: AppState) => void;
}

export default function MasterListsTab({
  state,
  derivedData,
  onUpdateState
}: MasterListsTabProps) {
  const [activeCatalog, setActiveCatalog] = useState<"skus" | "materials" | "packaging">("skus");
  const [searchTerm, setSearchTerm] = useState("");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // SKU Form States
  const [skuCode, setSkuCode] = useState("");
  const [skuName, setSkuName] = useState("");
  const [skuCategory, setSkuCategory] = useState("Plant Milk");
  const [skuVolume, setSkuVolume] = useState("500");
  const [skuMsrp, setSkuMsrp] = useState("2.99");
  const [skuDist, setSkuDist] = useState("1.80");

  // Material Form States
  const [matCode, setMatCode] = useState("");
  const [matName, setMatName] = useState("");
  const [matUnit, setMatUnit] = useState("kg");
  const [matPrice, setMatPrice] = useState("1.50");
  const [matLoss, setMatLoss] = useState("3.0");

  // Packaging Form States
  const [pkgCode, setPkgCode] = useState("");
  const [pkgName, setPkgName] = useState("");
  const [pkgUnit, setPkgUnit] = useState("pcs");
  const [pkgPrice, setPkgPrice] = useState("0.12");
  const [pkgLoss, setPkgLoss] = useState("1.5");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }).format(val);
  };

  const formatPercentage = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  // Add SKU Catalog Item
  const handleAddSKU = (e: React.FormEvent) => {
    e.preventDefault();
    const code = skuCode.trim().toUpperCase();
    if (!code) {
      setMessage({ text: "SKU Code is required.", type: "error" });
      return;
    }
    if (state.skus.some(s => s.skuCode === code)) {
      setMessage({ text: "SKU Code already exists in the catalog.", type: "error" });
      return;
    }

    const vol = parseInt(skuVolume);
    const msrp = parseFloat(skuMsrp);
    const dist = parseFloat(skuDist);

    if (isNaN(vol) || vol <= 0 || isNaN(msrp) || msrp <= 0 || isNaN(dist) || dist <= 0) {
      setMessage({ text: "Please provide valid numeric properties.", type: "error" });
      return;
    }

    const newSKU: SKURecord = {
      skuCode: code,
      skuName: skuName.trim(),
      category: skuCategory.trim(),
      volumeMl: vol,
      msrp,
      distributorPrice: dist
    };

    onUpdateState({
      ...state,
      skus: [...state.skus, newSKU],
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `SKU ${code} added to master lists!`, type: "success" });
    setSkuCode("");
    setSkuName("");
    setTimeout(() => setMessage(null), 3000);
  };

  // Add Raw Material Cost
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const code = matCode.trim().toUpperCase();
    if (!code) return;

    if (state.materials.some(m => m.matCode === code)) {
      setMessage({ text: "Material Code already exists.", type: "error" });
      return;
    }

    const price = parseFloat(matPrice);
    const loss = parseFloat(matLoss) / 100; // convert % to decimal

    if (isNaN(price) || price < 0 || isNaN(loss) || loss < 0) {
      setMessage({ text: "Please enter valid material price and loss values.", type: "error" });
      return;
    }

    const newMat: MaterialCostRecord = {
      matCode: code,
      matName: matName.trim(),
      unit: matUnit,
      purchasePrice: price,
      lossRate: loss
    };

    onUpdateState({
      ...state,
      materials: [...state.materials, newMat],
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `Raw material ${code} added!`, type: "success" });
    setMatCode("");
    setMatName("");
    setTimeout(() => setMessage(null), 3000);
  };

  // Add Packaging Cost
  const handleAddPkg = (e: React.FormEvent) => {
    e.preventDefault();
    const code = pkgCode.trim().toUpperCase();
    if (!code) return;

    if (state.packaging.some(p => p.pkgCode === code)) {
      setMessage({ text: "Packaging Code already exists.", type: "error" });
      return;
    }

    const price = parseFloat(pkgPrice);
    const loss = parseFloat(pkgLoss) / 100;

    if (isNaN(price) || price < 0 || isNaN(loss) || loss < 0) {
      setMessage({ text: "Please enter valid packaging price and loss values.", type: "error" });
      return;
    }

    const newPkg: PackagingCostRecord = {
      pkgCode: code,
      pkgName: pkgName.trim(),
      unit: pkgUnit,
      purchasePrice: price,
      lossRate: loss
    };

    onUpdateState({
      ...state,
      packaging: [...state.packaging, newPkg],
      lastSaved: new Date().toISOString()
    });

    setMessage({ text: `Packaging component ${code} added!`, type: "success" });
    setPkgCode("");
    setPkgName("");
    setTimeout(() => setMessage(null), 3000);
  };

  // Delete Handlers
  const handleDeleteItem = (code: string, type: "sku" | "material" | "packaging") => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${code}? Deleting master list records might break active recipes or production inputs.`);
    if (!isConfirmed) return;

    if (type === "sku") {
      onUpdateState({
        ...state,
        skus: state.skus.filter(s => s.skuCode !== code),
        lastSaved: new Date().toISOString()
      });
    } else if (type === "material") {
      onUpdateState({
        ...state,
        materials: state.materials.filter(m => m.matCode !== code),
        lastSaved: new Date().toISOString()
      });
    } else {
      onUpdateState({
        ...state,
        packaging: state.packaging.filter(p => p.pkgCode !== code),
        lastSaved: new Date().toISOString()
      });
    }

    setMessage({ text: `${code} removed from catalog successfully.`, type: "success" });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="animate-fade-up space-y-6">
      
      {/* Tab select and Header block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-xl font-serif-title">Master Catalogs &amp; Costs</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Maintain SKU definitions, active raw ingredient procurement agreements, and packaging unit specifications.
          </p>
        </div>

        {/* Catalog Selector tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
          <button
            onClick={() => {
              setActiveCatalog("skus");
              setSearchTerm("");
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeCatalog === "skus"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 11: SKU Master
          </button>
          <button
            onClick={() => {
              setActiveCatalog("materials");
              setSearchTerm("");
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeCatalog === "materials"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 12: Raw Materials
          </button>
          <button
            onClick={() => {
              setActiveCatalog("packaging");
              setSearchTerm("");
            }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition uppercase tracking-wider ${
              activeCatalog === "packaging"
                ? "bg-white text-[#051C2C] shadow-sm"
                : "text-neutral-500 hover:text-[#051C2C]"
            }`}
          >
            Sheet 13: Packaging Catalog
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={`Search ${activeCatalog.toUpperCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg text-xs outline-none focus:border-[#2251FF] transition"
          />
        </div>
        <div className="text-xs font-medium text-neutral-500">
          Showing <span className="font-bold text-[#051C2C]">
            {activeCatalog === "skus" && state.skus.length}
            {activeCatalog === "materials" && state.materials.length}
            {activeCatalog === "packaging" && state.packaging.length}
          </span> register catalogs.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Add Item Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 self-start">
          <h3 className="section-title text-sm border-b border-neutral-100 pb-3 mb-4">
            {activeCatalog === "skus" && "Register New SKU"}
            {activeCatalog === "materials" && "Add Raw Material Agreement"}
            {activeCatalog === "packaging" && "Add Packaging Component"}
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

          {/* Form conditional rendering based on activeCatalog */}
          {activeCatalog === "skus" && (
            <form onSubmit={handleAddSKU} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">SKU Code (Unique ID)</label>
                <input
                  type="text"
                  value={skuCode}
                  onChange={(e) => setSkuCode(e.target.value)}
                  className="input-editable w-full uppercase font-mono"
                  placeholder="e.g. SKU-005"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">SKU Commercial Name</label>
                <input
                  type="text"
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  className="input-editable w-full"
                  placeholder="e.g. 500ml Chocolate Soy Milk"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Category</label>
                  <input
                    type="text"
                    value={skuCategory}
                    onChange={(e) => setSkuCategory(e.target.value)}
                    className="input-editable w-full"
                    placeholder="e.g. Plant Milk"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Volume spec (ml/g)</label>
                  <input
                    type="number"
                    value={skuVolume}
                    onChange={(e) => setSkuVolume(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Retail Price (MSRP)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={skuMsrp}
                    onChange={(e) => setSkuMsrp(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Ex-Factory Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={skuDist}
                    onChange={(e) => setSkuDist(e.target.value)}
                    className="input-editable w-full"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                <Plus size={16} /> Register SKU
              </button>
            </form>
          )}

          {activeCatalog === "materials" && (
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Material Code</label>
                <input
                  type="text"
                  value={matCode}
                  onChange={(e) => setMatCode(e.target.value)}
                  className="input-editable w-full uppercase font-mono"
                  placeholder="e.g. RM-007"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Material Name</label>
                <input
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  className="input-editable w-full"
                  placeholder="e.g. Vanilla Extract"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Unit of Measure</label>
                <input
                  type="text"
                  value={matUnit}
                  onChange={(e) => setMatUnit(e.target.value)}
                  className="input-editable w-full"
                  placeholder="kg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Contract Price ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={matPrice}
                    onChange={(e) => setMatPrice(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">BOM Loss Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={matLoss}
                    onChange={(e) => setMatLoss(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                <Plus size={16} /> Add Material
              </button>
            </form>
          )}

          {activeCatalog === "packaging" && (
            <form onSubmit={handleAddPkg} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Packaging Code</label>
                <input
                  type="text"
                  value={pkgCode}
                  onChange={(e) => setPkgCode(e.target.value)}
                  className="input-editable w-full uppercase font-mono"
                  placeholder="e.g. PKG-006"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Packaging Name</label>
                <input
                  type="text"
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  className="input-editable w-full"
                  placeholder="e.g. Cardboard Carton Sleeve"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Unit of Measure</label>
                <input
                  type="text"
                  value={pkgUnit}
                  onChange={(e) => setPkgUnit(e.target.value)}
                  className="input-editable w-full"
                  placeholder="pcs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Assembly Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pkgLoss}
                    onChange={(e) => setPkgLoss(e.target.value)}
                    className="input-editable w-full font-mono"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#2251FF] hover:bg-[#2251FF]/90 text-white font-semibold py-2 rounded-lg text-xs shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-1">
                <Plus size={16} /> Add Packaging
              </button>
            </form>
          )}
        </div>

        {/* Right Section: Catalog Table */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-100">
          
          {activeCatalog === "skus" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 11: SKU Catalog</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">Unique commercial assets defined</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">SKU Code</th>
                      <th className="table-header text-left py-3 px-4">Commercial Name</th>
                      <th className="table-header text-left py-3 px-4">Category</th>
                      <th className="table-header text-right py-3 px-4">Volume (ml)</th>
                      <th className="table-header text-right py-3 px-4">MSRP</th>
                      <th className="table-header text-right py-3 px-4">Ex-Factory Price</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Target COGS limit</th>
                      <th className="table-header text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {state.skus
                      .filter(s => s.skuCode.toLowerCase().includes(searchTerm.toLowerCase()) || s.skuName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((row, idx) => {
                        const targetCogsLimit = row.distributorPrice * (1 - state.assumptions.targetGrossMargin);
                        return (
                          <tr key={idx} className="hover:bg-neutral-50/50 transition">
                            <td className="py-2.5 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.skuCode}</td>
                            <td className="py-2.5 px-4 text-xs font-medium text-neutral-700">{row.skuName}</td>
                            <td className="py-2.5 px-4 text-xs text-neutral-500">{row.category}</td>
                            <td className="py-2.5 px-4 text-right font-medium text-[#051C2C]">{new Intl.NumberFormat("en-US").format(row.volumeMl)}</td>
                            <td className="py-2.5 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.msrp)}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-[#051C2C]">{formatCurrency(row.distributorPrice)}</td>
                            <td className="py-2.5 px-4 text-right font-semibold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(targetCogsLimit)}</td>
                            <td className="py-2.5 px-4 text-center">
                              <button
                                onClick={() => handleDeleteItem(row.skuCode, "sku")}
                                className="p-1 text-neutral-400 hover:text-[#D32F2F] hover:bg-red-50 rounded transition"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCatalog === "materials" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 12: Raw Ingredients Procured Price</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">BOM Ingredient standards</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">Material Code</th>
                      <th className="table-header text-left py-3 px-4">Ingredient Name</th>
                      <th className="table-header text-left py-3 px-4">UoM</th>
                      <th className="table-header text-right py-3 px-4">Contract price (Excl. Tax)</th>
                      <th className="table-header text-right py-3 px-4">Loss Factor</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Standard Cost (Incl. Loss)</th>
                      <th className="table-header text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {derivedData.materials
                      .filter(m => m.matCode.toLowerCase().includes(searchTerm.toLowerCase()) || m.matName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition">
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.matCode}</td>
                          <td className="py-2.5 px-4 text-xs font-medium text-neutral-700">{row.matName}</td>
                          <td className="py-2.5 px-4 text-xs text-neutral-500 font-mono">{row.unit}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.purchasePrice)}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-neutral-500">{formatPercentage(row.lossRate)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.standardCost)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(row.matCode, "material")}
                              className="p-1 text-neutral-400 hover:text-[#D32F2F] hover:bg-red-50 rounded transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeCatalog === "packaging" && (
            <div>
              <div className="p-5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="section-title text-sm">Sheet 13: Packaging Component Pricing</h3>
                <span className="text-xs text-neutral-400 font-medium font-mono">Assembly elements specified</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="table-header text-left py-3 px-4">Pkg Code</th>
                      <th className="table-header text-left py-3 px-4">Component Name</th>
                      <th className="table-header text-left py-3 px-4">UoM</th>
                      <th className="table-header text-right py-3 px-4">Procurement Unit Price</th>
                      <th className="table-header text-right py-3 px-4">Assembly Loss</th>
                      <th className="table-header text-right py-3 px-4 bg-[#2251FF]/5 text-[#2251FF]">Standard Cost (Incl. Loss)</th>
                      <th className="table-header text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {derivedData.packaging
                      .filter(p => p.pkgCode.toLowerCase().includes(searchTerm.toLowerCase()) || p.pkgName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition">
                          <td className="py-2.5 px-4 font-mono text-xs font-semibold text-[#051C2C]">{row.pkgCode}</td>
                          <td className="py-2.5 px-4 text-xs font-medium text-neutral-700">{row.pkgName}</td>
                          <td className="py-2.5 px-4 text-xs text-neutral-500 font-mono">{row.unit}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-[#051C2C]">{formatCurrency(row.purchasePrice)}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-neutral-500">{formatPercentage(row.lossRate)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-[#2251FF] bg-[#2251FF]/5">{formatCurrency(row.standardCost)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(row.pkgCode, "packaging")}
                              className="p-1 text-neutral-400 hover:text-[#D32F2F] hover:bg-red-50 rounded transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-neutral-100 text-[11px] text-neutral-400 bg-neutral-50/20">
            * Warning: Deleting rows here might break existing recipe or production input mappings! Target COGS Limit is computed as: Distributor Price × (1 - Target Gross Margin).
          </div>
        </div>

      </div>
    </div>
  );
}
