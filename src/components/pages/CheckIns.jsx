import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import StatCard from "@/components/molecules/StatCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import CheckInForm from "@/components/organisms/CheckInForm";
import checkInService from "@/services/api/checkInService";
import virtualAssistantService from "@/services/api/virtualAssistantService";
import agencyService from "@/services/api/agencyService";
const CheckIns = () => {
const [activeTab, setActiveTab] = useState("checkins");
  const [checkIns, setCheckIns] = useState([]);
  const [virtualAssistants, setVirtualAssistants] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVA, setFilterVA] = useState("");
  const [filterAgency, setFilterAgency] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    stats: {},
    charts: {
      productivity: { series: [], categories: [] },
      performance: { series: [], categories: [] },
      completion: { series: [], labels: [] },
      trends: { series: [], categories: [] }
    }
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [exportLoading, setExportLoading] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [checkInsData, vasData, agenciesData] = await Promise.all([
        checkInService.getAll(),
        virtualAssistantService.getAll(),
        agencyService.getAll()
      ]);

      setCheckIns(checkInsData);
      setVirtualAssistants(vasData);
      setAgencies(agenciesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load check-ins data. Please try again.');
      toast.error('Failed to load check-ins data');
    } finally {
      setLoading(false);
    }
  };

  const getVAName = (vaId) => {
    const va = virtualAssistants.find(v => v.Id === vaId);
    return va ? va.name : 'Unknown VA';
  };

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };

  const getVAEmail = (vaId) => {
    const va = virtualAssistants.find(v => v.Id === vaId);
    return va ? va.email : '';
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    const vaName = getVAName(checkIn.virtualAssistantId).toLowerCase();
    const agencyName = getAgencyName(checkIn.agencyId).toLowerCase();
    const tasksCompleted = (checkIn.tasksCompleted || '').toLowerCase();
    const notes = (checkIn.notes || '').toLowerCase();
    
    const matchesSearch = !searchTerm || 
      vaName.includes(searchTerm.toLowerCase()) ||
      agencyName.includes(searchTerm.toLowerCase()) ||
      tasksCompleted.includes(searchTerm.toLowerCase()) ||
      notes.includes(searchTerm.toLowerCase());

    const matchesVA = !filterVA || checkIn.virtualAssistantId === parseInt(filterVA);
    const matchesAgency = !filterAgency || checkIn.agencyId === parseInt(filterAgency);
    const matchesDate = !filterDate || checkIn.date === filterDate;

    return matchesSearch && matchesVA && matchesAgency && matchesDate;
  });

  const handleAddCheckIn = () => {
    setEditingCheckIn(null);
    setIsFormModalOpen(true);
  };

  const handleEditCheckIn = (checkIn) => {
    setEditingCheckIn(checkIn);
    setIsFormModalOpen(true);
  };

  const handleSaveCheckIn = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingCheckIn) {
        await checkInService.update(editingCheckIn.Id, formData);
        toast.success('Check-in updated successfully!');
      } else {
        await checkInService.create(formData);
        toast.success('Check-in submitted successfully!');
      }
      
      await loadData();
      setIsFormModalOpen(false);
      setEditingCheckIn(null);
    } catch (err) {
      console.error('Failed to save check-in:', err);
      toast.error('Failed to save check-in. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCheckIn = async (checkIn) => {
    if (!window.confirm(`Are you sure you want to delete this check-in from ${getVAName(checkIn.virtualAssistantId)}?`)) {
      return;
    }

    try {
      await checkInService.delete(checkIn.Id);
      toast.success('Check-in deleted successfully!');
      await loadData();
    } catch (err) {
      console.error('Failed to delete check-in:', err);
      toast.error('Failed to delete check-in. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingCheckIn(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVA("");
    setFilterAgency("");
    setFilterDate("");
};

  // Analytics methods
  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setError(null);

      const [productivityStats, trendData, performanceData, completionData] = await Promise.all([
        checkInService.getProductivityAnalytics(dateRange.startDate, dateRange.endDate),
        checkInService.getProductivityTrends(dateRange.startDate, dateRange.endDate),
        checkInService.getVAPerformanceComparison(dateRange.startDate, dateRange.endDate),
        checkInService.getCompletionRates(dateRange.startDate, dateRange.endDate)
      ]);

      setAnalytics({
        stats: productivityStats,
        charts: {
          productivity: trendData,
          performance: performanceData,
          completion: completionData,
          trends: trendData
        }
      });

    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      const exportData = await checkInService.exportCheckInData(
        dateRange.startDate,
        dateRange.endDate,
        filterAgency || null,
        filterVA || null
      );

      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `check-ins-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Check-in data exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab, dateRange]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">Manage and review virtual assistant daily check-ins</p>
        </div>
        <Card className="p-6">
          <Loading rows={8} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">Manage and review virtual assistant daily check-ins</p>
        </div>
        <Card className="p-6">
          <Error message={error} onRetry={loadData} />
        </Card>
      </div>
    );
  }

  return (
<div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">
            Manage and review virtual assistant daily check-ins
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "analytics" && (
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ApperIcon name={exportLoading ? "Loader2" : "Download"} size={16} />
              {exportLoading ? "Exporting..." : "Export Data"}
            </Button>
          )}
          <Button
            onClick={handleAddCheckIn}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={18} />
            Submit Check-in
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("checkins")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "checkins"
              ? "border-primary text-primary bg-blue-50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <ApperIcon name="CheckSquare" size={16} />
            Check-ins
          </div>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-primary text-primary bg-blue-50"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <ApperIcon name="BarChart3" size={16} />
            Analytics
          </div>
        </button>
      </div>
{/* Tab Content */}
      {activeTab === "checkins" ? (
        <>
          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search check-ins by VA name, agency, tasks, or notes..."
                  className="w-full"
                />
              </div>
              <Select
                placeholder="Filter by Virtual Assistant"
                value={filterVA}
                onChange={(e) => setFilterVA(e.target.value)}
                options={virtualAssistants.map(va => ({
                  value: va.Id.toString(),
                  label: va.name
                }))}
              />
              <Select
                placeholder="Filter by Agency"
                value={filterAgency}
                onChange={(e) => setFilterAgency(e.target.value)}
                options={agencies.map(agency => ({
                  value: agency.Id.toString(),
                  label: agency.name
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  placeholder="Filter by date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-auto"
                />
                {(searchTerm || filterVA || filterAgency || filterDate) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="X" size={14} />
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="text-sm text-slate-600">
                Showing {filteredCheckIns.length} of {checkIns.length} check-ins
              </div>
            </div>
          </Card>

          {/* Check-ins List */}
          {filteredCheckIns.length === 0 ? (
            <Card className="p-6">
              <Empty
                title="No check-ins found"
                description="Virtual assistants' daily check-ins will appear here once submitted. Encourage your team to submit regular updates."
                actionLabel="Submit First Check-in"
                onAction={handleAddCheckIn}
                icon="CheckSquare"
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCheckIns.map((checkIn) => (
                <Card key={checkIn.Id} className="p-6 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-slate-900">
                          {getVAName(checkIn.virtualAssistantId)}
                        </div>
                        <div className="text-slate-600 text-sm">
                          {getVAEmail(checkIn.virtualAssistantId)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {getAgencyName(checkIn.agencyId)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-medium text-slate-900">
                          {new Date(checkIn.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-slate-600">
                          {checkIn.hoursWorked} hours worked
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditCheckIn(checkIn)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteCheckIn(checkIn)}
                          className="p-2 hover:bg-red-50 hover:text-red-600"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tasks Completed
                      </label>
                      <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                        {checkIn.tasksCompleted || 'No tasks listed'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes
                      </label>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                        {checkIn.notes || 'No notes provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-500">
                      Submitted on {new Date(checkIn.submittedAt).toLocaleString()}
                    </span>
                    <Badge variant="success">
                      Submitted
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Analytics Tab */}
          {/* Date Range Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">From:</label>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">To:</label>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-auto"
                  />
                </div>
                <Select
                  placeholder="Filter by Virtual Assistant"
                  value={filterVA}
                  onChange={(e) => setFilterVA(e.target.value)}
                  options={virtualAssistants.map(va => ({
                    value: va.Id.toString(),
                    label: va.name
                  }))}
                  className="min-w-[200px]"
                />
                <Select
                  placeholder="Filter by Agency"
                  value={filterAgency}
                  onChange={(e) => setFilterAgency(e.target.value)}
                  options={agencies.map(agency => ({
                    value: agency.Id.toString(),
                    label: agency.name
                  }))}
                  className="min-w-[200px]"
                />
              </div>
            </div>
          </Card>

          {analyticsLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <>
              {/* Key Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Check-ins"
                  value={analytics.stats.totalCheckIns || 0}
                  icon="CheckSquare"
                  trend="up"
                  trendValue={`+${analytics.stats.checkInGrowth || 0}%`}
                />
                <StatCard
                  title="Avg Hours/Day"
                  value={analytics.stats.avgHoursPerDay || 0}
                  icon="Clock"
                  trend={analytics.stats.hoursGrowth > 0 ? "up" : "down"}
                  trendValue={`${analytics.stats.hoursGrowth > 0 ? '+' : ''}${analytics.stats.hoursGrowth || 0}%`}
                />
                <StatCard
                  title="Completion Rate"
                  value={`${analytics.stats.completionRate || 0}%`}
                  icon="Target"
                  trend="up"
                  trendValue="Excellent"
                />
                <StatCard
                  title="Active VAs"
                  value={analytics.stats.activeVAs || 0}
                  icon="Users"
                  trend="up"
                  trendValue={`${analytics.stats.activeVAsGrowth || 0}% growth`}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Productivity Trends */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="TrendingUp" size={20} className="text-primary" />
                    VA Productivity Trends
                  </h3>
                  <div className="h-80">
                    <Chart
                      options={{
                        chart: { type: 'line', toolbar: { show: true } },
                        stroke: { curve: 'smooth', width: 3 },
                        colors: ['#2563EB', '#10B981'],
                        xaxis: {
                          categories: analytics.charts.productivity.categories || [],
                          labels: { style: { colors: '#64748B' } }
                        },
                        yaxis: { 
                          labels: { 
                            style: { colors: '#64748B' },
                            formatter: (val) => `${val}h`
                          } 
                        },
                        grid: { borderColor: '#E2E8F0' },
                        legend: { position: 'top' },
                        tooltip: {
                          theme: 'light',
                          y: { formatter: (val) => `${val} hours` }
                        }
                      }}
                      series={analytics.charts.productivity.series || []}
                      type="line"
                      height={300}
                    />
                  </div>
                </Card>

                {/* VA Performance Comparison */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="BarChart3" size={20} className="text-primary" />
                    VA Performance Comparison
                  </h3>
                  <div className="h-80">
                    <Chart
                      options={{
                        chart: { type: 'bar', toolbar: { show: true } },
                        colors: ['#3B82F6'],
                        xaxis: {
                          categories: analytics.charts.performance.categories || [],
                          labels: { 
                            style: { colors: '#64748B' },
                            rotate: -45
                          }
                        },
                        yaxis: { 
                          labels: { 
                            style: { colors: '#64748B' },
                            formatter: (val) => `${val}h`
                          } 
                        },
                        grid: { borderColor: '#E2E8F0' },
                        tooltip: {
                          theme: 'light',
                          y: { formatter: (val) => `${val} hours` }
                        }
                      }}
                      series={analytics.charts.performance.series || []}
                      type="bar"
                      height={300}
                    />
                  </div>
                </Card>

                {/* Completion Rates */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="PieChart" size={20} className="text-primary" />
                    Task Completion Rates
                  </h3>
                  <div className="h-80">
                    <Chart
                      options={{
                        chart: { type: 'donut' },
                        colors: ['#10B981', '#F59E0B', '#EF4444'],
                        labels: analytics.charts.completion.labels || [],
                        legend: {
                          position: 'bottom',
                          labels: { colors: '#64748B' }
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '60%',
                              labels: {
                                show: true,
                                total: {
                                  show: true,
                                  label: 'Completion',
                                  color: '#64748B'
                                }
                              }
                            }
                          }
                        },
                        tooltip: {
                          y: { formatter: (val) => `${val}%` }
                        }
                      }}
                      series={analytics.charts.completion.series || []}
                      type="donut"
                      height={300}
                    />
                  </div>
                </Card>

                {/* Agency Performance */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ApperIcon name="Building2" size={20} className="text-primary" />
                    Agency Performance Overview
                  </h3>
                  <div className="space-y-4">
                    {analytics.stats.agencyStats && analytics.stats.agencyStats.map((agency, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">{agency.name}</div>
                          <div className="text-sm text-slate-600">{agency.vaCount} VAs • {agency.avgHours}h avg</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">{agency.totalHours}h</div>
                          <div className="text-sm text-slate-500">{agency.completionRate}% completion</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Performance Insights */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ApperIcon name="Lightbulb" size={20} className="text-primary" />
                  Performance Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ApperIcon name="TrendingUp" size={16} className="text-blue-600" />
                      <span className="font-medium text-blue-900">Top Performer</span>
                    </div>
                    <p className="text-blue-800">{analytics.stats.topPerformer || "No data available"}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ApperIcon name="Target" size={16} className="text-green-600" />
                      <span className="font-medium text-green-900">Consistency</span>
                    </div>
                    <p className="text-green-800">{analytics.stats.consistencyInsight || "No data available"}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ApperIcon name="AlertTriangle" size={16} className="text-yellow-600" />
                      <span className="font-medium text-yellow-900">Improvement Area</span>
                    </div>
                    <p className="text-yellow-800">{analytics.stats.improvementArea || "No data available"}</p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingCheckIn ? "Edit Check-in" : "Submit Daily Check-in"}
        size="lg"
      >
        <CheckInForm
          checkIn={editingCheckIn}
          virtualAssistants={virtualAssistants}
          agencies={agencies}
          onSave={handleSaveCheckIn}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default CheckIns;