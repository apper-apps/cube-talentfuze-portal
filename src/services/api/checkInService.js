import checkInsData from "@/services/mockData/checkIns.json";

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
    return [...this.checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
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
}

export default new CheckInService();