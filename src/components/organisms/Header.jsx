import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import checkInService from "@/services/api/checkInService";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";
const Header = ({ toggleMobileSidebar }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 lg:pl-6 lg:pr-8">
      <div className="flex items-center justify-between">
<div className="flex items-center gap-4">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ApperIcon name="Menu" size={24} className="text-slate-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <ApperIcon name="Users" className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">TalentFuze</h1>
              <p className="text-sm text-slate-600">Client Portal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GlobalSearch />
          <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
            <ApperIcon name="Bell" size={16} className="text-slate-600" />
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <ApperIcon name="User" size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState({ agencies: [], vas: [], checkIns: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setResults({ agencies: [], vas: [], checkIns: [] });
        return;
      }

      setLoading(true);
      try {
        const [agencies, vas, checkIns] = await Promise.all([
          agencyService.getAll(),
          virtualAssistantService.getAll(),
          checkInService.getAll()
        ]);

        const term = searchTerm.toLowerCase();

        const filteredAgencies = agencies
          .filter(agency => 
            agency.name.toLowerCase().includes(term) ||
            agency.contactName.toLowerCase().includes(term) ||
            agency.contactEmail.toLowerCase().includes(term)
          )
          .slice(0, 3);

        const filteredVAs = vas
          .filter(va => 
            va.name.toLowerCase().includes(term) ||
            va.email.toLowerCase().includes(term) ||
            va.skills.some(skill => skill.toLowerCase().includes(term))
          )
          .slice(0, 3);

        const filteredCheckIns = checkIns
          .filter(checkIn => {
            const va = vas.find(v => v.Id === checkIn.virtualAssistantId);
            const agency = agencies.find(a => a.Id === checkIn.agencyId);
            return (
              (va && va.name.toLowerCase().includes(term)) ||
              (agency && agency.name.toLowerCase().includes(term)) ||
              (checkIn.tasksCompleted && checkIn.tasksCompleted.toLowerCase().includes(term)) ||
              (checkIn.notes && checkIn.notes.toLowerCase().includes(term))
            );
          })
          .slice(0, 3);

        setResults({ agencies: filteredAgencies, vas: filteredVAs, checkIns: filteredCheckIns });
      } catch (error) {
        console.error("Search error:", error);
        setResults({ agencies: [], vas: [], checkIns: [] });
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleResultClick = (type, id) => {
    setIsOpen(false);
    setSearchTerm("");
    
    switch (type) {
      case 'agency':
        navigate(`/agency/${id}`);
        break;
      case 'va':
        navigate('/virtual-assistants');
        break;
      case 'checkIn':
        navigate('/check-ins');
        break;
      default:
        break;
    }
  };

  const totalResults = results.agencies.length + results.vas.length + results.checkIns.length;

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <ApperIcon 
          name="Search" 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
        />
        <input
          type="text"
          placeholder="Global search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200"
        />
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">
              <ApperIcon name="Loader2" size={20} className="animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : totalResults === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No results found for "{searchTerm}"
            </div>
          ) : (
            <div className="py-2">
              {results.agencies.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Agencies</div>
                  {results.agencies.map((agency) => (
                    <button
                      key={agency.Id}
                      onClick={() => handleResultClick('agency', agency.Id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <ApperIcon name="Building2" size={14} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{agency.name}</div>
                          <div className="text-sm text-slate-600">{agency.contactName}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.vas.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Virtual Assistants</div>
                  {results.vas.map((va) => (
                    <button
                      key={va.Id}
                      onClick={() => handleResultClick('va', va.Id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-500 rounded-full flex items-center justify-center">
                          <ApperIcon name="User" size={14} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{va.name}</div>
                          <div className="text-sm text-slate-600">{va.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.checkIns.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Check-ins</div>
                  {results.checkIns.map((checkIn) => (
                    <button
                      key={checkIn.Id}
                      onClick={() => handleResultClick('checkIn', checkIn.Id)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center">
                          <ApperIcon name="CheckSquare" size={14} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">Check-in from {new Date(checkIn.date).toLocaleDateString()}</div>
                          <div className="text-sm text-slate-600">{checkIn.hoursWorked} hours worked</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 px-3 py-2">
                <div className="text-xs text-slate-500">
                  Showing {totalResults} result{totalResults !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Header;