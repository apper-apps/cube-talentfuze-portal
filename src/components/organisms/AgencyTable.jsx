import React, { useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const AgencyTable = ({ 
  agencies = [], 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deletingId, setDeletingId] = useState(null);

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
      setDeletingId(agency.Id);
      try {
        await onDelete(agency.Id);
      } catch (error) {
        toast.error("Failed to delete agency");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "ArrowUpDown";
    return sortDirection === "asc" ? "ArrowUp" : "ArrowDown";
  };
// Sort agencies
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

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!agencies.length) return <Empty message="No agencies found" />;

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900"
                >
                  Agency Name
                  <ApperIcon name={getSortIcon("name")} size={16} />
                </button>
              </th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort("contactName")}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900"
                >
                  Primary Contact
                  <ApperIcon name={getSortIcon("contactName")} size={16} />
                </button>
              </th>
              <th className="text-left p-4 font-semibold text-slate-700">
                Contact Email
              </th>
              <th className="text-left p-4 font-semibold text-slate-700">
                Phone
</th>
              <th className="text-left p-4">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900"
                >
                  Status
                  <ApperIcon name={getSortIcon("status")} size={16} />
                </button>
              </th>
              <th className="text-right p-4 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedAgencies.map((agency) => (
              <tr 
                key={agency.Id} 
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="p-4">
                  <div className="font-semibold text-slate-900">
                    {agency.name}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-slate-700">
                    {agency.contactName}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-slate-700">
                    {agency.contactEmail}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-slate-700">
                    {agency.phone}
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={agency.status === "active" ? "success" : "secondary"}
                  >
                    {agency.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </td>
<td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(agency)}
                      className="p-2"
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
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
                      disabled={deletingId === agency.Id}
                      className="p-2"
                    >
                      {deletingId === agency.Id ? (
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                      ) : (
                        <ApperIcon name="Trash2" size={16} />
                      )}
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