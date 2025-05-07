import React from 'react';

interface CustomerInfoFormProps {
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    location: string;
    date: string;
  };
  setCustomerInfo: React.Dispatch<React.SetStateAction<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    location: string;
    date: string;
  }>>;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ customerInfo, setCustomerInfo }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="px-4 py-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Customer Information</h3>
        <p className="text-sm text-blue-600 mb-4">
          Enter the customer details for this inspection report.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name*
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customerInfo.customerName}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Customer Email */}
          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={customerInfo.customerEmail}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Customer Phone */}
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={customerInfo.customerPhone}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location*
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={customerInfo.location}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Date*
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={customerInfo.date}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Example hint */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Inspection Guidelines</h4>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>Ensure customer name and location are accurately recorded</li>
          <li>Use international format for phone numbers (+1 234 567 8900)</li>
          <li>The inspection date should be the actual date when the inspection was performed</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerInfoForm;