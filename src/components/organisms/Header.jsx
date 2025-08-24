import ApperIcon from "@/components/ApperIcon";

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

export default Header;