import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const VirtualAssistantForm = ({ virtualAssistant, agencies, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: virtualAssistant?.name || "",
    email: virtualAssistant?.email || "",
    skills: virtualAssistant?.skills || "",
    startDate: virtualAssistant?.startDate ? virtualAssistant.startDate.split('T')[0] : "",
    agencyId: virtualAssistant?.agencyId || "",
    status: virtualAssistant?.status || "pending"
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "Inactive" }
  ];

  const agencyOptions = agencies.map(agency => ({
    value: agency.Id.toString(),
    label: agency.name
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "VA name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.skills.trim()) {
      newErrors.skills = "Skills are required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.agencyId) {
      newErrors.agencyId = "Agency assignment is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      const saveData = {
        ...formData,
        agencyId: parseInt(formData.agencyId),
        startDate: new Date(formData.startDate).toISOString()
      };
      await onSave(saveData);
    } catch (error) {
      toast.error("Failed to save virtual assistant. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Virtual Assistant Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter VA name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Skills"
          value={formData.skills}
          onChange={(e) => handleChange("skills", e.target.value)}
          error={errors.skills}
          placeholder="e.g. Customer Service, Data Entry, Social Media"
          required
        />

        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          error={errors.startDate}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Agency Assignment"
          value={formData.agencyId}
          onChange={(e) => handleChange("agencyId", e.target.value)}
          options={agencyOptions}
          placeholder="Select an agency..."
          error={errors.agencyId}
          required
        />

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          options={statusOptions}
          required
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ApperIcon name="Save" size={18} />
              {virtualAssistant ? "Update VA" : "Create VA"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default VirtualAssistantForm;