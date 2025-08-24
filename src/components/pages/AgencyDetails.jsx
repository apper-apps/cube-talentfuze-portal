import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Modal from "@/components/molecules/Modal";
import AgencyForm from "@/components/organisms/AgencyForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";

const AgencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAgency();
  }, [id]);

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
                  Created Date
                </label>
                <p className="text-base text-slate-900">
                  {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
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
    </div>
  );
};

export default AgencyDetails;