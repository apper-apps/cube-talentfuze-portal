import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import AgencyForm from "@/components/organisms/AgencyForm";
import InternalEmployeeForm from "@/components/organisms/InternalEmployeeForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";
import employeeService from "@/services/api/employeeService";

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeFormLoading, setEmployeeFormLoading] = useState(false);
useEffect(() => {
    loadAgency();
    loadEmployees();
  }, [id]);

  const loadEmployees = async () => {
    try {
      const employeeData = await employeeService.getByAgencyId(id);
      setEmployees(employeeData);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (formData) => {
    try {
      setEmployeeFormLoading(true);
      const employeeData = { ...formData, agencyId: parseInt(id) };
      
      if (editingEmployee) {
        const updatedEmployee = await employeeService.update(editingEmployee.Id, employeeData);
        setEmployees(prev => prev.map(emp => emp.Id === updatedEmployee.Id ? updatedEmployee : emp));
        toast.success(`Employee ${formData.name} has been updated successfully`);
      } else {
        const newEmployee = await employeeService.create(employeeData);
        setEmployees(prev => [...prev, newEmployee]);
        toast.success(`Employee ${formData.name} has been added successfully`);
      }
      
      setIsEmployeeModalOpen(false);
    } catch (error) {
      toast.error("Failed to save employee. Please try again.");
      throw error;
    } finally {
      setEmployeeFormLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to remove ${employee.name} from this agency?`)) {
      try {
        await employeeService.delete(employee.Id);
        setEmployees(prev => prev.filter(emp => emp.Id !== employee.Id));
        toast.success(`Employee ${employee.name} has been removed successfully`);
      } catch (error) {
        toast.error("Failed to remove employee. Please try again.");
      }
    }
  };

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const getAccessLevelBadgeVariant = (accessLevel) => {
    switch (accessLevel) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'default';
      case 'viewer': return 'secondary';
      default: return 'secondary';
    }
  };

  const loadAgency = async () => {
    try {
      setLoading(true);
      setError(null);
      const agencyData = await agencyService.getById(id);
      setAgency(agencyData);
    } catch (err) {
      setError("Failed to load agency details. Please try again.");
      toast.error("Failed to load agency details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgency = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveAgency = async (formData) => {
    try {
      setFormLoading(true);
      const updatedAgency = await agencyService.update(agency.Id, formData);
      setAgency(updatedAgency);
      setIsEditModalOpen(false);
      toast.success(`Agency ${formData.name} has been updated successfully`);
    } catch (error) {
      toast.error("Failed to update agency. Please try again.");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

const handleBackToList = () => {
    navigate("/agencies");
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading message="Loading agency details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error 
          message={error} 
          onRetry={loadAgency}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="p-6">
        <Error 
          message="Agency not found" 
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBackToList}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{agency.name}</h1>
            <p className="text-slate-600 mt-1">Agency Details</p>
          </div>
        </div>
        <Button
          onClick={handleEditAgency}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Edit" size={18} />
          Edit Agency
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
              <Badge variant={agency.status === "active" ? "success" : "secondary"}>
                {agency.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Agency Name
                </label>
                <p className="text-base text-slate-900">{agency.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <Badge variant={agency.status === "active" ? "success" : "secondary"}>
                  {agency.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Contact Information Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Person
                </label>
                <p className="text-base text-slate-900">{agency.contactName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <p className="text-base text-slate-900">
                  <a 
                    href={`mailto:${agency.contactEmail}`}
                    className="text-primary hover:text-accent transition-colors"
                  >
                    {agency.contactEmail}
                  </a>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <p className="text-base text-slate-900">
                  <a 
                    href={`tel:${agency.phone}`}
                    className="text-primary hover:text-accent transition-colors"
                  >
                    {agency.phone}
                  </a>
                </p>
              </div>
<div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Address
                </label>
                <p className="text-base text-slate-900">
                  {agency.address || "Not provided"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Created Date
                </label>
                <p className="text-base text-slate-900">
                  {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : "N/A"}
                </p>
</div>
            </div>
          </Card>

          {/* Internal Employees Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Internal Employees</h2>
              <Button
                onClick={handleAddEmployee}
                size="sm"
                className="flex items-center gap-2"
              >
                <ApperIcon name="Plus" size={16} />
                Add Employee
              </Button>
            </div>
            
            {employees.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Users" size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No internal employees yet</p>
                <p className="text-sm text-slate-500 mb-4">
                  Add team members to manage this agency's internal staff.
                </p>
                <Button
                  onClick={handleAddEmployee}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Add First Employee
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <div
                    key={employee.Id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{employee.name}</div>
                        <div className="text-sm text-slate-600">{employee.role}</div>
                        <div className="text-sm text-slate-500">{employee.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getAccessLevelBadgeVariant(employee.accessLevel)}>
                        {employee.accessLevel.charAt(0).toUpperCase() + employee.accessLevel.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-2 hover:bg-red-50 hover:text-red-600"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total VAs</span>
                <span className="text-xl font-bold text-slate-900">{agency.vaCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Status</span>
                <Badge variant={agency.status === "active" ? "success" : "secondary"}>
                  {agency.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Assigned VAs Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Assigned VAs</h3>
              <ApperIcon name="Users" size={20} className="text-slate-400" />
            </div>
            
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Users" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No VAs assigned yet</p>
              <p className="text-sm text-slate-500">
                Virtual assistants will appear here when assigned to this agency.
              </p>
            </div>
          </Card>
        </div>
      </div>

{/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit Agency"
        size="lg"
      >
        <AgencyForm
          agency={agency}
          onSave={handleSaveAgency}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>

      {/* Employee Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={handleCloseEmployeeModal}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        size="lg"
      >
        <InternalEmployeeForm
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onCancel={handleCloseEmployeeModal}
          loading={employeeFormLoading}
        />
      </Modal>
    </div>
  );
};

export default AgencyDetails;