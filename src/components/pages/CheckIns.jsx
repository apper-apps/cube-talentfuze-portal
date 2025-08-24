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
import CheckInForm from "@/components/organisms/CheckInForm";
import checkInService from "@/services/api/checkInService";
import virtualAssistantService from "@/services/api/virtualAssistantService";
import agencyService from "@/services/api/agencyService";

const CheckIns = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [virtualAssistants, setVirtualAssistants] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVA, setFilterVA] = useState("");
  const [filterAgency, setFilterAgency] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [checkInsData, vasData, agenciesData] = await Promise.all([
        checkInService.getAll(),
        virtualAssistantService.getAll(),
        agencyService.getAll()
      ]);

      setCheckIns(checkInsData);
      setVirtualAssistants(vasData);
      setAgencies(agenciesData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load check-ins data. Please try again.');
      toast.error('Failed to load check-ins data');
    } finally {
      setLoading(false);
    }
  };

  const getVAName = (vaId) => {
    const va = virtualAssistants.find(v => v.Id === vaId);
    return va ? va.name : 'Unknown VA';
  };

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };

  const getVAEmail = (vaId) => {
    const va = virtualAssistants.find(v => v.Id === vaId);
    return va ? va.email : '';
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    const vaName = getVAName(checkIn.virtualAssistantId).toLowerCase();
    const agencyName = getAgencyName(checkIn.agencyId).toLowerCase();
    const tasksCompleted = (checkIn.tasksCompleted || '').toLowerCase();
    const notes = (checkIn.notes || '').toLowerCase();
    
    const matchesSearch = !searchTerm || 
      vaName.includes(searchTerm.toLowerCase()) ||
      agencyName.includes(searchTerm.toLowerCase()) ||
      tasksCompleted.includes(searchTerm.toLowerCase()) ||
      notes.includes(searchTerm.toLowerCase());

    const matchesVA = !filterVA || checkIn.virtualAssistantId === parseInt(filterVA);
    const matchesAgency = !filterAgency || checkIn.agencyId === parseInt(filterAgency);
    const matchesDate = !filterDate || checkIn.date === filterDate;

    return matchesSearch && matchesVA && matchesAgency && matchesDate;
  });

  const handleAddCheckIn = () => {
    setEditingCheckIn(null);
    setIsFormModalOpen(true);
  };

  const handleEditCheckIn = (checkIn) => {
    setEditingCheckIn(checkIn);
    setIsFormModalOpen(true);
  };

  const handleSaveCheckIn = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingCheckIn) {
        await checkInService.update(editingCheckIn.Id, formData);
        toast.success('Check-in updated successfully!');
      } else {
        await checkInService.create(formData);
        toast.success('Check-in submitted successfully!');
      }
      
      await loadData();
      setIsFormModalOpen(false);
      setEditingCheckIn(null);
    } catch (err) {
      console.error('Failed to save check-in:', err);
      toast.error('Failed to save check-in. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCheckIn = async (checkIn) => {
    if (!window.confirm(`Are you sure you want to delete this check-in from ${getVAName(checkIn.virtualAssistantId)}?`)) {
      return;
    }

    try {
      await checkInService.delete(checkIn.Id);
      toast.success('Check-in deleted successfully!');
      await loadData();
    } catch (err) {
      console.error('Failed to delete check-in:', err);
      toast.error('Failed to delete check-in. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingCheckIn(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterVA("");
    setFilterAgency("");
    setFilterDate("");
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">Manage and review virtual assistant daily check-ins</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">Manage and review virtual assistant daily check-ins</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Daily Check-ins</h1>
          <p className="text-slate-600 mt-2">
            Manage and review virtual assistant daily check-ins
          </p>
        </div>
        <Button
          onClick={handleAddCheckIn}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={18} />
          Submit Check-in
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search check-ins by VA name, agency, tasks, or notes..."
              className="w-full"
            />
          </div>
          <Select
            placeholder="Filter by Virtual Assistant"
            value={filterVA}
            onChange={(e) => setFilterVA(e.target.value)}
            options={virtualAssistants.map(va => ({
              value: va.Id.toString(),
              label: va.name
            }))}
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
            <Input
              type="date"
              placeholder="Filter by date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-auto"
            />
            {(searchTerm || filterVA || filterAgency || filterDate) && (
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
            Showing {filteredCheckIns.length} of {checkIns.length} check-ins
          </div>
        </div>
      </Card>

      {/* Check-ins List */}
      {filteredCheckIns.length === 0 ? (
        <Card className="p-6">
          <Empty
            title="No check-ins found"
            description="Virtual assistants' daily check-ins will appear here once submitted. Encourage your team to submit regular updates."
            actionLabel="Submit First Check-in"
            onAction={handleAddCheckIn}
            icon="CheckSquare"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCheckIns.map((checkIn) => (
            <Card key={checkIn.Id} className="p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <ApperIcon name="User" size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-slate-900">
                      {getVAName(checkIn.virtualAssistantId)}
                    </div>
                    <div className="text-slate-600 text-sm">
                      {getVAEmail(checkIn.virtualAssistantId)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getAgencyName(checkIn.agencyId)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-slate-900">
                      {new Date(checkIn.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-slate-600">
                      {checkIn.hoursWorked} hours worked
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditCheckIn(checkIn)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteCheckIn(checkIn)}
                      className="p-2 hover:bg-red-50 hover:text-red-600"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tasks Completed
                  </label>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                    {checkIn.tasksCompleted || 'No tasks listed'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                    {checkIn.notes || 'No notes provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-500">
                  Submitted on {new Date(checkIn.submittedAt).toLocaleString()}
                </span>
                <Badge variant="success">
                  Submitted
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingCheckIn ? "Edit Check-in" : "Submit Daily Check-in"}
        size="lg"
      >
        <CheckInForm
          checkIn={editingCheckIn}
          virtualAssistants={virtualAssistants}
          agencies={agencies}
          onSave={handleSaveCheckIn}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default CheckIns;