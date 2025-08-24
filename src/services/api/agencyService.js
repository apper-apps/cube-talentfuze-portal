import agenciesData from "@/services/mockData/agencies.json";

class AgencyService {
  constructor() {
    this.agencies = [...agenciesData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.agencies];
  }

  async getById(id) {
    await this.delay();
    const agency = this.agencies.find(agency => agency.Id === parseInt(id));
    if (!agency) {
      throw new Error("Agency not found");
    }
    return { ...agency };
  }

  async create(agencyData) {
    await this.delay(400);
    const maxId = Math.max(...this.agencies.map(a => a.Id), 0);
    const newAgency = {
      Id: maxId + 1,
      ...agencyData,
      createdAt: new Date().toISOString(),
      vaCount: 0
    };
    this.agencies.push(newAgency);
    return { ...newAgency };
  }

  async update(id, agencyData) {
    await this.delay(400);
    const index = this.agencies.findIndex(agency => agency.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Agency not found");
    }
    this.agencies[index] = {
      ...this.agencies[index],
      ...agencyData
    };
    return { ...this.agencies[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.agencies.findIndex(agency => agency.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Agency not found");
    }
    this.agencies.splice(index, 1);
    return true;
  }
}

export default new AgencyService();