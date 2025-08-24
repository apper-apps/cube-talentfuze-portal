import { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import VirtualAssistantTable from "@/components/organisms/VirtualAssistantTable";
import virtualAssistantService from "@/services/api/virtualAssistantService";
import agencyService from "@/services/api/agencyService";

const VirtualAssistants = () => {
  const [virtualAssistants, setVirtualAssistants] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [filteredVAs, setFilteredVAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      
      const [vasData, agenciesData] = await Promise.all([
        virtualAssistantService.getAll(),
        agencyService.getAll()
      ]);
      
      setVirtualAssistants(vasData);
      setAgencies(agenciesData);
      setFilteredVAs(vasData);
    } catch (err) {
      setError("Failed to load virtual assistants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const filtered = virtualAssistants.filter(va => {
      const agency = agencies.find(a => a.Id === va.agencyId);
      const agencyName = agency ? agency.name : "";
      
      return (
        va.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        va.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        va.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    setFilteredVAs(filtered);
  }, [virtualAssistants, agencies, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Virtual Assistants</h1>
          <p className="text-slate-600 mt-1">Manage virtual assistant assignments and availability</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search VAs by name, email, agency, or skills..."
        />
      </div>

      {/* Virtual Assistant Table */}
      <VirtualAssistantTable
        virtualAssistants={filteredVAs}
        agencies={agencies}
        loading={loading}
        error={error}
        onRefresh={loadData}
      />
    </div>
  );
};

export default VirtualAssistants;