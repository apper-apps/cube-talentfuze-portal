import { useState } from "react";
import { cn } from "@/utils/cn";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const AgencyTable = ({ 
  agencies, 
  loading, 
  error, 
  onRefresh, 
  onEdit, 
  onDelete,
  onAdd 
}) => {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (agency) => {
    if (window.confirm(`Are you sure you want to delete ${agency.name}?`)) {
      try {
        await onDelete(agency.Id);
        toast.success(`${agency.name} has been deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete agency. Please try again.");
      }
    }
  };

  const sortedAgencies = [...agencies].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  if (loading) {
    return (
      <Card className="p-6">
        <Loading rows={6} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={onRefresh} />
      </Card>
    );
  }

  if (!agencies.length) {
    return (
      <Card className="p-6">
        <Empty 
          title="No agencies found"
          description="Get started by adding your first agency partner. You can manage their information and track their virtual assistants all in one place."
          actionLabel="Add Agency"
          onAction={onAdd}
          icon="Building2"
        />
      </Card>
    );
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th 
                className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Agency Name
                  <ApperIcon name={getSortIcon("name")} size={16} />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("contactName")}
              >
                <div className="flex items-center gap-2">
                  Contact Person
                  <ApperIcon name={getSortIcon("contactName")} size={16} />
                </div>
              </th>
              <th className="text-left px-6 py-4 font-semibold text-slate-700">
                Contact Info
              </th>
              <th 
                className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <ApperIcon name={getSortIcon("status")} size={16} />
                </div>
              </th>
              <th 
                className="text-left px-6 py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort("vaCount")}
              >
                <div className="flex items-center gap-2">
                  VAs
                  <ApperIcon name={getSortIcon("vaCount")} size={16} />
                </div>
              </th>
              <th className="text-center px-6 py-4 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAgencies.map((agency, index) => (
              <tr 
                key={agency.Id}
                className={cn(
                  "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-slate-25"
                )}
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{agency.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-700">{agency.contactName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <ApperIcon name="Mail" size={14} />
                      {agency.contactEmail}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <ApperIcon name="Phone" size={14} />
                      {agency.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={agency.status}>
                    {agency.status.charAt(0).toUpperCase() + agency.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-accent to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{agency.vaCount}</span>
                    </div>
                    <span className="text-sm text-slate-600">VAs</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(agency)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(agency)}
                      className="p-2"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AgencyTable;