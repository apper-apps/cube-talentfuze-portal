import React, { useState, useEffect } from "react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const CheckInForm = ({ 
  checkIn, 
  virtualAssistants = [], 
  agencies = [], 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    virtualAssistantId: '',
    agencyId: '',
    date: '',
    hoursWorked: '',
    tasksCompleted: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (checkIn) {
      setFormData({
        virtualAssistantId: checkIn.virtualAssistantId.toString(),
        agencyId: checkIn.agencyId.toString(),
        date: checkIn.date,
        hoursWorked: checkIn.hoursWorked.toString(),
        tasksCompleted: checkIn.tasksCompleted || '',
        notes: checkIn.notes || ''
      });
    } else {
      // Set today's date as default for new check-ins
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [checkIn]);

  const getAssignedAgencyId = (vaId) => {
    const va = virtualAssistants.find(v => v.Id === parseInt(vaId));
    return va ? va.agencyId : null;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-select agency when VA is selected
    if (field === 'virtualAssistantId' && value) {
      const assignedAgencyId = getAssignedAgencyId(value);
      if (assignedAgencyId) {
        setFormData(prev => ({ ...prev, agencyId: assignedAgencyId.toString() }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.virtualAssistantId) {
      newErrors.virtualAssistantId = 'Virtual Assistant is required';
    }
    
    if (!formData.agencyId) {
      newErrors.agencyId = 'Agency is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.hoursWorked) {
      newErrors.hoursWorked = 'Hours worked is required';
    } else {
      const hours = parseFloat(formData.hoursWorked);
      if (isNaN(hours) || hours <= 0 || hours > 24) {
        newErrors.hoursWorked = 'Hours must be between 0.1 and 24';
      }
    }
    
    if (!formData.tasksCompleted?.trim()) {
      newErrors.tasksCompleted = 'Tasks completed is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      virtualAssistantId: parseInt(formData.virtualAssistantId),
      agencyId: parseInt(formData.agencyId),
      hoursWorked: parseFloat(formData.hoursWorked)
    };

    await onSave(submitData);
  };

  // Get available agencies for selected VA
  const getAvailableAgencies = () => {
    if (!formData.virtualAssistantId) {
      return agencies;
    }
    
    const assignedAgencyId = getAssignedAgencyId(formData.virtualAssistantId);
    if (assignedAgencyId) {
      return agencies.filter(agency => agency.Id === assignedAgencyId);
    }
    
    return agencies;
  };

  const availableAgencies = getAvailableAgencies();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Virtual Assistant *"
          placeholder="Select Virtual Assistant"
          value={formData.virtualAssistantId}
          onChange={(e) => handleChange('virtualAssistantId', e.target.value)}
          options={virtualAssistants.map(va => ({
            value: va.Id.toString(),
            label: va.name
          }))}
          error={errors.virtualAssistantId}
        />

        <Select
          label="Agency *"
          placeholder="Select Agency"
          value={formData.agencyId}
          onChange={(e) => handleChange('agencyId', e.target.value)}
          options={availableAgencies.map(agency => ({
            value: agency.Id.toString(),
            label: agency.name
          }))}
          error={errors.agencyId}
          disabled={formData.virtualAssistantId && availableAgencies.length === 1}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="date"
          label="Date *"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          error={errors.date}
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
        />

        <Input
          type="number"
          label="Hours Worked *"
          placeholder="8.0"
          value={formData.hoursWorked}
          onChange={(e) => handleChange('hoursWorked', e.target.value)}
          error={errors.hoursWorked}
          min="0.1"
          max="24"
          step="0.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tasks Completed *
        </label>
        <textarea
          value={formData.tasksCompleted}
          onChange={(e) => handleChange('tasksCompleted', e.target.value)}
          placeholder="Describe the tasks you completed today..."
          rows={4}
          className={cn(
            "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base resize-vertical",
            errors.tasksCompleted && "border-error focus:border-error focus:ring-red-100"
          )}
        />
        {errors.tasksCompleted && (
          <p className="mt-2 text-sm text-error font-medium">{errors.tasksCompleted}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional notes or observations..."
          rows={3}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base resize-vertical"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            checkIn ? 'Update Check-in' : 'Submit Check-in'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CheckInForm;