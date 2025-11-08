import React, { useState } from 'react';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import { Upload } from 'lucide-react';

interface CreateProps {
  inline?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Record<string, any>;
  onClose?: () => void;
  onSave?: (data: Record<string, any>) => void;
}

const Create: React.FC<CreateProps> = ({
  inline = false,
  mode = 'create',
  initialData,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    brandName: '',
    source: '',
    subSource: '',
    productName: '',
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className={inline ? 'w-full' : 'p-6'}>
      <MasterCreateHeader
        title={''}
        onClose={onClose}
      />
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Name <span className="text-[#FF0000]">*</span>
              </label>
              <select
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="">Please Select Brand Name</option>
                <option value="brand1">Brand 1</option>
                <option value="brand2">Brand 2</option>
              </select>
              {/* helper removed as requested */}
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Source <span className="text-[#FF0000]">*</span>
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="">Please Select Source</option>
                <option value="News Paper">News Paper</option>
                <option value="Social Media">Social Media</option>
              </select>
            </div>

            {/* Sub Source */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Sub Source <span className="text-[#FF0000]">*</span>
              </label>
              <input
                type="text"
                name="subSource"
                value={formData.subSource}
                onChange={handleChange}
                placeholder="Enter Product Name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name <span className="text-[#FF0000]">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter Product Name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Upload Image
              </label>
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Supported format: JPEG, PNG, SVG
                    </span>
                  </label>
                </div>

                {/* Button placed outside the dashed box as requested */}
                <div className="mt-4">
                  <label
                    htmlFor="image-upload"
                    className="block w-full text-center btn-primary text-white py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    UPLOAD IMAGE
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 btn-primary text-white rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;