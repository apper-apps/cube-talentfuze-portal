import virtualAssistantsData from "@/services/mockData/virtualAssistants.json";

class VirtualAssistantService {
  constructor() {
    this.virtualAssistants = [...virtualAssistantsData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.virtualAssistants];
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
    // In a real app, this would come from a separate requests endpoint
    const requests = JSON.parse(localStorage.getItem('vaRequests') || '[]');
    return requests.map(req => ({ ...req }));
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