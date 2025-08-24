import agenciesData from "@/services/mockData/agencies.json";

let agencies = [...agenciesData];
let nextId = Math.max(...agencies.map(a => a.Id)) + 1;

// Mock data for monthly summaries
let monthlySummaries = [
  {
    Id: 1,
    agencyId: 1,
    reportingPeriod: "January 2024",
    performanceNotes: "Overall strong performance with good client satisfaction ratings. Team showed excellent collaboration and met most project deadlines.",
    keyAchievements: "Successfully delivered 3 major projects on time, increased client satisfaction score to 4.8/5, and implemented new quality assurance processes.",
    areasForImprovement: "Communication during peak hours needs improvement. Response time to urgent requests should be reduced from 2 hours to 1 hour.",
    nextMonthGoals: "Focus on improving response times, onboard 2 new team members, and implement automated reporting system for better transparency.",
    createdAt: "2024-01-31T10:00:00.000Z",
    updatedAt: "2024-01-31T10:00:00.000Z"
  },
  {
    Id: 2,
    agencyId: 2,
    reportingPeriod: "January 2024",
    performanceNotes: "Good progress made in establishing workflows. Team is adapting well to new processes and showing steady improvement in productivity.",
    keyAchievements: "Established clear communication protocols, completed 85% of assigned tasks on schedule, and received positive feedback from 3 key clients.",
    areasForImprovement: "Need to strengthen technical documentation practices and improve cross-team collaboration during complex projects.",
    nextMonthGoals: "Implement weekly tech review sessions, establish mentorship program, and aim for 95% task completion rate.",
    createdAt: "2024-01-31T14:30:00.000Z",
    updatedAt: "2024-01-31T14:30:00.000Z"
  }
];
let nextSummaryId = Math.max(...monthlySummaries.map(s => s.Id)) + 1;

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class AgencyService {
  async getAll() {
    await delay();
    return [...agencies];
  }

  async getById(id) {
    await delay();
    const agency = agencies.find(a => a.Id === parseInt(id));
    if (!agency) {
      throw new Error("Agency not found");
    }
    return { ...agency };
  }

  async create(agencyData) {
    await delay();
    const newAgency = {
      Id: nextId++,
      ...agencyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    agencies.push(newAgency);
    return { ...newAgency };
  }

  async update(id, agencyData) {
    await delay();
    const index = agencies.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Agency not found");
    }
    agencies[index] = {
      ...agencies[index],
      ...agencyData,
      updatedAt: new Date().toISOString()
    };
    return { ...agencies[index] };
  }

  async delete(id) {
    await delay();
    const index = agencies.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Agency not found");
    }
    agencies.splice(index, 1);
    return true;
  }

  // Monthly Summary methods
  async getMonthlySummariesByAgencyId(agencyId) {
    await delay();
    const agencySummaries = monthlySummaries
      .filter(s => s.agencyId === parseInt(agencyId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return [...agencySummaries];
  }

  async createMonthlySummary(summaryData) {
    await delay();
    const newSummary = {
      Id: nextSummaryId++,
      ...summaryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    monthlySummaries.push(newSummary);
    return { ...newSummary };
  }

  async updateMonthlySummary(id, summaryData) {
    await delay();
    const index = monthlySummaries.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Monthly summary not found");
    }
    monthlySummaries[index] = {
      ...monthlySummaries[index],
      ...summaryData,
      updatedAt: new Date().toISOString()
    };
    return { ...monthlySummaries[index] };
  }

  async deleteMonthlySummary(id) {
    await delay();
    const index = monthlySummaries.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Monthly summary not found");
    }
    monthlySummaries.splice(index, 1);
    return true;
  }
}

export default new AgencyService();