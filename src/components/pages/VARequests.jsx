import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import VARequestForm from "@/components/organisms/VARequestForm";
import virtualAssistantService from "@/services/api/virtualAssistantService";
import agencyService from "@/services/api/agencyService";

const VARequests = () => {
  const [requests, setRequests] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAgency, setFilterAgency] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsData, agenciesData] = await Promise.all([
        virtualAssistantService.getAllRequests(),
        agencyService.getAll()
      ]);

      setRequests(requestsData);
      setAgencies(agenciesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load VA requests data. Please try again.');
      toast.error('Failed to load VA requests data');
    } finally {
      setLoading(false);
    }
  };

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };

  const filteredRequests = requests.filter(request => {
    const agencyName = getAgencyName(request.agencyId).toLowerCase();
    const skills = (request.skills || []).join(', ').toLowerCase();
    const specialRequirements = (request.specialRequirements || '').toLowerCase();
    
    const matchesSearch = !searchTerm || 
      agencyName.includes(searchTerm.toLowerCase()) ||
      skills.includes(searchTerm.toLowerCase()) ||
      specialRequirements.includes(searchTerm.toLowerCase());

    const matchesStatus = !filterStatus || request.status === filterStatus;
    const matchesAgency = !filterAgency || request.agencyId === parseInt(filterAgency);

    return matchesSearch && matchesStatus && matchesAgency;
  });

  const handleAddRequest = () => {
    setEditingRequest(null);
    setIsFormModalOpen(true);
  };

  const handleViewRequest = (request) => {
    setEditingRequest(request);
    setIsFormModalOpen(true);
  };

  const handleSaveRequest = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingRequest) {
        await virtualAssistantService.updateRequestStatus(
          editingRequest.Id, 
          formData.status, 
          formData.notes
        );
        toast.success('Request updated successfully!');
      } else {
        await virtualAssistantService.createRequest(formData);
        toast.success('VA request submitted successfully!');
      }
      
      await loadData();
      setIsFormModalOpen(false);
      setEditingRequest(null);
    } catch (err) {
      console.error('Failed to save request:', err);
      toast.error('Failed to save request. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    try {
      await virtualAssistantService.updateRequestStatus(request.Id, newStatus);
      toast.success(`Request status updated to ${newStatus}`);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update request status');
    }
  };

  const handleDeleteRequest = async (request) => {
    if (!window.confirm(`Are you sure you want to delete this VA request from ${getAgencyName(request.agencyId)}?`)) {
      return;
    }

    try {
      await virtualAssistantService.deleteRequest(request.Id);
      toast.success('VA request deleted successfully!');
      await loadData();
    } catch (err) {
      console.error('Failed to delete request:', err);
      toast.error('Failed to delete request. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterAgency("");
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">VA Requests</h1>
          <p className="text-slate-600 mt-2">Manage virtual assistant requests from agencies</p>
        </div>
        <Card className="p-6">
          <Loading rows={8} />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">VA Requests</h1>
          <p className="text-slate-600 mt-2">Manage virtual assistant requests from agencies</p>
        </div>
        <Card className="p-6">
          <Error message={error} onRetry={loadData} />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">VA Requests</h1>
          <p className="text-slate-600 mt-2">
            Manage virtual assistant requests from agencies
          </p>
        </div>
        <Button
          onClick={handleAddRequest}
          className="flex items-center gap-2"
        >
          <ApperIcon name="UserPlus" size={18} />
          New VA Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search requests by agency, skills, or requirements..."
              className="w-full"
            />
          </div>
          <Select
            placeholder="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
          <Select
            placeholder="Filter by Agency"
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            options={agencies.map(agency => ({
              value: agency.Id.toString(),
              label: agency.name
            }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(searchTerm || filterStatus || filterAgency) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <ApperIcon name="X" size={14} />
                Clear Filters
              </Button>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card className="p-6">
          <Empty
            title="No VA requests found"
            description="Agency requests for virtual assistants will appear here. Start by submitting your first VA request."
            actionLabel="Submit First Request"
            onAction={handleAddRequest}
            icon="UserPlus"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.Id} className="p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <ApperIcon name="Building2" size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-slate-900">
                      {getAgencyName(request.agencyId)}
                    </div>
                    <div className="text-slate-600 text-sm">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-500">
                      Budget: ${request.hourlyRateBudget}/hour
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(request.status)}>
                    {request.status}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewRequest(request)}
                      className="p-2"
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    {request.status === 'Pending' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(request, 'In Progress')}
                        className="p-2 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <ApperIcon name="Play" size={16} />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteRequest(request)}
                      className="p-2 hover:bg-red-50 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Required Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {request.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Experience Level
                  </label>
                  <p className="text-slate-900">
                    {request.experienceLevel}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date Preference
                  </label>
                  <p className="text-slate-900">
                    {new Date(request.startDatePreference).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {request.specialRequirements && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Special Requirements
                  </label>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                    {request.specialRequirements}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">
                  Last updated: {new Date(request.updatedAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  {request.status !== 'Completed' && request.status !== 'Cancelled' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request, 'Completed')}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <ApperIcon name="Check" size={14} className="mr-1" />
                        Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(request, 'Cancelled')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <ApperIcon name="X" size={14} className="mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingRequest ? "View VA Request" : "New VA Request"}
        size="lg"
      >
        <VARequestForm
          request={editingRequest}
          agencies={agencies}
          onSave={handleSaveRequest}
          onCancel={handleCloseModal}
          loading={formLoading}
          isViewMode={!!editingRequest}
        />
      </Modal>
    </div>
  );
};

export default VARequests;