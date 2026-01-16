import React, { useState, useEffect } from 'react';
import './MasterForm.css';
import { SelectField } from './index';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface MasterFormProps {
  fields: FormField[];
  onSubmit?: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  submitLabel?: string;
}

const MasterForm: React.FC<MasterFormProps> = ({
  fields,
  onSubmit,
  initialData,
  submitLabel = 'Submit'
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              {field.label} {field.required && <span className="text-[#FF0000]">*</span>}
            </label>
            {field.type === 'select' ? (
              <SelectField
                name={field.name}
                value={String(formData[field.name] || '')}
                onChange={(v) => handleChange({ target: { name: field.name, value: v } } as any)}
                options={(field.options || []).map(o => ({ value: o.value, label: o.label }))}
                placeholder={field.placeholder || 'Search or select option'}
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                required={field.required}
              />
            )}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="rounded-lg btn-primary px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MasterForm;