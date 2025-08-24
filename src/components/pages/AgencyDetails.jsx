import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import checkInService from "@/services/api/checkInService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import AgencyForm from "@/components/organisms/AgencyForm";
import InternalEmployeeForm from "@/components/organisms/InternalEmployeeForm";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import employeeService from "@/services/api/employeeService";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";

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
  const [virtualAssistants, setVirtualAssistants] = useState([]);
  const [vaLoading, setVaLoading] = useState(true);
  const [isVaAssignModalOpen, setIsVaAssignModalOpen] = useState(false);
  const [unassignedVAs, setUnassignedVAs] = useState([]);
  const [vaAssignLoading, setVaAssignLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [checkIns, setCheckIns] = useState([]);
  const [checkInsLoading, setCheckInsLoading] = useState(true);
  useEffect(() => {
    loadAgency();
    loadEmployees();
loadVirtualAssistants();
    loadCheckIns();
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

  const loadVirtualAssistants = async () => {
    try {
      setVaLoading(true);
      const vaData = await virtualAssistantService.getByAgencyId(id);
      setVirtualAssistants(vaData);
    } catch (err) {
      console.error("Error loading virtual assistants:", err);
      toast.error("Failed to load virtual assistants");
    } finally {
      setVaLoading(false);
    }
  };

  const handleAssignVA = async () => {
    try {
      setVaAssignLoading(true);
      const unassigned = await virtualAssistantService.getUnassignedVAs();
      setUnassignedVAs(unassigned);
      setIsVaAssignModalOpen(true);
    } catch (err) {
      toast.error("Failed to load available VAs");
    } finally {
      setVaAssignLoading(false);
    }
  };

  const handleVAAssignment = async (vaId) => {
    try {
      setVaAssignLoading(true);
      await virtualAssistantService.assignToAgency(vaId, parseInt(id));
      toast.success("Virtual Assistant assigned successfully");
      setIsVaAssignModalOpen(false);
      await loadVirtualAssistants();
    } catch (err) {
      toast.error("Failed to assign Virtual Assistant");
    } finally {
      setVaAssignLoading(false);
    }
  };

  const handleUnassignVA = async (vaId, vaName) => {
    if (window.confirm(`Are you sure you want to unassign ${vaName} from this agency?`)) {
      try {
        await virtualAssistantService.assignToAgency(vaId, null);
        toast.success(`${vaName} has been unassigned successfully`);
        await loadVirtualAssistants();
      } catch (err) {
        toast.error("Failed to unassign Virtual Assistant");
      }
    }
  };

  const getVARole = (skills) => {
    if (!skills || skills.length === 0) return "General VA";
    return skills[0]; // Use first skill as primary role
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
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
// Load check-ins for agency
  const loadCheckIns = async () => {
    try {
      setCheckInsLoading(true);
      const data = await checkInService.getByAgencyId(parseInt(id));
      setCheckIns(data);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
      toast.error('Failed to load check-ins');
    } finally {
      setCheckInsLoading(false);
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
    <div className="p-6 max-w-6xl mx-auto">
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

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="Building2" size={16} />
                Agency Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checkins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="CheckSquare" size={16} />
                Check-ins ({checkIns.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'details' && (
        <>

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
                <span className="text-xl font-bold text-slate-900">{virtualAssistants.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Internal Staff</span>
                <span className="text-xl font-bold text-slate-900">{employees.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
{/* Assigned VAs Section */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Assigned Virtual Assistants</h3>
            <Button onClick={handleAssignVA} size="sm" className="flex items-center gap-2">
              <ApperIcon name="UserPlus" size={16} />
              Assign VA
            </Button>
          </div>

          {vaLoading ? (
            <Loading rows={3} />
          ) : virtualAssistants.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Users" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No VAs assigned yet</p>
              <p className="text-sm text-slate-500">
                Virtual assistants will appear here when assigned to this agency.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Primary Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {virtualAssistants.map((va) => (
                    <tr key={va.Id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{va.name}</div>
                          <div className="text-sm text-slate-500">{va.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700">{getVARole(va.skills)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700">{formatDate(va.startDate)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={va.status}>{va.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassignVA(va.Id, va.name)}
                          className="text-error hover:text-error hover:border-error"
                        >
                          <ApperIcon name="UserMinus" size={14} className="mr-1" />
                          Unassign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
</div>
        </>
      )}

      {activeTab === 'checkins' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Daily Check-ins</h3>
              <div className="text-sm text-slate-600">
                {checkIns.length} total check-ins
              </div>
            </div>

            {checkInsLoading ? (
              <Loading rows={4} />
            ) : checkIns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="CheckSquare" size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No check-ins yet</p>
                <p className="text-sm text-slate-500">
                  Virtual assistants' daily check-ins will appear here when submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn) => {
                  const va = virtualAssistants.find(v => v.Id === checkIn.virtualAssistantId);
                  return (
                    <div
                      key={checkIn.Id}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                            <ApperIcon name="User" size={18} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {va ? va.name : 'Unknown VA'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {va ? va.email : 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900">
                            {new Date(checkIn.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-slate-500">
                            {checkIn.hoursWorked} hours worked
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Tasks Completed
                          </label>
                          <div className="text-sm text-slate-900">
                            {checkIn.tasksCompleted || 'No tasks listed'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Notes
                          </label>
                          <div className="text-sm text-slate-600">
                            {checkIn.notes || 'No notes provided'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Submitted on {new Date(checkIn.submittedAt).toLocaleString()}</span>
                        <Badge variant="success" className="text-xs">
                          Submitted
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
</div>
      )}

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

      {/* VA Assignment Modal */}
      <Modal
        isOpen={isVaAssignModalOpen}
        onClose={() => setIsVaAssignModalOpen(false)}
        title="Assign Virtual Assistant"
        size="lg"
      >
        <div className="space-y-4">
          {vaAssignLoading ? (
            <Loading rows={3} />
          ) : unassignedVAs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ApperIcon name="Users" size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No unassigned VAs available</p>
              <p className="text-sm text-slate-500">
                All virtual assistants are currently assigned to agencies.
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 mb-4">
                Select a virtual assistant to assign to this agency:
              </p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {unassignedVAs.map((va) => (
                  <div
                    key={va.Id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-primary hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleVAAssignment(va.Id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{va.name}</div>
                        <div className="text-sm text-slate-500">{va.email}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          Primary Skills: {va.skills?.slice(0, 2).join(", ")}
                          {va.skills?.length > 2 && ` (+${va.skills.length - 2} more)`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={va.status}>{va.status}</Badge>
                        <ApperIcon name="ChevronRight" size={16} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgencyDetails;