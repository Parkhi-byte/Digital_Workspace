import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const ProtectedMasterAdminRoute = ({ children }) => {
    const { user, loading, isMasterAdmin } = useAuth();

    useEffect(() => {
        if (!loading && user && !isMasterAdmin) {
            toast.error('Access denied. Master Admin only.');
        }
    }, [user, loading, isMasterAdmin]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Loading panel...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isMasterAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedMasterAdminRoute;
