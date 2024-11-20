import React, { useState } from 'react';
import { MapPin, Calendar, ChevronDown, ChevronUp, Construction, PartyPopper, Stethoscope, DollarSign, User } from 'lucide-react';
import { Lead } from '../store/LeadContext';
import { useLeads } from '../store/LeadContext';
import { useAuth } from '../store/AuthContext';
import AuthModal from './AuthModal';
import PaymentModal from './PaymentModal';
import { LEAD_PRICE } from '../lib/stripe';

interface LeadTableProps {
  leads: Lead[];
  type: 'available' | 'purchased';
}

export default function LeadTable({ leads, type }: LeadTableProps) {
  const { purchaseLead, updateLeadStatus } = useLeads();
  const { user } = useAuth();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Show available leads to everyone, but purchased leads only to their owners
  const visibleLeads = type === 'available' 
    ? leads.filter(lead => !lead.purchasedBy)
    : leads.filter(lead => lead.purchasedBy === user?.id);

  const handlePurchaseClick = (leadId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedLeadId(leadId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!selectedLeadId) return;
    try {
      await purchaseLead(selectedLeadId);
      setShowPaymentModal(false);
      setSelectedLeadId(null);
    } catch (error) {
      console.error('Error purchasing lead:', error);
    }
  };

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      await updateLeadStatus(leadId, status);
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const toggleExpand = (leadId: string) => {
    setExpandedLead(expandedLead === leadId ? null : leadId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "h-5 w-5 text-gray-400";
    switch (category.toLowerCase()) {
      case 'construction':
        return <Construction className={iconClass} />;
      case 'party':
        return <PartyPopper className={iconClass} />;
      case 'medical':
        return <Stethoscope className={iconClass} />;
      default:
        return <Construction className={iconClass} />;
    }
  };

  if (visibleLeads.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {type === 'available' ? 'Available Leads' : 'Purchased Leads'}
          </h2>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden">
          {visibleLeads.map((lead) => (
            <div key={lead.id} className="p-4 border-b border-gray-200">
              <div className="space-y-4">
                {/* Category and Equipment */}
                <div>
                  <div className="flex items-center mb-2">
                    {getCategoryIcon(lead.category)}
                    <span className="ml-2 font-medium text-gray-900">{lead.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.equipmentTypes.map((type, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {lead.city}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(lead.startDate)}
                    </div>
                  </div>
                </div>

                {/* Budget and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {lead.budget}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {lead.rentalDuration}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {type === 'available' ? (
                    <button
                      onClick={() => handlePurchaseClick(lead.id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Customer Details (${LEAD_PRICE / 100})
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExpand(lead.id)}
                      className="w-full flex justify-center items-center text-blue-600 hover:text-blue-900"
                    >
                      {expandedLead === lead.id ? 'Hide Details' : 'View Details'}
                      {expandedLead === lead.id ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded Details for Purchased Leads */}
                {type === 'purchased' && expandedLead === lead.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                      <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-900">{lead.email}</p>
                      <p className="text-sm text-gray-900">{lead.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="mt-1 text-sm text-gray-900">{lead.street}</p>
                      <p className="text-sm text-gray-900">{lead.city}, {lead.zipCode}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                      <p className="mt-1 text-sm text-gray-900">{lead.details || 'No additional details provided'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Lead Status</h4>
                      <select
                        value={lead.leadStatus || ''}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select status</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Meeting Scheduled">Meeting Scheduled</option>
                        <option value="Quote Sent">Quote Sent</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleLeads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-2">
                          {getCategoryIcon(lead.category)}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lead.equipmentTypes.map((type, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{lead.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{lead.rentalDuration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{lead.budget}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(lead.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      {type === 'available' ? (
                        <button
                          onClick={() => handlePurchaseClick(lead.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Customer Details (${LEAD_PRICE / 100})
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleExpand(lead.id)}
                          className="flex items-center text-blue-600 hover:text-blue-900"
                        >
                          {expandedLead === lead.id ? 'Hide Details' : 'View Details'}
                          {expandedLead === lead.id ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                  {type === 'purchased' && expandedLead === lead.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                              <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                              <p className="text-sm text-gray-900">{lead.email}</p>
                              <p className="text-sm text-gray-900">{lead.phone}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">Address</h4>
                              <p className="mt-1 text-sm text-gray-900">{lead.street}</p>
                              <p className="text-sm text-gray-900">{lead.city}, {lead.zipCode}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                            <p className="mt-1 text-sm text-gray-900">{lead.details || 'No additional details provided'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Lead Status</h4>
                            <select
                              value={lead.leadStatus || ''}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                              <option value="">Select status</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Meeting Scheduled">Meeting Scheduled</option>
                              <option value="Quote Sent">Quote Sent</option>
                              <option value="Closed Won">Closed Won</option>
                              <option value="Closed Lost">Closed Lost</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        isSignUp={false}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        leadId={selectedLeadId || ''}
      />
    </>
  );
}