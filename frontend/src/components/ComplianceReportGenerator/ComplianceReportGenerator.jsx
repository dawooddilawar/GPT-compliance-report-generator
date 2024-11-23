import { useState } from 'react';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/UI/alert';

const API_URL = import.meta.env.VITE_API_URL;

const ComplianceReportGenerator = () => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_category: '',
    safety_features: '',
    intended_use: ''
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Transform safety_features string to array
      const payload = {
        ...formData,
        safety_features: formData.safety_features.split(',').map(f => f.trim()).filter(f => f)
      };

      const response = await fetch(`${API_URL}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data);

      // Scroll to the report section
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearForm = () => {
    setFormData({
      device_name: '',
      device_category: '',
      safety_features: '',
      intended_use: ''
    });
    setReport(null);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Medical Device Compliance Report Generator</h1>
        <p className="text-gray-600">Generate compliance report drafts by entering device details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Name
            </label>
            <input
              type="text"
              name="device_name"
              value={formData.device_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., GlucoTrack X1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Category
            </label>
            <input
              type="text"
              name="device_category"
              value={formData.device_category}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., Blood Glucose Monitoring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Safety Features
            </label>
            <input
              type="text"
              name="safety_features"
              value={formData.safety_features}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter features separated by commas, e.g., Auto-shutdown, Data encryption"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Use
            </label>
            <textarea
              name="intended_use"
              value={formData.intended_use}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
              placeholder="Describe the intended use of the device..."
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Report
              </>
            )}
          </button>

          <button
            type="button"
            onClick={clearForm}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Generated Report</h2>
            <span className="text-sm text-gray-500">
              Generated at: {new Date().toLocaleString()}
            </span>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Device Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Device Name</p>
                  <p className="text-gray-900">{report.device_details.device_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900">{report.device_details.device_category}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Safety Features</p>
                  <ul className="list-disc pl-5 text-gray-900">
                    {report.device_details.safety_features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Compliance Summary</h3>
              <p className="text-gray-600">{report.compliance_summary}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Safety Assessment</h3>
              <p className="text-gray-600">{report.safety_assessment}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReportGenerator;