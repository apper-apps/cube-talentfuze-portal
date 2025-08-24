import authService from "./authService";
import React from "react";
import Error from "@/components/ui/Error";
import virtualAssistantsData from "@/services/mockData/virtualAssistants.json";

// Mock agency history data
const mockAgencyHistory = [
  { vaId: 1, agencyName: "TechStart Corp", role: "Administrative Assistant", startDate: "2023-01-15", endDate: "2023-12-31", status: "completed", rating: 5, notes: "Excellent performance in email management and client coordination. Consistently exceeded expectations." },
  { vaId: 1, agencyName: "Marketing Plus Agency", role: "Project Coordinator", startDate: "2024-01-01", endDate: null, status: "current", rating: 4.8, notes: "Currently managing multiple client projects with outstanding results." },
  { vaId: 2, agencyName: "Global Solutions Inc", role: "Data Entry Specialist", startDate: "2022-06-01", endDate: "2023-08-15", status: "completed", rating: 4.5, notes: "Reliable and accurate data processing. Maintained 99.8% accuracy rate." },
  { vaId: 2, agencyName: "Innovation Hub", role: "Virtual Assistant", startDate: "2023-09-01", endDate: null, status: "current", rating: 5, notes: "Exceptional organizational skills and client communication." },
  { vaId: 3, agencyName: "StartupXYZ", role: "Customer Support", startDate: "2023-03-01", endDate: "2023-11-30", status: "completed", rating: 4.2, notes: "Good customer service skills with room for technical improvement." },
];

class VirtualAssistantService {
  constructor() {
    this.virtualAssistants = [...virtualAssistantsData];
  }

  async getPlacementAnalytics() {
    await this.delay();
    const assigned = this.virtualAssistants.filter(va => va.status === 'assigned');
    const available = this.virtualAssistants.filter(va => va.status === 'available');
    const inactive = this.virtualAssistants.filter(va => va.status === 'inactive');
    
    return {
      placementRate: Math.round((assigned.length / this.virtualAssistants.length) * 100),
      assignedCount: assigned.length,
      availableCount: available.length,
      inactiveCount: inactive.length
    };
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    await this.delay();
    const user = authService.getCurrentUser();
    
    if (!user) return [];
    
    if (user.role === 'TalentFuze') {
      return [...this.virtualAssistants];
    } else if (user.role === 'Agency') {
      return this.virtualAssistants.filter(va => va.agencyId === user.agencyId);
    } else if (user.role === 'VirtualAssistant') {
      return this.virtualAssistants.filter(va => va.Id === user.virtualAssistantId);
    }
    
    return [];
  }

  async getById(id) {
    await this.delay();
    const va = this.virtualAssistants.find(va => va.Id === parseInt(id));
    if (!va) {
      throw new Error("Virtual Assistant not found");
    }
    return { ...va };
  }

async getByAgencyId(agencyId) {
    await this.delay();
    return this.virtualAssistants.filter(va => va.agencyId === parseInt(agencyId));
  }

  async getUnassignedVAs() {
    await this.delay();
    return this.virtualAssistants.filter(va => !va.agencyId || va.status === 'available');
  }

  async assignToAgency(vaId, agencyId) {
    await this.delay(400);
    const index = this.virtualAssistants.findIndex(va => va.Id === parseInt(vaId));
    if (index === -1) {
      throw new Error("Virtual Assistant not found");
    }
    
    this.virtualAssistants[index] = {
      ...this.virtualAssistants[index],
      agencyId: agencyId ? parseInt(agencyId) : null,
      status: agencyId ? 'assigned' : 'available'
    };
    
    return { ...this.virtualAssistants[index] };
  }
async create(vaData) {
    await this.delay(400);
    const maxId = Math.max(...this.virtualAssistants.map(va => va.Id), 0);
    const newVA = {
      Id: maxId + 1,
      ...vaData
    };
    this.virtualAssistants.push(newVA);
    return { ...newVA };
  }

  async getVAHistory(vaId) {
    await this.delay();
    return mockAgencyHistory
      .filter(history => history.vaId === parseInt(vaId))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }

  async update(id, vaData) {
    await this.delay(400);
    const index = this.virtualAssistants.findIndex(va => va.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Virtual Assistant not found");
    }
    this.virtualAssistants[index] = {
      ...this.virtualAssistants[index],
      ...vaData
    };
    return { ...this.virtualAssistants[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.virtualAssistants.findIndex(va => va.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Virtual Assistant not found");
}
    this.virtualAssistants.splice(index, 1);
    return true;
  }

  // VA Request methods
async getAllRequests() {
    await this.delay();
    const user = authService.getCurrentUser();
    
    if (!user) return [];
    
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    
    if (user.role === 'TalentFuze') {
      return requests.map(req => ({ ...req }));
    } else if (user.role === 'Agency') {
      return requests.filter(req => req.agencyId === user.agencyId).map(req => ({ ...req }));
    }
    
    return [];
  }

  async getRequestById(id) {
    await this.delay();
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    const request = requests.find(req => req.Id === parseInt(id));
    if (!request) {
      throw new Error("VA Request not found");
    }
    return { ...request };
  }

  async createRequest(requestData) {
    await this.delay(400);
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    const maxId = Math.max(...requests.map(req => req.Id), 0);
    const newRequest = {
      Id: maxId + 1,
      ...requestData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.push(newRequest);
    localStorage.setItem('vaRequests', JSON.stringify(requests));
    return { ...newRequest };
  }

  async updateRequestStatus(id, status, notes = '') {
    await this.delay(400);
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    const index = requests.findIndex(req => req.Id === parseInt(id));
    if (index === -1) {
      throw new Error("VA Request not found");
    }
    requests[index] = {
      ...requests[index],
      status,
      notes: notes || requests[index].notes,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('vaRequests', JSON.stringify(requests));
    return { ...requests[index] };
  }

  async deleteRequest(id) {
    await this.delay(300);
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    const index = requests.findIndex(req => req.Id === parseInt(id));
    if (index === -1) {
      throw new Error("VA Request not found");
    }
    requests.splice(index, 1);
    localStorage.setItem('vaRequests', JSON.stringify(requests));
    return true;
  }
}

export default new VirtualAssistantService();