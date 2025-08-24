import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import AgencyTable from "@/components/organisms/AgencyTable";
import AgencyForm from "@/components/organisms/AgencyForm";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";

const Agencies = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);

  // Load agencies on component mount
  useEffect(() => {
    loadAgencies();
  }, []);

  // Filter agencies based on search term
  useEffect(() => {
    const filtered = agencies.filter((agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  }, [agencies, searchTerm]);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const data = await agencyService.getAll();
      setAgencies(data);
      setError(null);
    } catch (err) {
      setError("Failed to load agencies");
      console.error("Error loading agencies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgency = () => {
setEditingAgency(null);
    setIsModalOpen(true);
  };

  const handleEditAgency = (agency) => {
    setEditingAgency(agency);
    setIsModalOpen(true);
  };

  const handleSaveAgency = async (formData) => {
    try {
      if (editingAgency) {
        // Update existing agency
        await agencyService.update(editingAgency.Id, formData);
        toast.success("Agency updated successfully");
      } else {
        // Create new agency
        await agencyService.create(formData);
        toast.success("Agency created successfully");
      }
      
      // Refresh the agencies list
      await loadAgencies();
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save agency");
      console.error("Error saving agency:", error);
    }
  };

  const handleDeleteAgency = async (agencyId) => {
    try {
      await agencyService.delete(agencyId);
      toast.success("Agency deleted successfully");
      await loadAgencies();
    } catch (error) {
      toast.error("Failed to delete agency");
      console.error("Error deleting agency:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgency(null);
  };

  const handleViewAgency = (agency) => {
    navigate(`/agencies/${agency.Id}`);
  };
return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agencies</h1>
          <p className="text-slate-600 mt-2">Manage your partner agencies</p>
        </div>
        <Button onClick={handleAddAgency} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={20} />
          Add Agency
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="Search agencies..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      <AgencyTable
        agencies={filteredAgencies}
        loading={loading}
        error={error}
        onEdit={handleEditAgency}
        onDelete={handleDeleteAgency}
        onView={handleViewAgency}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAgency ? "Edit Agency" : "Add New Agency"}
        size="lg"
      >
        <AgencyForm
          agency={editingAgency}
          onSave={handleSaveAgency}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Agencies;