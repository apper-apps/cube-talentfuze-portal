import { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalVAs: 0,
    assignedVAs: 0
  });
  const [recentActivity] = useState([
    { id: 1, type: "agency_added", message: "New agency 'Tech Solutions Inc.' added", time: "2 hours ago", icon: "Building2" },
    { id: 2, type: "va_assigned", message: "Sarah Johnson assigned to Digital Marketing Pro", time: "4 hours ago", icon: "UserCheck" },
    { id: 3, type: "agency_updated", message: "Creative Studio updated their contact information", time: "1 day ago", icon: "Edit" },
    { id: 4, type: "va_available", message: "Mike Chen is now available for new assignments", time: "2 days ago", icon: "User" }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");
      setLoading(true);

      const [agencies, virtualAssistants] = await Promise.all([
        agencyService.getAll(),
        virtualAssistantService.getAll()
      ]);

      const activeAgencies = agencies.filter(agency => agency.status === "active");
      const assignedVAs = virtualAssistants.filter(va => va.status === "assigned");

      setStats({
        totalAgencies: agencies.length,
        activeAgencies: activeAgencies.length,
        totalVAs: virtualAssistants.length,
        assignedVAs: assignedVAs.length
      });
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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Agencies"
          value={stats.totalAgencies}
          icon="Building2"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Active Agencies"
          value={stats.activeAgencies}
          icon="CheckCircle"
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="Virtual Assistants"
          value={stats.totalVAs}
          icon="Users"
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="Assigned VAs"
          value={stats.assignedVAs}
          icon="UserCheck"
          trend="up"
          trendValue="+20%"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <ApperIcon name="Activity" className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
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
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-success to-emerald-600 rounded-xl flex items-center justify-center">
              <ApperIcon name="Zap" className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full p-4 text-left bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-200 transform hover:scale-102 shadow-lg">
              <div className="flex items-center gap-3">
                <ApperIcon name="Plus" size={20} />
                <div>
                  <div className="font-semibold">Add New Agency</div>
                  <div className="text-sm text-blue-100">Register a new agency partner</div>
                </div>
              </div>
            </button>
            
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
    </div>
  );
};

export default Dashboard;