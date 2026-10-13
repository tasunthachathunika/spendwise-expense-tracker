import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, CHART_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useTheme } from '../context/ThemeContext';

const formatYAxisTick = (val) => {
  if (!val || val === 0) return 'Rs. 0';
  const abs = Math.abs(val);
  if (abs >= 1000000) {
    return `Rs. ${(val / 1000000).toLocaleString('en-LK', { maximumFractionDigits: 1 })}M`;
  }
  if (abs >= 1000) {
    return `Rs. ${(val / 1000).toLocaleString('en-LK', { maximumFractionDigits: 1 })}k`;
  }
  return `Rs. ${val.toLocaleString('en-LK')}`;
};

const Analytics = () => {
  useDocumentTitle('Analytics');
  const { isDark } = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tooltipStyle = {
    backgroundColor: isDark ? '#211c16' : '#ffffff',
    borderColor: isDark ? '#352d23' : '#e9e1ca',
    borderRadius: '12px',
    color: isDark ? '#f7f1e6' : '#1f1b16',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    fontSize: '12px',
  };

  const gridStroke = isDark ? '#352d23' : '#e9e1ca';
  const axisStroke = isDark ? '#a39a88' : '#7a7263';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/analytics?year=${selectedYear}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load financial analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  if (loading && !data) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg"></div>
        <span>Generating analytics reports...</span>
      </div>
    );
  }

  const { expenseByCategory = [], monthlyData = [] } = data || {};

  // Format data for Pie Chart
  const pieData = expenseByCategory.map((item) => ({
    name: item._id,
    value: item.total,
  }));

  // Format monthly trend data
  const trendData = monthlyData.map((m) => ({
    month: m.monthName,
    expense: m.expense,
    income: m.income,
    net: m.income - m.expense,
  }));

  const customTooltipFormatter = (value) => formatCurrency(value);

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-subtitle text-ink-soft">Visual performance metrics for cashflow, spending, and habits</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-soft">Year:</label>
          <select
            className="filter-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 1: Donut (Expense by category) & Bar (Income vs Expense) */}
      <div className="charts-grid">
        {/* Pie/Donut Chart: Expense by Category */}
        <div className="chart-card">
          <h3 className="chart-title">Expense Breakdown by Category</h3>
          <p className="chart-subtitle">Distribution of top spending categories</p>
          
          {pieData.length === 0 ? (
            <div className="empty-state py-12 flex flex-col items-center justify-center">
              <BarChart3 className="w-10 h-10 text-ink-soft mb-2" />
              <p className="text-sm text-ink-soft">No expense records available yet.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={customTooltipFormatter}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
                    labelStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart: Income vs Expense */}
        <div className="chart-card">
          <h3 className="chart-title">Income vs. Expense</h3>
          <p className="chart-subtitle">Monthly comparison for {selectedYear}</p>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="monthName" stroke={axisStroke} fontSize={12} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={formatYAxisTick} />
                <Tooltip 
                  formatter={customTooltipFormatter}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
                  labelStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill={isDark ? '#4ade80' : '#15803d'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill={isDark ? '#f87171' : '#dc2626'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Full-width Line Chart: Monthly Spending & Cashflow Trend */}
      <div className="chart-card mt-6">
        <h3 className="chart-title">Monthly Spending & Net Flow Trend</h3>
        <p className="chart-subtitle">Evaluate how spending evolves month-over-month throughout {selectedYear}</p>

        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" stroke={axisStroke} fontSize={12} tickLine={false} />
              <YAxis stroke={axisStroke} fontSize={11} tickLine={false} tickFormatter={formatYAxisTick} />
              <Tooltip 
                formatter={customTooltipFormatter}
                contentStyle={tooltipStyle}
                itemStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
                labelStyle={{ color: isDark ? '#f7f1e6' : '#1f1b16' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expenses" 
                stroke={isDark ? '#f87171' : '#dc2626'} 
                strokeWidth={3}
                dot={{ r: 4, fill: isDark ? '#f87171' : '#dc2626' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke={isDark ? '#4ade80' : '#15803d'} 
                strokeWidth={3}
                dot={{ r: 4, fill: isDark ? '#4ade80' : '#15803d' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Net Savings" 
                stroke={isDark ? '#38bdf8' : '#0284c7'} 
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: isDark ? '#38bdf8' : '#0284c7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
