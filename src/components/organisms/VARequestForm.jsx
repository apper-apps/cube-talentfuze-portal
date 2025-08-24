import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const VARequestForm = ({ request, agencies, onSave, onCancel, loading = false, isViewMode = false }) => {
  const [formData, setFormData] = useState({
    agencyId: request?.agencyId || "",
    skills: request?.skills?.join(', ') || "",
    experienceLevel: request?.experienceLevel || "Entry Level",
    hourlyRateBudget: request?.hourlyRateBudget || "",
    startDatePreference: request?.startDatePreference ? request.startDatePreference.split('T')[0] : "",
    specialRequirements: request?.specialRequirements || "",
    status: request?.status || "Pending",
    notes: request?.notes || ""
  });

  const [errors, setErrors] = useState({});

  const experienceLevelOptions = [
    { value: "Entry Level", label: "Entry Level (0-2 years)" },
    { value: "Intermediate", label: "Intermediate (2-5 years)" },
    { value: "Expert", label: "Expert (5+ years)" }
  ];

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const agencyOptions = agencies.map(agency => ({
    value: agency.Id.toString(),
    label: agency.name
  }));

  const validateForm = () => {
    const newErrors = {};

    if (!formData.agencyId) {
      newErrors.agencyId = "Agency selection is required";
    }

    if (!formData.skills.trim()) {
      newErrors.skills = "Required skills are required";
    }

    if (!formData.hourlyRateBudget) {
      newErrors.hourlyRateBudget = "Hourly rate budget is required";
    } else if (isNaN(formData.hourlyRateBudget) || parseFloat(formData.hourlyRateBudget) <= 0) {
      newErrors.hourlyRateBudget = "Please enter a valid hourly rate";
    }

    if (!formData.startDatePreference) {
      newErrors.startDatePreference = "Start date preference is required";
    } else {
      const selectedDate = new Date(formData.startDatePreference);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.startDatePreference = "Start date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isViewMode && !validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      const saveData = {
        ...formData,
        agencyId: parseInt(formData.agencyId),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        hourlyRateBudget: parseFloat(formData.hourlyRateBudget),
        startDatePreference: new Date(formData.startDatePreference).toISOString()
      };
      await onSave(saveData);
    } catch (error) {
      toast.error("Failed to save VA request. Please try again.");
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
      {!isViewMode && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ApperIcon name="Info" size={16} className="text-blue-600" />
            <h3 className="font-medium text-blue-900">Request Information</h3>
          </div>
          <p className="text-sm text-blue-700">
            Please provide detailed information about your VA requirements. This will help us match you with the most suitable virtual assistant.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Agency"
          value={formData.agencyId}
          onChange={(e) => handleChange("agencyId", e.target.value)}
          options={agencyOptions}
          placeholder="Select requesting agency..."
          error={errors.agencyId}
          required
          disabled={isViewMode}
        />

        <Select
          label="Experience Level Required"
          value={formData.experienceLevel}
          onChange={(e) => handleChange("experienceLevel", e.target.value)}
          options={experienceLevelOptions}
          required
          disabled={isViewMode}
        />
      </div>

      <Input
        label="Required Skills"
        value={formData.skills}
        onChange={(e) => handleChange("skills", e.target.value)}
        error={errors.skills}
        placeholder="e.g. Customer Service, Data Entry, Social Media Management"
        required
        disabled={isViewMode}
        helpText="Separate multiple skills with commas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Hourly Rate Budget ($)"
          type="number"
          value={formData.hourlyRateBudget}
          onChange={(e) => handleChange("hourlyRateBudget", e.target.value)}
          error={errors.hourlyRateBudget}
          placeholder="25.00"
          required
          min="1"
          step="0.01"
          disabled={isViewMode}
        />

        <Input
          label="Preferred Start Date"
          type="date"
          value={formData.startDatePreference}
          onChange={(e) => handleChange("startDatePreference", e.target.value)}
          error={errors.startDatePreference}
          required
          min={new Date().toISOString().split('T')[0]}
          disabled={isViewMode}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Special Requirements
          {!isViewMode && <span className="text-slate-500 ml-1">(Optional)</span>}
        </label>
        <textarea
          value={formData.specialRequirements}
          onChange={(e) => handleChange("specialRequirements", e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          rows={4}
          placeholder="Any specific requirements, timezone preferences, or additional details..."
          disabled={isViewMode}
        />
      </div>

      {isViewMode && (
        <>
          <Select
            label="Request Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={statusOptions}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Add notes about status changes, progress updates, etc..."
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          {isViewMode ? "Close" : "Cancel"}
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
              {isViewMode ? "Update Request" : "Submit Request"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default VARequestForm;