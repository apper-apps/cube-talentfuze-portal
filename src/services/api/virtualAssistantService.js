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
}

export default new VirtualAssistantService();