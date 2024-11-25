import { useState } from 'react';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

const API_URL = import.meta.env.VITE_API_URL;

const ComplianceReportGenerator = () => {
  const [formData, setFormData] = useState({
    device_name: '',
    manufacturer: '',
    model_number: '',
    classification: '',
    intended_use: '',
    target_population: '',
    technical_description: '',
    materials: ''
  });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate report');
      }

      const data = await response.json();
      setReport(data);
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

  const renderSection = (title, content) => {
    if (typeof content === 'string') {
      return <p className="text-gray-600">{content}</p>;
    }
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {content.map((item, idx) => (
            <li key={idx} className="text-gray-600">{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof content === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="ml-4">
              <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">
                {key.replace(/_/g, ' ')}
              </h4>
              {renderSection('', value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">EU MDR Compliance Report Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Name
              </label>
              <input
                type="text"
                name="device_name"
                value={formData.device_name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                required
                placeholder="GlucoTrack Pro X1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                required
                placeholder="MediTech Solutions GmbH"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                name="model_number"
                value={formData.model_number}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                required
                placeholder="GTX1-2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classification
              </label>
              <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                required
              >
                <option value="">Select Classification</option>
                <option value="Class I">Class I</option>
                <option value="Class IIa">Class IIa</option>
                <option value="Class IIb">Class IIb</option>
                <option value="Class III">Class III</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-black bg-white">
                Intended Use
              </label>
              <textarea
                name="intended_use"
                value={formData.intended_use}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows="3"
                required
                placeholder="Continuous monitoring of blood glucose levels in diabetic patients through a minimally invasive subcutaneous sensor. Provides real-time glucose readings and trending data to help patients manage their diabetes."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ">
                Target Population
              </label>
              <textarea
                name="target_population"
                value={formData.target_population}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                rows="2"
                required
                placeholder="Adult patients (18+ years) with Type 1 or Type 2 diabetes requiring regular blood glucose monitoring. Not intended for use in pregnant women or patients with severe kidney disease."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Description
              </label>
              <textarea
                name="technical_description"
                value={formData.technical_description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                rows="3"
                required
                placeholder="Wearable device consisting of a subcutaneous sensor and transmitter unit. Uses enzymatic glucose oxidase technology with electrochemical detection. Features Bluetooth connectivity, 7-day sensor life, waterproof design (IP67), and continuous data transmission to smartphone app."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materials
              </label>
              <textarea
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black bg-white"
                rows="2"
                required
                placeholder="Medical-grade silicone housing, platinum electrode sensors, hydrogel adhesive patch, biocompatible polymer membrane, lithium-ion battery, surgical steel insertion needle (disposable)."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
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
          </form>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Report Section */}
        <div className="h-full">
          {report ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6 sticky top-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">EU MDR Compliance Report</h2>
                <span className="text-sm text-gray-500">
                  Generated: {new Date().toLocaleString()}
                </span>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-200px)] space-y-6 pr-2">
                {Object.entries(report).map(([section, content]) => (
                  <div key={section} className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 capitalize sticky top-0 bg-white py-2">
                      {section.replace(/_/g, ' ')}
                    </h3>
                    {renderSection('', content)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Report Generated</p>
                <p className="text-sm">Fill out the form and click generate to create a compliance report</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceReportGenerator;