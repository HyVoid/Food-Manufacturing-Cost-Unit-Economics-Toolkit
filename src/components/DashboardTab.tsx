/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DerivedData, DerivedDashboardData, SpendingMapRow } from "../engine";
import { AppState } from "../types";
import { DollarSign, Package, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DashboardTabProps {
  state: AppState;
  derivedData: DerivedData;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export default function DashboardTab({
  state,
  derivedData,
  selectedPeriod,
  setSelectedPeriod
}: DashboardTabProps) {
  const { availablePeriods, dashboardsByPeriod, spendingMapsByPeriod } = derivedData;

  const currentDashboard: DerivedDashboardData | undefined = dashboardsByPeriod[selectedPeriod];
  const currentSpending: SpendingMapRow[] = spendingMapsByPeriod[selectedPeriod] || [];

  // Format currencies
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

  // Chart data colors
  const COLORS = [
    "#051C2C", // Raw Materials (Primary)
    "#123B5A", // Packaging (Primary tint)
    "#2251FF", // Direct Labor (Accent)
    "#5B7B9C", // MOH (Muted Blue)
    "#8C9CAE", // Utilities (Light Muted)
  ];

  const chartData = currentSpending.map((item, idx) => ({
    name: item.category.split(" (")[0], // Short name
    value: item.amount,
    color: COLORS[idx % COLORS.length]
  })).filter(d => d.value > 0);

  // Custom tooltips for recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-neutral-100 font-sans text-xs">
          <p className="font-semibold text-[#051C2C]">{payload[0].name}</p>
          <p className="text-[#2251FF] mt-1 font-medium">{formatCurrency(payload[0].value)}</p>
          <p className="text-neutral-500">{formatPercentage(payload[0].value / (currentDashboard?.totalCogs || 1))}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-up space-y-8">
      {/* Selector and Header Zone */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border-b border-[#E8E8E6]">
        <div>
          <h2 className="section-title text-2xl font-serif-title">Executive Dashboard</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time food manufacturing metrics, cost structure &amp; unit economics summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Selected Reporting Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-editable font-medium text-[#051C2C] py-1.5 px-3 rounded-md"
            style={{ width: "140px" }}
          >
            {availablePeriods.length === 0 ? (
              <option value="">No data</option>
            ) : (
              availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {currentDashboard ? (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Qty Produced */}
            <div className="floating-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">Actual Production</span>
                <span className="p-1.5 bg-[#051C2C]/5 text-[#051C2C] rounded-md"><Package size={16} /></span>
              </div>
              <div className="mt-4">
                <p className="kpi-value text-3xl font-semibold">{new Intl.NumberFormat("en-US").format(currentDashboard.totalQty)}</p>
                <p className="text-xs text-neutral-400 mt-1">Finished units produced (Bottles / Bags)</p>
              </div>
            </div>

            {/* Estimated Revenue */}
            <div className="floating-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">Estimated Net Sales</span>
                <span className="p-1.5 bg-[#2251FF]/5 text-[#2251FF] rounded-md"><DollarSign size={16} /></span>
              </div>
              <div className="mt-4">
                <p className="kpi-value text-3xl font-semibold num-highlight">{formatCurrency(currentDashboard.totalRevenue)}</p>
                <p className="text-xs text-neutral-400 mt-1">Based on ex-factory distributor price</p>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="floating-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">Gross Profit</span>
                <span className="p-1.5 bg-[#051C2C]/5 text-[#051C2C] rounded-md"><TrendingUp size={16} /></span>
              </div>
              <div className="mt-4">
                <p className="kpi-value text-3xl font-semibold">{formatCurrency(currentDashboard.grossProfit)}</p>
                <p className="text-xs text-neutral-400 mt-1">Revenue minus full manufacturing COGS</p>
              </div>
            </div>

            {/* Gross Margin % */}
            <div className="floating-card p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">Gross Margin %</span>
                {currentDashboard.grossMarginPct < state.assumptions.targetGrossMargin ? (
                  <span className="p-1.5 bg-red-50 text-[#D32F2F] rounded-md flex items-center gap-1 text-[11px] font-semibold uppercase">
                    <AlertCircle size={14} /> Low
                  </span>
                ) : (
                  <span className="p-1.5 bg-[#00C853]/5 text-[#00C853] rounded-md flex items-center gap-1 text-[11px] font-semibold uppercase">
                    <CheckCircle2 size={14} /> Healthy
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p 
                  className={`kpi-value text-3xl font-semibold ${
                    currentDashboard.grossMarginPct < state.assumptions.targetGrossMargin 
                      ? "text-[#D32F2F]" 
                      : "text-[#00C853]"
                  }`}
                >
                  {formatPercentage(currentDashboard.grossMarginPct)}
                </p>
                <p className="text-xs text-neutral-400 mt-1">Target is {formatPercentage(state.assumptions.targetGrossMargin)}</p>
              </div>
            </div>
          </div>

          {/* Bottom layout: Spending map table (60%) and visual chart (40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sheet 04: Spending Map Table */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h3 className="section-title text-base">Cost Element Spending Map (Sheet 04)</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Total COGS: {formatCurrency(currentDashboard.totalCogs)}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-100">
                        <th className="table-header text-left py-2 pb-3">Cost Category</th>
                        <th className="table-header text-right py-2 pb-3">Actual Spending</th>
                        <th className="table-header text-right py-2 pb-3">Share (%)</th>
                        <th className="table-header text-left py-2 pb-3 pl-4">Proportion Map</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                      {currentSpending.map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 transition">
                          <td className="py-3 font-medium text-[#051C2C]">{row.category}</td>
                          <td className="py-3 text-right font-semibold text-[#051C2C]">{formatCurrency(row.amount)}</td>
                          <td className="py-3 text-right font-medium text-neutral-500">{formatPercentage(row.percentage)}</td>
                          <td className="py-3 pl-4 w-1/4">
                            {/* Inline data bar specification */}
                            <div className="w-full bg-[#051C2C]/10 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-[#2251FF] h-full rounded-full transition-all duration-500"
                                style={{ width: `${row.percentage * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sheet 10 Style Insight Block */}
              <div className="insight-block mt-6">
                <div className="flex items-start gap-2">
                  <span className="text-[#2251FF] mt-0.5"><Sparkles size={16} /></span>
                  <div>
                    <h4 className="font-semibold text-[#051C2C] text-xs">Cost Allocation Insight</h4>
                    <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                      In <span className="font-semibold text-[#051C2C]">{selectedPeriod}</span>, the ex-factory value generated is <span className="font-semibold text-[#2251FF]">{formatCurrency(currentDashboard.totalRevenue)}</span>. 
                      Raw &amp; packaging materials constitute the majority of manufacturing outlays. Ensure formulation yields match standard BOM recipe assumptions to prevent loss-driven margin drag.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recharts Pie Chart representation */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-neutral-100 flex flex-col justify-between">
              <div>
                <h3 className="section-title text-base border-b border-neutral-100 pb-3 mb-4">Expenditure Structure Chart</h3>
                <div className="h-64 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="bottom" 
                          iconSize={8} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '11px', fontFamily: 'Noto Sans' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-400 text-xs">
                      No costs incurred during this period.
                    </div>
                  )}
                </div>
              </div>

              {/* Extra Summary Box */}
              <div className="bg-neutral-50 p-4 rounded-lg mt-4 text-xs space-y-2 border border-neutral-100">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">SKU Pass Rate:</span>
                  <span className={`font-semibold ${currentDashboard.skuPassRate >= 0.7 ? "text-[#00C853]" : "text-[#D32F2F]"}`}>
                    {formatPercentage(currentDashboard.skuPassRate)} of SKUs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Target Margin threshold:</span>
                  <span className="font-semibold text-[#051C2C]">{formatPercentage(state.assumptions.targetGrossMargin)}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-neutral-100">
          <AlertCircle className="mx-auto text-neutral-300 mb-2" size={36} />
          <p className="text-neutral-500 font-medium">No reporting data is available for reporting period: {selectedPeriod || "None"}.</p>
          <p className="text-xs text-neutral-400 mt-1">Please enter production inputs or record expenses for this month.</p>
        </div>
      )}
    </div>
  );
}
