import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const InternalEmployeeForm = ({ employee, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    role: employee?.role || "",
    email: employee?.email || "",
    accessLevel: employee?.accessLevel || "user"
  });

  const [errors, setErrors] = useState({});

  const accessLevelOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "user", label: "User" },
    { value: "viewer", label: "Viewer" }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Employee name is required";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.accessLevel) {
      newErrors.accessLevel = "Access level is required";
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
    } catch (error) {
      toast.error("Failed to save employee. Please try again.");
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
          label="Employee Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="Enter employee name"
          required
        />

        <Input
          label="Role"
          value={formData.role}
          onChange={(e) => handleChange("role", e.target.value)}
          error={errors.role}
          placeholder="Enter role/position"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          required
        />

        <Select
          label="Access Level"
          value={formData.accessLevel}
          onChange={(e) => handleChange("accessLevel", e.target.value)}
          error={errors.accessLevel}
          options={accessLevelOptions}
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
              {employee ? "Update Employee" : "Add Employee"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default InternalEmployeeForm;