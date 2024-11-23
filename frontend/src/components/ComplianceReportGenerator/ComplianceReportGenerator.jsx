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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">EU MDR Compliance Report Generator</h1>
        <p className="text-gray-600">Generate detailed EU MDR compliance reports by entering device details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Name
            </label>
            <input
              type="text"
              name="device_name"
              value={formData.device_name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
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
              className="w-full p-2 border rounded-md"
              required
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
              className="w-full p-2 border rounded-md"
              required
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
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Classification</option>
              <option value="Class I">Class I</option>
              <option value="Class IIa">Class IIa</option>
              <option value="Class IIb">Class IIb</option>
              <option value="Class III">Class III</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Use
            </label>
            <textarea
              name="intended_use"
              value={formData.intended_use}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Population
            </label>
            <textarea
              name="target_population"
              value={formData.target_population}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical Description
            </label>
            <textarea
              name="technical_description"
              value={formData.technical_description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="3"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materials
            </label>
            <textarea
              name="materials"
              value={formData.materials}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="2"
              required
            />
          </div>
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

      {report && (
        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">EU MDR Compliance Report</h2>
            <span className="text-sm text-gray-500">
              Generated: {new Date().toLocaleString()}
            </span>
          </div>

          {Object.entries(report).map(([section, content]) => (
            <div key={section} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 capitalize border-b pb-2">
                {section.replace(/_/g, ' ')}
              </h3>
              {renderSection('', content)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceReportGenerator;