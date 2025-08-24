import { format } from 'date-fns';
import checkInsData from "@/services/mockData/checkIns.json";
import authService from "./authService";

class CheckInService {
  constructor() {
    this.checkIns = [...checkInsData];
    this.nextId = Math.max(...this.checkIns.map(c => c.Id), 0) + 1;
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    await this.delay();
    const user = authService.getCurrentUser();
    
    if (!user) return [];
    
    let filtered = [...this.checkIns];
    
    if (user.role === 'Agency') {
      filtered = filtered.filter(checkIn => checkIn.agencyId === user.agencyId);
    } else if (user.role === 'VirtualAssistant') {
      filtered = filtered.filter(checkIn => checkIn.virtualAssistantId === user.virtualAssistantId);
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await this.delay();
    const checkIn = this.checkIns.find(c => c.Id === parseInt(id));
    if (!checkIn) {
      throw new Error('Check-in not found');
    }
    return { ...checkIn };
  }

  async getByAgencyId(agencyId) {
    await this.delay();
    return this.checkIns
      .filter(c => c.agencyId === parseInt(agencyId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getByVirtualAssistantId(vaId) {
    await this.delay();
    return this.checkIns
      .filter(c => c.virtualAssistantId === parseInt(vaId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async create(checkInData) {
    await this.delay();
    
    const newCheckIn = {
      ...checkInData,
      Id: this.nextId++,
      submittedAt: new Date().toISOString(),
      date: checkInData.date || new Date().toISOString().split('T')[0]
    };

    this.checkIns.unshift(newCheckIn);
    return { ...newCheckIn };
  }

  async update(id, checkInData) {
    await this.delay();
    
    const index = this.checkIns.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Check-in not found');
    }

    this.checkIns[index] = {
      ...this.checkIns[index],
      ...checkInData,
      Id: parseInt(id)
    };

    return { ...this.checkIns[index] };
  }

  async delete(id) {
    await this.delay();
    
    const index = this.checkIns.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Check-in not found');
    }

    this.checkIns.splice(index, 1);
    return true;
  }

async getRecentCheckIns(limit = 10) {
    await this.delay();
    return this.checkIns
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, limit);
  }

  async getMonthlyStats() {
    await this.delay();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyCheckIns = this.checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.submittedAt);
      return checkInDate.getMonth() === currentMonth && checkInDate.getFullYear() === currentYear;
    });

    const totalHours = monthlyCheckIns.reduce((sum, checkIn) => sum + checkIn.hoursWorked, 0);
    
    return {
      totalCheckIns: monthlyCheckIns.length,
      totalHours,
      averageHoursPerCheckIn: monthlyCheckIns.length > 0 ? (totalHours / monthlyCheckIns.length).toFixed(1) : 0
    };
  }

  async getCheckInsByDateRange(startDate, endDate, agencyId = null, vaId = null) {
    await this.delay();
    
    let filtered = this.checkIns.filter(c => {
      const checkInDate = new Date(c.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return checkInDate >= start && checkInDate <= end;
    });

    if (agencyId) {
      filtered = filtered.filter(c => c.agencyId === parseInt(agencyId));
    }

    if (vaId) {
      filtered = filtered.filter(c => c.virtualAssistantId === parseInt(vaId));
    }

return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Analytics methods
  async getProductivityAnalytics(startDate, endDate) {
    await this.delay();
    
    const filtered = await this.getCheckInsByDateRange(startDate, endDate);
    const totalCheckIns = filtered.length;
    const totalHours = filtered.reduce((sum, checkIn) => sum + checkIn.hoursWorked, 0);
    const avgHoursPerDay = totalCheckIns > 0 ? (totalHours / totalCheckIns).toFixed(1) : 0;
    const completionRate = Math.round((totalCheckIns / Math.max(totalCheckIns, 1)) * 100);
    
    // Get unique VAs
    const uniqueVAs = [...new Set(filtered.map(c => c.virtualAssistantId))];
    const activeVAs = uniqueVAs.length;
    
    // Previous period comparison (same duration before start date)
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(new Date(startDate).getTime() - daysDiff * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevEndDate = startDate;
    
    const prevFiltered = await this.getCheckInsByDateRange(prevStartDate, prevEndDate);
    const prevTotalCheckIns = prevFiltered.length;
    const prevTotalHours = prevFiltered.reduce((sum, checkIn) => sum + checkIn.hoursWorked, 0);
    const prevActiveVAs = [...new Set(prevFiltered.map(c => c.virtualAssistantId))].length;
    
    const checkInGrowth = prevTotalCheckIns > 0 ? Math.round(((totalCheckIns - prevTotalCheckIns) / prevTotalCheckIns) * 100) : 0;
    const hoursGrowth = prevTotalHours > 0 ? Math.round(((totalHours - prevTotalHours) / prevTotalHours) * 100) : 0;
    const activeVAsGrowth = prevActiveVAs > 0 ? Math.round(((activeVAs - prevActiveVAs) / prevActiveVAs) * 100) : 0;
    
    // Top performer analysis
    const vaHours = {};
    filtered.forEach(checkIn => {
      vaHours[checkIn.virtualAssistantId] = (vaHours[checkIn.virtualAssistantId] || 0) + checkIn.hoursWorked;
    });
    const topPerformerId = Object.keys(vaHours).reduce((a, b) => vaHours[a] > vaHours[b] ? a : b, Object.keys(vaHours)[0]);
    
    // Agency statistics
    const agencyStats = {};
    filtered.forEach(checkIn => {
      if (!agencyStats[checkIn.agencyId]) {
        agencyStats[checkIn.agencyId] = {
          totalHours: 0,
          checkInCount: 0,
          vaSet: new Set()
        };
      }
      agencyStats[checkIn.agencyId].totalHours += checkIn.hoursWorked;
      agencyStats[checkIn.agencyId].checkInCount++;
      agencyStats[checkIn.agencyId].vaSet.add(checkIn.virtualAssistantId);
    });
    
    const agencyStatsArray = Object.entries(agencyStats).map(([agencyId, stats]) => ({
      agencyId: parseInt(agencyId),
      name: `Agency ${agencyId}`,
      totalHours: stats.totalHours,
      avgHours: (stats.totalHours / stats.checkInCount).toFixed(1),
      vaCount: stats.vaSet.size,
      completionRate: Math.round((stats.checkInCount / Math.max(stats.checkInCount, 1)) * 100)
    })).sort((a, b) => b.totalHours - a.totalHours);
    
    return {
      totalCheckIns,
      avgHoursPerDay,
      completionRate,
      activeVAs,
      checkInGrowth,
      hoursGrowth,
      activeVAsGrowth,
      topPerformer: `VA ${topPerformerId} with ${vaHours[topPerformerId] || 0}h`,
      consistencyInsight: `${Math.round((totalCheckIns / Math.max(activeVAs, 1)))} avg check-ins per VA`,
      improvementArea: hoursGrowth < 0 ? "Work hours trending down" : "All metrics trending positive",
      agencyStats: agencyStatsArray.slice(0, 5)
    };
  }

  async getProductivityTrends(startDate, endDate) {
    await this.delay();
    
    const filtered = await this.getCheckInsByDateRange(startDate, endDate);
    
    // Group by date
    const dailyStats = {};
    filtered.forEach(checkIn => {
      const date = checkIn.date;
      if (!dailyStats[date]) {
        dailyStats[date] = { totalHours: 0, checkInCount: 0 };
      }
      dailyStats[date].totalHours += checkIn.hoursWorked;
      dailyStats[date].checkInCount++;
    });
    
    // Sort dates and create arrays
    const sortedDates = Object.keys(dailyStats).sort();
    const categories = sortedDates.map(date => format(new Date(date), 'MMM dd'));
    const totalHoursData = sortedDates.map(date => dailyStats[date].totalHours);
    const avgHoursData = sortedDates.map(date => (dailyStats[date].totalHours / Math.max(dailyStats[date].checkInCount, 1)).toFixed(1));
    
    return {
      series: [
        { name: 'Total Hours', data: totalHoursData },
        { name: 'Avg Hours per Check-in', data: avgHoursData }
      ],
      categories
    };
  }

  async getVAPerformanceComparison(startDate, endDate) {
    await this.delay();
    
    const filtered = await this.getCheckInsByDateRange(startDate, endDate);
    
    // Group by VA
    const vaStats = {};
    filtered.forEach(checkIn => {
      const vaId = checkIn.virtualAssistantId;
      if (!vaStats[vaId]) {
        vaStats[vaId] = { totalHours: 0, checkInCount: 0 };
      }
      vaStats[vaId].totalHours += checkIn.hoursWorked;
      vaStats[vaId].checkInCount++;
    });
    
    // Convert to arrays and sort by total hours
    const vaArray = Object.entries(vaStats)
      .map(([vaId, stats]) => ({
        vaId: parseInt(vaId),
        name: `VA ${vaId}`,
        totalHours: stats.totalHours,
        avgHours: (stats.totalHours / stats.checkInCount).toFixed(1)
      }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 10); // Top 10 VAs
    
    return {
      series: [{ name: 'Total Hours', data: vaArray.map(va => va.totalHours) }],
      categories: vaArray.map(va => va.name)
    };
  }

  async getCompletionRates(startDate, endDate) {
    await this.delay();
    
    const filtered = await this.getCheckInsByDateRange(startDate, endDate);
    
    // Calculate completion categories
    const excellent = filtered.filter(c => c.hoursWorked >= 8).length;
    const good = filtered.filter(c => c.hoursWorked >= 6 && c.hoursWorked < 8).length;
    const needsImprovement = filtered.filter(c => c.hoursWorked < 6).length;
    
    const total = filtered.length;
    
    if (total === 0) {
      return { series: [0, 0, 0], labels: ['Excellent (8h+)', 'Good (6-8h)', 'Needs Improvement (<6h)'] };
    }
    
    return {
      series: [
        Math.round((excellent / total) * 100),
        Math.round((good / total) * 100),
        Math.round((needsImprovement / total) * 100)
      ],
      labels: ['Excellent (8h+)', 'Good (6-8h)', 'Needs Improvement (<6h)']
    };
  }

  async exportCheckInData(startDate, endDate, agencyId = null, vaId = null) {
    await this.delay(500);
    
    const filtered = await this.getCheckInsByDateRange(startDate, endDate, agencyId, vaId);
    
    // CSV headers
    const headers = [
      'ID', 'Date', 'VA_ID', 'VA_Name', 'Agency_ID', 'Agency_Name', 
      'Hours_Worked', 'Tasks_Completed', 'Notes', 'Submitted_At'
    ];
    
    // CSV rows
    const rows = filtered.map(checkIn => [
      checkIn.Id,
      checkIn.date,
      checkIn.virtualAssistantId,
      `VA ${checkIn.virtualAssistantId}`,
      checkIn.agencyId,
      `Agency ${checkIn.agencyId}`,
      checkIn.hoursWorked,
      `"${(checkIn.tasksCompleted || '').replace(/"/g, '""')}"`,
      `"${(checkIn.notes || '').replace(/"/g, '""')}"`,
      checkIn.submittedAt
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    return csvContent;
  }
}

export default new CheckInService();