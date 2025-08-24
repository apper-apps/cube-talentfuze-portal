import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const AgencyForm = ({ agency, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: agency?.name || "",
    contactName: agency?.contactName || "",
    contactEmail: agency?.contactEmail || "",
    phone: agency?.phone || "",
    status: agency?.status || "active"
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Agency name is required";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
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
      await onSave(formData);
      const action = agency ? "updated" : "created";
      toast.success(`Agency ${formData.name} has been ${action} successfully`);
    } catch (error) {
      toast.error("Failed to save agency. Please try again.");
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
          label="Agency Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter agency name"
          required
        />

        <Input
          label="Contact Person"
          value={formData.contactName}
          onChange={(e) => handleChange("contactName", e.target.value)}
          error={errors.contactName}
          placeholder="Enter contact person name"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Contact Email"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => handleChange("contactEmail", e.target.value)}
          error={errors.contactEmail}
          placeholder="Enter contact email"
          required
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          placeholder="Enter phone number"
          required
        />
      </div>

      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => handleChange("status", e.target.value)}
        options={statusOptions}
        required
      />

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
              {agency ? "Update Agency" : "Create Agency"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AgencyForm;