import employeesData from "@/services/mockData/employees.json";

let employees = [...employeesData];
let nextId = Math.max(...employees.map(e => e.Id)) + 1;

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class EmployeeService {
  async getByAgencyId(agencyId) {
    await delay();
    return employees.filter(emp => emp.agencyId === parseInt(agencyId));
  }

  async getById(id) {
    await delay();
    const employee = employees.find(e => e.Id === parseInt(id));
    if (!employee) {
      throw new Error("Employee not found");
    }
    return { ...employee };
  }

  async create(employeeData) {
    await delay();
    const newEmployee = {
      Id: nextId++,
      ...employeeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    employees.push(newEmployee);
    return { ...newEmployee };
  }

  async update(id, employeeData) {
    await delay();
    const index = employees.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Employee not found");
    }
    employees[index] = {
      ...employees[index],
      ...employeeData,
      updatedAt: new Date().toISOString()
    };
    return { ...employees[index] };
  }

  async delete(id) {
    await delay();
    const index = employees.findIndex(e => e.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Employee not found");
    }
    const deletedEmployee = employees[index];
    employees.splice(index, 1);
    return deletedEmployee;
  }
}

export default new EmployeeService();