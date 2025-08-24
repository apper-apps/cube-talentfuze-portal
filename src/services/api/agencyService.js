import agenciesData from "@/services/mockData/agencies.json";

let agencies = [...agenciesData];
let nextId = Math.max(...agencies.map(a => a.Id)) + 1;

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
}

export default new AgencyService();