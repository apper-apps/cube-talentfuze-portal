import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";
import checkInService from "@/services/api/checkInService";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import Chart from "react-apexcharts";
const Dashboard = () => {
const { hasPermission } = useAuth();
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalVAs: 0,
    assignedVAs: 0,
    availableVAs: 0,
    pendingRequests: 0,
    monthlyRevenue: 0,
    totalCheckIns: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({
    agencyGrowth: { series: [], categories: [] },
    vaPlacement: { series: [], labels: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const [agencies, virtualAssistants, vaRequests, checkIns] = await Promise.all([
        agencyService.getAll(),
        virtualAssistantService.getAll(),
        virtualAssistantService.getAllRequests(),
        checkInService.getAll()
      ]);

      const activeAgencies = agencies.filter(agency => agency.status === "active");
      const assignedVAs = virtualAssistants.filter(va => va.status === "assigned");
      const availableVAs = virtualAssistants.filter(va => va.status === "available");
      const pendingRequests = vaRequests.filter(req => req.status === "pending");

      // Calculate monthly revenue
      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const monthlyCheckIns = checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.submittedAt);
        return checkInDate >= monthStart && checkInDate <= monthEnd;
      });

      const monthlyRevenue = monthlyCheckIns.reduce((total, checkIn) => {
        const va = virtualAssistants.find(v => v.Id === checkIn.virtualAssistantId);
        return total + (va ? (checkIn.hoursWorked * va.hourlyRate) : 0);
      }, 0);

      // Prepare chart data for agency growth
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subDays(new Date(), i * 30);
        return format(date, 'MMM yyyy');
      }).reverse();

      const agencyGrowthData = last6Months.map((month, index) => activeAgencies.length + index * 2);

      // VA placement success rates
      const placementData = [
        { label: 'Assigned', value: assignedVAs.length },
        { label: 'Available', value: availableVAs.length },
        { label: 'Pending', value: pendingRequests.length }
      ];

      // Recent activity from check-ins
      const recentCheckIns = await checkInService.getRecentCheckIns(5);
      const activityData = recentCheckIns.map(checkIn => {
        const va = virtualAssistants.find(v => v.Id === checkIn.virtualAssistantId);
        const agency = agencies.find(a => a.Id === checkIn.agencyId);
        return {
          id: checkIn.Id,
          type: "check_in",
          message: `${va?.name || 'Unknown VA'} completed ${checkIn.hoursWorked}h for ${agency?.name || 'Unknown Agency'}`,
          time: format(new Date(checkIn.submittedAt), 'MMM dd, yyyy'),
          icon: "Clock"
        };
      });

      setStats({
        totalAgencies: agencies.length,
        activeAgencies: activeAgencies.length,
        totalVAs: virtualAssistants.length,
        assignedVAs: assignedVAs.length,
        availableVAs: availableVAs.length,
        pendingRequests: pendingRequests.length,
        monthlyRevenue: monthlyRevenue,
        totalCheckIns: monthlyCheckIns.length
      });

      setChartData({
        agencyGrowth: {
          series: [{ name: 'Active Agencies', data: agencyGrowthData }],
          categories: last6Months
        },
        vaPlacement: {
          series: placementData.map(item => item.value),
          labels: placementData.map(item => item.label)
        }
      });

      setRecentActivity(activityData);

    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  const getActivityIcon = (type) => {
    switch (type) {
      case "agency_added":
        return "Building2";
      case "va_assigned":
        return "UserCheck";
      case "agency_updated":
        return "Edit";
      case "va_available":
        return "User";
      default:
        return "Activity";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded-xl"></div>
          ))}
        </div>
        <Loading rows={6} />
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  return (
<div className="space-y-6 sm:space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Agencies"
          value={stats.activeAgencies}
          icon="Building2"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Active VAs"
          value={stats.assignedVAs}
          icon="UserCheck"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon="Clock"
          trend={stats.pendingRequests > 5 ? "down" : "up"}
          trendValue={stats.pendingRequests > 5 ? "High" : "Low"}
        />
{hasPermission('view_revenue') && (
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon="DollarSign"
            trend="up"
            trendValue="+18%"
          />
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Available VAs"
          value={stats.availableVAs}
          icon="Users"
          className="text-center"
        />
        <StatCard
          title="Monthly Check-ins"
          value={stats.totalCheckIns}
          icon="Calendar"
          className="text-center"
        />
        <StatCard
          title="Success Rate"
          value={`${Math.round((stats.assignedVAs / stats.totalVAs) * 100)}%`}
          icon="TrendingUp"
          trend="up"
          trendValue="Excellent"
          className="text-center"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agency Growth Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ApperIcon name="TrendingUp" size={20} className="text-primary" />
            Agency Growth Over Time
          </h3>
          <div className="h-64">
            <Chart
              options={{
                chart: { type: 'line', toolbar: { show: false } },
                stroke: { curve: 'smooth', width: 3 },
                colors: ['#2563EB'],
                xaxis: {
                  categories: chartData.agencyGrowth.categories,
                  labels: { style: { colors: '#64748B' } }
                },
                yaxis: { labels: { style: { colors: '#64748B' } } },
                grid: { borderColor: '#E2E8F0' },
                tooltip: {
                  theme: 'light',
                  y: { formatter: (val) => `${val} agencies` }
                }
              }}
              series={chartData.agencyGrowth.series}
              type="line"
              height={240}
            />
          </div>
        </Card>

        {/* VA Placement Success Rates */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ApperIcon name="PieChart" size={20} className="text-primary" />
            VA Placement Overview
          </h3>
          <div className="h-64">
            <Chart
              options={{
                chart: { type: 'donut' },
                colors: ['#10B981', '#F59E0B', '#EF4444'],
                labels: chartData.vaPlacement.labels,
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
                          label: 'Total VAs',
                          color: '#64748B'
                        }
                      }
                    }
                  }
                },
                tooltip: {
                  y: { formatter: (val) => `${val} VAs` }
                }
              }}
              series={chartData.vaPlacement.series}
              type="donut"
              height={240}
            />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <ApperIcon name="Activity" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ApperIcon name={getActivityIcon(activity.type)} size={16} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{activity.message}</p>
                  <p className="text-sm text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
<Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-success to-emerald-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Zap" className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Quick Actions</h3>
          </div>
          
<div className="space-y-3">
            {hasPermission('manage_agencies') && (
              <button className="w-full p-4 text-left bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-200 transform hover:scale-102 shadow-lg">
                <div className="flex items-center gap-3">
                  <ApperIcon name="Plus" size={20} />
                  <div>
                    <div className="font-semibold">Add New Agency</div>
                    <div className="text-sm text-blue-100">Register a new agency partner</div>
                  </div>
                </div>
              </button>
            )}
            <button className="w-full p-4 text-left bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <ApperIcon name="Users" size={20} className="text-slate-600" />
                <div>
                  <div className="font-semibold text-slate-900">View All VAs</div>
                  <div className="text-sm text-slate-500">Manage virtual assistant assignments</div>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left bg-white border-2 border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <ApperIcon name="BarChart3" size={20} className="text-slate-600" />
                <div>
                  <div className="font-semibold text-slate-900">Generate Report</div>
                  <div className="text-sm text-slate-500">Export agency and VA data</div>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
{/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ApperIcon name="Activity" size={20} className="text-primary" />
          Recent Check-ins Summary
        </h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <ApperIcon name={activity.icon} size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 font-medium">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">No recent activity found.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;