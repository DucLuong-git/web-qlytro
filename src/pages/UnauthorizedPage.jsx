import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-red-100">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Access Denied</h2>
        <p className="text-slate-600 text-lg">
          You do not have permission to view this page.
        </p>
        <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors mt-8">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
