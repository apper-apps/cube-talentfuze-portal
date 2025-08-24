import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import AgencyTable from "@/components/organisms/AgencyTable";
import AgencyForm from "@/components/organisms/AgencyForm";
import ApperIcon from "@/components/ApperIcon";
import agencyService from "@/services/api/agencyService";

const Agencies = () => {
  const [agencies, setAgencies] = useState([]);
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  const loadAgencies = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await agencyService.getAll();
      setAgencies(data);
      setFilteredAgencies(data);
    } catch (err) {
      setError("Failed to load agencies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  useEffect(() => {
    const filtered = agencies.filter(agency =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgencies(filtered);
  }, [agencies, searchTerm]);

  const handleAddAgency = () => {
    setEditingAgency(null);
    setShowModal(true);
  };

  const handleEditAgency = (agency) => {
    setEditingAgency(agency);
    setShowModal(true);
  };

  const handleSaveAgency = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingAgency) {
        const updatedAgency = await agencyService.update(editingAgency.Id, formData);
        setAgencies(prev => prev.map(agency => 
          agency.Id === editingAgency.Id ? updatedAgency : agency
        ));
      } else {
        const newAgency = await agencyService.create(formData);
        setAgencies(prev => [...prev, newAgency]);
      }
      
      setShowModal(false);
      setEditingAgency(null);
    } catch (error) {
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAgency = async (agencyId) => {
    await agencyService.delete(agencyId);
    setAgencies(prev => prev.filter(agency => agency.Id !== agencyId));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgency(null);
};

  const handleViewAgency = (agency) => {
    navigate(`/agencies/${agency.Id}`);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agencies</h1>
          <p className="text-slate-600 mt-1">Manage your agency partners and their information</p>
        </div>
        <Button onClick={handleAddAgency} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={20} />
          Add Agency
        </Button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search agencies..."
        />
      </div>

      {/* Agency Table */}
<AgencyTable
        agencies={filteredAgencies}
        loading={loading}
        error={error}
        onRefresh={loadAgencies}
        onEdit={handleEditAgency}
        onDelete={handleDeleteAgency}
        onAdd={handleAddAgency}
        onView={handleViewAgency}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAgency ? "Edit Agency" : "Add New Agency"}
        size="lg"
      >
        <AgencyForm
          agency={editingAgency}
          onSave={handleSaveAgency}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default Agencies;