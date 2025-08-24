import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const VirtualAssistantTable = ({ 
  virtualAssistants, 
  agencies,
  loading, 
  error, 
  onRefresh 
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

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Id === agencyId);
    return agency ? agency.name : "Unassigned";
  };

  const sortedVAs = [...virtualAssistants].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "agencyId") {
      aValue = getAgencyName(a.agencyId);
      bValue = getAgencyName(b.agencyId);
    }
    
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

  if (!virtualAssistants.length) {
    return (
      <Card className="p-6">
        <Empty 
          title="No virtual assistants found"
          description="Your virtual assistants will appear here once they are assigned to agencies. Manage their assignments and track their availability."
          actionLabel="Refresh Data"
          onAction={onRefresh}
          icon="Users"
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
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[768px]">
                <thead
                    className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                            onClick={() => handleSort("name")}>
                            <div className="flex items-center gap-2">VA Name
                                                  <ApperIcon name={getSortIcon("name")} size={16} />
                            </div>
                        </th>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 whitespace-nowrap">Contact
                                          </th>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                            onClick={() => handleSort("agencyId")}>
                            <div className="flex items-center gap-2">Agency
                                                  <ApperIcon name={getSortIcon("agencyId")} size={16} />
                            </div>
                        </th>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 whitespace-nowrap">Skills
                                          </th>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                            onClick={() => handleSort("status")}>
                            <div className="flex items-center gap-2">Status
                                                  <ApperIcon name={getSortIcon("status")} size={16} />
                            </div>
                        </th>
                        <th
                            className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                            onClick={() => handleSort("startDate")}>
                            <div className="flex items-center gap-2">Start Date
                                                  <ApperIcon name={getSortIcon("startDate")} size={16} />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedVAs.map((va, index) => <tr
                        key={va.Id}
                        className={cn(
                            "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                            index % 2 === 0 ? "bg-white" : "bg-slate-25"
                        )}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center">
                                    <ApperIcon name="User" size={14} className="sm:size-4 text-white" />
                                </div>
                                <div className="font-semibold text-slate-900 text-sm sm:text-base">{va.name}</div>
                            </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <ApperIcon name="Mail" size={12} className="sm:size-3.5 flex-shrink-0" />
                                <span className="truncate">{va.email}</span>
                            </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                                    <ApperIcon name="Building2" size={10} className="sm:size-3 text-white" />
                                </div>
                                <span className="font-medium text-slate-700 text-sm truncate">{getAgencyName(va.agencyId)}</span>
                            </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-wrap gap-1">
                                {va.skills.slice(0, 2).map(
                                    (skill, skillIndex) => <Badge key={skillIndex} variant="default" className="text-xs">
                                        {skill}
                                    </Badge>
                                )}
                                {va.skills.length > 2 && <Badge variant="default" className="text-xs">+{va.skills.length - 2}
                                </Badge>}
                            </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <Badge variant={va.status} className="text-xs">
                                {va.status.charAt(0).toUpperCase() + va.status.slice(1)}
                            </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="text-xs sm:text-sm text-slate-600">
                                {format(new Date(va.startDate), "MMM dd, yyyy")}
                            </div>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    </div></Card>
  );
};

export default VirtualAssistantTable;