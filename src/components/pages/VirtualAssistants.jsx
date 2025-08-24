import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import VirtualAssistantForm from "@/components/organisms/VirtualAssistantForm";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import VirtualAssistantTable from "@/components/organisms/VirtualAssistantTable";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";
const VirtualAssistants = () => {
const [virtualAssistants, setVirtualAssistants] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filteredVAs, setFilteredVAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVA, setEditingVA] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [vasData, agenciesData] = await Promise.all([
        virtualAssistantService.getAll(),
        agencyService.getAll()
      ]);
      
      setVirtualAssistants(vasData);
      setAgencies(agenciesData);
      setFilteredVAs(vasData);
    } catch (err) {
      setError("Failed to load virtual assistants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleCreateVA = () => {
    setEditingVA(null);
    setShowForm(true);
  };

  const handleEditVA = (va) => {
    setEditingVA(va);
    setShowForm(true);
  };

  const handleSaveVA = async (vaData) => {
    setFormLoading(true);
    try {
      if (editingVA) {
        await virtualAssistantService.update(editingVA.Id, vaData);
        setVirtualAssistants(prev => 
          prev.map(va => va.Id === editingVA.Id ? { ...va, ...vaData } : va)
        );
        toast.success(`${vaData.name} has been updated successfully`);
      } else {
        const newVA = await virtualAssistantService.create(vaData);
        setVirtualAssistants(prev => [...prev, newVA]);
        toast.success(`${vaData.name} has been created successfully`);
      }
      setShowForm(false);
      setEditingVA(null);
    } catch (error) {
      toast.error("Failed to save virtual assistant. Please try again.");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVA(null);
  };

  useEffect(() => {
    loadData();
  }, []);

useEffect(() => {
    const filtered = virtualAssistants.filter(va => {
      const agency = agencies.find(a => a.Id === va.agencyId);
      const agencyName = agency ? agency.name : "";
      
      const matchesSearch = !searchTerm || 
        va.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        va.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        va.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || va.status === statusFilter;
      
      const matchesAssignment = !assignmentFilter || 
        (assignmentFilter === "assigned" && va.agencyId) ||
        (assignmentFilter === "unassigned" && !va.agencyId);
      
      return matchesSearch && matchesStatus && matchesAssignment;
    });
    setFilteredVAs(filtered);
  }, [virtualAssistants, agencies, searchTerm, statusFilter, assignmentFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setAssignmentFilter("");
  };
  return (
    <div className="space-y-6">
      {/* Header */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Virtual Assistants</h1>
          <p className="text-slate-600 mt-1">Manage virtual assistant assignments and availability</p>
        </div>
        <Button onClick={handleCreateVA} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={20} />
          Create Virtual Assistant
        </Button>
      </div>

      {/* Search Bar */}
{/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search VAs by name, email, agency, or skills..."
              className="w-full"
            />
          </div>
          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "available", label: "Available" },
              { value: "busy", label: "Busy" },
              { value: "inactive", label: "Inactive" }
            ]}
          />
          <Select
            placeholder="Filter by Assignment"
            value={assignmentFilter}
            onChange={(e) => setAssignmentFilter(e.target.value)}
            options={[
              { value: "assigned", label: "Assigned" },
              { value: "unassigned", label: "Unassigned" }
            ]}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(searchTerm || statusFilter || assignmentFilter) && (
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
            Showing {filteredVAs.length} of {virtualAssistants.length} VAs
          </div>
        </div>
      </Card>

      {/* Virtual Assistant Table */}
      <VirtualAssistantTable
        virtualAssistants={filteredVAs}
        agencies={agencies}
        loading={loading}
        error={error}
onRefresh={loadData}
      />

      {/* Virtual Assistant Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingVA ? "Edit Virtual Assistant" : "Create Virtual Assistant"}
        size="lg"
      >
        <VirtualAssistantForm
          virtualAssistant={editingVA}
          agencies={agencies}
          onSave={handleSaveVA}
          onCancel={handleCloseForm}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default VirtualAssistants;