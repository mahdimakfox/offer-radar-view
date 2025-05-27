
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EndpointManagement from '@/components/admin/EndpointManagement';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Admin = () => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage provider data through API integrations and endpoint configurations
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <EndpointManagement />
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
