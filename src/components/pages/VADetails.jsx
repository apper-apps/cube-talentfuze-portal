import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import VirtualAssistantForm from "@/components/organisms/VirtualAssistantForm";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import checkInService from "@/services/api/checkInService";
import agencyService from "@/services/api/agencyService";
import virtualAssistantService from "@/services/api/virtualAssistantService";

const VADetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [va, setVA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [checkIns, setCheckIns] = useState([]);
  const [checkInsLoading, setCheckInsLoading] = useState(true);
  const [agencies, setAgencies] = useState([]);
  const [agencyHistory, setAgencyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadVA();
    loadCheckIns();
    loadAgencies();
    loadAgencyHistory();
  }, [id]);

  const loadVA = async () => {
    try {
      setLoading(true);
      setError(null);
      const vaData = await virtualAssistantService.getById(id);
      setVA(vaData);
    } catch (err) {
      setError("Failed to load VA details. Please try again.");
      toast.error("Failed to load VA details");
    } finally {
      setLoading(false);
    }
  };

  const loadCheckIns = async () => {
    try {
      setCheckInsLoading(true);
      const data = await checkInService.getByVirtualAssistantId(parseInt(id));
      setCheckIns(data);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
      toast.error('Failed to load check-ins');
    } finally {
      setCheckInsLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const agencyData = await agencyService.getAll();
      setAgencies(agencyData);
    } catch (err) {
      console.error('Failed to load agencies:', err);
    }
  };

  const loadAgencyHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyData = await virtualAssistantService.getVAHistory(parseInt(id));
      setAgencyHistory(historyData);
    } catch (err) {
      console.error('Failed to load agency history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEditVA = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveVA = async (formData) => {
    try {
      setFormLoading(true);
      const updatedVA = await virtualAssistantService.update(va.Id, formData);
      setVA(updatedVA);
      setIsEditModalOpen(false);
      toast.success(`${formData.name} has been updated successfully`);
    } catch (error) {
      toast.error("Failed to update VA. Please try again.");
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleBackToList = () => {
    navigate("/virtual-assistants");
  };

  const getAgencyName = (agencyId) => {
    const agency = agencies.find(a => a.Id === agencyId);
    return agency ? agency.name : 'Unknown Agency';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'onboarding': return 'warning';
      case 'paused': return 'error';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading message="Loading VA details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error 
          message={error} 
          onRetry={loadVA}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  if (!va) {
    return (
      <div className="p-6">
        <Error 
          message="Virtual Assistant not found" 
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBackToList}
            className="p-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{va.name}</h1>
            <p className="text-slate-600 mt-1">Virtual Assistant Profile</p>
          </div>
        </div>
        <Button
          onClick={handleEditVA}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Edit" size={18} />
          Edit Profile
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="User" size={16} />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'checkins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="CheckSquare" size={16} />
                Check-ins ({checkIns.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'resume'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="FileText" size={16} />
                Resume
              </div>
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'portfolio'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="Briefcase" size={16} />
                Portfolio
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ApperIcon name="History" size={16} />
                Agency History
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
                <Badge variant={getStatusBadgeVariant(va.status)}>
                  {va.status ? va.status.charAt(0).toUpperCase() + va.status.slice(1) : 'Unknown'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <p className="text-base text-slate-900">{va.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <p className="text-base text-slate-900">
                    <a 
                      href={`mailto:${va.email}`}
                      className="text-primary hover:text-accent transition-colors"
                    >
                      {va.email}
                    </a>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <p className="text-base text-slate-900">
                    {va.phone ? (
                      <a 
                        href={`tel:${va.phone}`}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        {va.phone}
                      </a>
                    ) : 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Agency
                  </label>
                  <p className="text-base text-slate-900">
                    {va.agencyId ? getAgencyName(va.agencyId) : 'Unassigned'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <p className="text-base text-slate-900">
                    {formatDate(va.startDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <Badge variant={getStatusBadgeVariant(va.status)}>
                    {va.status ? va.status.charAt(0).toUpperCase() + va.status.slice(1) : 'Unknown'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Skills & Expertise Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Skills & Expertise</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Core Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {va.skills && va.skills.length > 0 ? (
                      va.skills.map((skill, index) => (
                        <Badge key={index} variant="default" className="text-sm">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No skills listed</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Experience Level
                  </label>
                  <p className="text-base text-slate-900">
                    {va.experienceLevel || 'Not specified'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hourly Rate
                  </label>
                  <p className="text-base text-slate-900">
                    {va.hourlyRate ? `$${va.hourlyRate}/hour` : 'Not specified'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Check-ins</span>
                  <span className="text-xl font-bold text-slate-900">{checkIns.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Hours This Month</span>
                  <span className="text-xl font-bold text-slate-900">
                    {checkIns
                      .filter(c => new Date(c.date).getMonth() === new Date().getMonth())
                      .reduce((sum, c) => sum + c.hoursWorked, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Avg Hours/Day</span>
                  <span className="text-xl font-bold text-slate-900">
                    {checkIns.length > 0 
                      ? (checkIns.reduce((sum, c) => sum + c.hoursWorked, 0) / checkIns.length).toFixed(1)
                      : '0'
                    }
                  </span>
                </div>
              </div>
            </Card>

            {/* Contact Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => va.email && window.open(`mailto:${va.email}`, '_blank')}
                  disabled={!va.email}
                >
                  <ApperIcon name="Mail" size={16} className="mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => va.phone && window.open(`tel:${va.phone}`, '_blank')}
                  disabled={!va.phone}
                >
                  <ApperIcon name="Phone" size={16} className="mr-2" />
                  Call VA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('checkins')}
                >
                  <ApperIcon name="CheckSquare" size={16} className="mr-2" />
                  View Check-ins
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'checkins' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Daily Check-ins</h3>
              <div className="text-sm text-slate-600">
                {checkIns.length} total check-ins
              </div>
            </div>

            {checkInsLoading ? (
              <Loading rows={4} />
            ) : checkIns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="CheckSquare" size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No check-ins yet</p>
                <p className="text-sm text-slate-500">
                  Daily check-ins will appear here when submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.Id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <ApperIcon name="Calendar" size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {new Date(checkIn.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-slate-500">
                            {getAgencyName(checkIn.agencyId)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">
                          {checkIn.hoursWorked} hours worked
                        </div>
                        <div className="text-sm text-slate-500">
                          Submitted {formatDate(checkIn.submittedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Tasks Completed
                        </label>
                        <div className="text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">
                          {checkIn.tasksCompleted || 'No tasks listed'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Notes
                        </label>
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {checkIn.notes || 'No notes provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Professional Resume</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ApperIcon name="Download" size={16} />
                Download PDF
              </Button>
            </div>

            <div className="space-y-6">
              {/* Professional Summary */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Professional Summary</h4>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-700">
                    {va.resume?.summary || 'Experienced Virtual Assistant with expertise in administrative support, project management, and client communication. Proven track record of delivering high-quality work remotely while maintaining excellent client relationships.'}
                  </p>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Work Experience</h4>
                <div className="space-y-4">
                  {va.resume?.experience?.map((exp, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-slate-900">{exp.title}</h5>
                          <p className="text-slate-600">{exp.company}</p>
                        </div>
                        <span className="text-sm text-slate-500">{exp.duration}</span>
                      </div>
                      <p className="text-slate-700">{exp.description}</p>
                    </div>
                  )) || (
                    <div className="border-l-4 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold text-slate-900">Virtual Assistant</h5>
                          <p className="text-slate-600">Various Clients</p>
                        </div>
                        <span className="text-sm text-slate-500">2020 - Present</span>
                      </div>
                      <p className="text-slate-700">
                        Provided comprehensive administrative support including email management, calendar coordination, 
                        data entry, and customer service across multiple industries.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">Education & Certifications</h4>
                <div className="space-y-3">
                  {va.resume?.education?.map((edu, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h5 className="font-semibold text-slate-900">{edu.degree}</h5>
                        <p className="text-slate-600">{edu.institution}</p>
                      </div>
                      <span className="text-sm text-slate-500">{edu.year}</span>
                    </div>
                  )) || (
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h5 className="font-semibold text-slate-900">Bachelor's Degree</h5>
                        <p className="text-slate-600">University Education</p>
                      </div>
                      <span className="text-sm text-slate-500">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Work Portfolio</h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ApperIcon name="ExternalLink" size={16} />
                View Full Portfolio
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {va.portfolio?.projects?.map((project, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      <ApperIcon name="Briefcase" size={18} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{project.title}</h4>
                      <p className="text-sm text-slate-600">{project.client}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 mb-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.skills?.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{project.duration}</span>
                    <Badge variant="success" className="text-xs">Completed</Badge>
                  </div>
                </Card>
              )) || (
                // Default portfolio items
                <>
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <ApperIcon name="Mail" size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Email Management System</h4>
                        <p className="text-sm text-slate-600">TechStart Corp</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">
                      Implemented comprehensive email management system, reducing response time by 60% and improving client satisfaction.
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">Email Management</Badge>
                      <Badge variant="secondary" className="text-xs">Client Relations</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>3 months</span>
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <ApperIcon name="Calendar" size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Project Coordination</h4>
                        <p className="text-sm text-slate-600">Marketing Plus Agency</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">
                      Coordinated multiple client projects simultaneously, ensuring on-time delivery and stakeholder satisfaction.
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">Project Management</Badge>
                      <Badge variant="secondary" className="text-xs">Coordination</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>6 months</span>
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <ApperIcon name="BarChart3" size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Data Analysis Dashboard</h4>
                        <p className="text-sm text-slate-600">E-commerce Solutions</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 mb-3">
                      Created comprehensive data analysis dashboard providing actionable insights for business decision-making.
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="secondary" className="text-xs">Data Analysis</Badge>
                      <Badge variant="secondary" className="text-xs">Reporting</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>4 months</span>
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Skills & Testimonials */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-base font-semibold text-slate-900 mb-4">Client Testimonials</h4>
              <div className="space-y-4">
                {va.portfolio?.testimonials?.map((testimonial, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700 italic mb-2">"{testimonial.text}"</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-900">{testimonial.client}</span>
                      <span className="text-sm text-slate-500">{testimonial.role}</span>
                    </div>
                  </div>
                )) || (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-700 italic mb-2">
                      "Exceptional work quality and communication. Always delivers on time and exceeds expectations. 
                      A pleasure to work with!"
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-900">Sarah Johnson</span>
                      <span className="text-sm text-slate-500">Project Manager, TechStart Corp</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Agency History</h3>
              <div className="text-sm text-slate-600">
                {agencyHistory.length} assignments
              </div>
            </div>

            {historyLoading ? (
              <Loading rows={3} />
            ) : agencyHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Building2" size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 mb-2">No agency history available</p>
                <p className="text-sm text-slate-500">
                  Agency assignments and history will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {agencyHistory.map((assignment, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <ApperIcon name="Building2" size={18} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{assignment.agencyName}</h4>
                          <p className="text-sm text-slate-600">{assignment.role || 'Virtual Assistant'}</p>
                        </div>
                      </div>
                      <Badge variant={assignment.status === 'completed' ? 'success' : assignment.status === 'current' ? 'warning' : 'secondary'}>
                        {assignment.status ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) : 'Completed'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Duration
                        </label>
                        <p className="text-sm text-slate-900">
                          {assignment.startDate ? formatDate(assignment.startDate) : 'N/A'} - {assignment.endDate ? formatDate(assignment.endDate) : 'Present'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Performance Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <ApperIcon 
                              key={i} 
                              name="Star" 
                              size={14} 
                              className={i < (assignment.rating || 4) ? 'text-yellow-400 fill-current' : 'text-slate-300'} 
                            />
                          ))}
                          <span className="text-sm text-slate-600 ml-1">({assignment.rating || 4.5}/5)</span>
                        </div>
                      </div>
                    </div>

                    {assignment.notes && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Notes
                        </label>
                        <p className="text-sm text-slate-700">{assignment.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        title="Edit Virtual Assistant"
        size="lg"
      >
        <VirtualAssistantForm
          va={va}
          agencies={agencies}
          onSave={handleSaveVA}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default VADetails;