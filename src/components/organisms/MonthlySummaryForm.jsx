import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";

const MonthlySummaryForm = ({ summary, onSave, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    reportingPeriod: summary?.reportingPeriod || "",
    performanceNotes: summary?.performanceNotes || "",
    keyAchievements: summary?.keyAchievements || "",
    areasForImprovement: summary?.areasForImprovement || "",
    nextMonthGoals: summary?.nextMonthGoals || ""
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reportingPeriod.trim()) {
      newErrors.reportingPeriod = "Reporting period is required";
    } else if (!/^[A-Za-z]+ \d{4}$/.test(formData.reportingPeriod.trim())) {
      newErrors.reportingPeriod = "Please use format 'Month YYYY' (e.g., 'January 2024')";
    }

    if (!formData.performanceNotes.trim()) {
      newErrors.performanceNotes = "Performance notes are required";
    } else if (formData.performanceNotes.trim().length < 10) {
      newErrors.performanceNotes = "Performance notes must be at least 10 characters long";
    }

    if (!formData.keyAchievements.trim()) {
      newErrors.keyAchievements = "Key achievements are required";
    } else if (formData.keyAchievements.trim().length < 10) {
      newErrors.keyAchievements = "Key achievements must be at least 10 characters long";
    }

    if (!formData.areasForImprovement.trim()) {
      newErrors.areasForImprovement = "Areas for improvement are required";
    } else if (formData.areasForImprovement.trim().length < 10) {
      newErrors.areasForImprovement = "Areas for improvement must be at least 10 characters long";
    }

    if (!formData.nextMonthGoals.trim()) {
      newErrors.nextMonthGoals = "Next month's goals are required";
    } else if (formData.nextMonthGoals.trim().length < 10) {
      newErrors.nextMonthGoals = "Next month's goals must be at least 10 characters long";
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
      console.error("Failed to save monthly summary:", error);
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
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Reporting Period"
          value={formData.reportingPeriod}
          onChange={(e) => handleChange("reportingPeriod", e.target.value)}
          error={errors.reportingPeriod}
          placeholder="e.g., January 2024"
          required
          helpText="Format: Month YYYY"
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Overall Performance Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.performanceNotes}
            onChange={(e) => handleChange("performanceNotes", e.target.value)}
            placeholder="Provide an overall assessment of the agency's performance during this period..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              errors.performanceNotes ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.performanceNotes && (
            <p className="mt-1 text-sm text-red-600">{errors.performanceNotes}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Key Achievements <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.keyAchievements}
            onChange={(e) => handleChange("keyAchievements", e.target.value)}
            placeholder="List the major accomplishments and successes during this period..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              errors.keyAchievements ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.keyAchievements && (
            <p className="mt-1 text-sm text-red-600">{errors.keyAchievements}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Areas for Improvement <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.areasForImprovement}
            onChange={(e) => handleChange("areasForImprovement", e.target.value)}
            placeholder="Identify areas where the agency can improve and grow..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              errors.areasForImprovement ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.areasForImprovement && (
            <p className="mt-1 text-sm text-red-600">{errors.areasForImprovement}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Next Month's Goals <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.nextMonthGoals}
            onChange={(e) => handleChange("nextMonthGoals", e.target.value)}
            placeholder="Set specific goals and objectives for the upcoming month..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              errors.nextMonthGoals ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.nextMonthGoals && (
            <p className="mt-1 text-sm text-red-600">{errors.nextMonthGoals}</p>
          )}
        </div>
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
          className="min-w-[140px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ApperIcon name="Save" size={18} />
              {summary ? "Update Report" : "Create Report"}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MonthlySummaryForm;