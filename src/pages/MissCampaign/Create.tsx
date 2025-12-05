import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import { Upload, Loader } from 'lucide-react';
import { SelectField } from '../../components/ui';
import { createMissCampaign, updateMissCampaignWithForm } from '../../services/Create';
import { listBrands } from '../../services/BrandMaster';
import { listLeadSources, listLeadSubSourcesBySourceId } from '../../services/LeadSource';
import { showSuccess, showError } from '../../utils/notifications';

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brandName: '',
    source: '',
    subSource: '',
    productName: '',
    image: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandOptions, setBrandOptions] = useState<{ id: string; name: string }[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; source: string }[]>([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [subSourceOptions, setSubSourceOptions] = useState<{ id: string; label: string }[]>([]);
  const [subSourceLoading, setSubSourceLoading] = useState(false);

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandLoading(true);
        const response = await listBrands(1, 1000); // fetch all brands (large perPage)
        const options = (response.data || []).map(brand => ({
          id: brand.id,
          name: brand.name,
        }));
        setBrandOptions(options);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setBrandOptions([]);
      } finally {
        setBrandLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch lead sources on component mount
  useEffect(() => {
    const fetchSources = async () => {
      try {
        setSourceLoading(true);
        const response = await listLeadSources(1, 1000); // fetch all sources (large perPage)
        const options = (response.data || []).map(source => ({
          id: source.id,
          source: source.source,
        }));
        setSourceOptions(options);
      } catch (err) {
        console.error('Failed to fetch lead sources:', err);
        setSourceOptions([]);
      } finally {
        setSourceLoading(false);
      }
    };
    fetchSources();
  }, []);

  // Store initial nested sub-source for reference during fetch cycles
  const initialSubSourceRef = useRef<{ id: string; label: string } | null>(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const nestedSub = initialData.lead_sub_source ?? initialData.sub_source ?? initialData.subSource;
      if (nestedSub && typeof nestedSub === 'object') {
        const nid = String(nestedSub.id ?? nestedSub.lead_sub_source_id ?? nestedSub.sub_source_id ?? '');
        const nlabel = String(nestedSub.name ?? nestedSub.subSource ?? nestedSub.label ?? '');
        if (nid && nlabel) {
          initialSubSourceRef.current = { id: nid, label: nlabel };
        }
      }
    }
  }, [mode, initialData]);

  // Fetch lead sub-sources when source selection changes
  useEffect(() => {
    if (!formData.source) {
      setSubSourceOptions([]);
      return;
    }

    const fetchSubSources = async () => {
      try {
        setSubSourceLoading(true);
        const response = await listLeadSubSourcesBySourceId(formData.source, 1, 1000);
        const options = (response.data || []).map(subSource => ({
          id: subSource.id,
          // Some API shapes use `name`, others `subSource` — prefer `name` then fallback
          label: (subSource as any).name ?? (subSource as any).subSource ?? '',
        }));
        
        // Merge with any existing options and inject initial sub-source if available
        setSubSourceOptions(prev => {
          const merged = [...options];
          
          // Ensure initial nested sub-source is always in the list
          if (initialSubSourceRef.current) {
            const { id: initialId, label: initialLabel } = initialSubSourceRef.current;
            if (!merged.find(m => String(m.id) === String(initialId))) {
              merged.unshift({ id: initialId, label: initialLabel });
            }
          }
          
          // Merge with any existing options
          prev.forEach(p => {
            if (!merged.find(m => String(m.id) === String(p.id))) merged.push(p);
          });
          return merged;
        });
      } catch (err) {
        console.error('Failed to fetch lead sub-sources:', err);
        // Still inject initial option even if fetch fails
        if (initialSubSourceRef.current) {
          setSubSourceOptions(prev => {
            const { id: initialId, label: initialLabel } = initialSubSourceRef.current!;
            if (!prev.find(p => String(p.id) === String(initialId))) {
              return [{ id: initialId, label: initialLabel }, ...prev];
            }
            return prev;
          });
        }
      } finally {
        setSubSourceLoading(false);
      }
    };

    fetchSubSources();
  }, [formData.source]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Extract the actual IDs from the raw API response
      const brandId = initialData.brand_id || initialData.brand?.id || initialData.brandId || initialData.brandName;
      const sourceId = initialData.lead_source_id || initialData.lead_source?.id || initialData.source_id || initialData.source;
      const subSourceId = initialData.lead_sub_source_id || initialData.lead_sub_source?.id || initialData.sub_source_id || initialData.subSource;
      
      setFormData(prev => ({
        ...prev,
        brandName: String(brandId ?? prev.brandName ?? ''),
        source: String(sourceId ?? prev.source ?? ''),
        subSource: String(subSourceId ?? prev.subSource ?? ''),
        productName: String(initialData.name ?? initialData.productName ?? prev.productName ?? ''),
        image: null, // image is not prefilled
      }));

      // If API returned a nested `lead_sub_source` object, inject it immediately
      const nestedSub = initialData.lead_sub_source ?? initialData.sub_source ?? initialData.subSource;
      if (nestedSub && typeof nestedSub === 'object') {
        const nid = String(nestedSub.id ?? nestedSub.lead_sub_source_id ?? nestedSub.sub_source_id ?? '');
        const nlabel = String(nestedSub.name ?? nestedSub.subSource ?? nestedSub.label ?? '');
        if (nid && nlabel) {
          // Inject the initial sub-source option
          setSubSourceOptions(prev => {
            const exists = prev.find(p => String(p.id) === nid);
            if (exists) return prev;
            return [{ id: nid, label: nlabel }, ...prev];
          });
        }
      }
    }
  }, [mode, initialData]);

  useEffect(() => {
    // Do not blindly merge raw API `initialData` into form state.
    // The edit-mode normalization above handles mapping IDs (brand/source/subSource)
    // to `formData` correctly. Spreading `initialData` here can overwrite those
    // normalized string IDs with nested objects (e.g. `lead_sub_source` object),
    // causing select inputs to lose their selected label.
    // Intentionally leave this effect empty to avoid clobbering normalized values.
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const next: Record<string, string> = {};
    if (!formData.brandName) next.brandName = 'Please select a brand';
    if (!formData.source) next.source = 'Please select a source';
    if (!formData.subSource) next.subSource = 'Please select a sub source';
    if (!formData.productName || formData.productName.trim() === '') next.productName = 'Please enter product name';
    
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setError(null);
    setSaving(true);

    const payload: Record<string, any> = {
      name: formData.productName,
      productName: formData.productName,
      brand_id: formData.brandName,
      lead_source_id: formData.source,
      lead_sub_source_id: formData.subSource,
      image: formData.image,
    };

    try {
      let result: any;
      if (mode === 'edit' && initialData && (initialData.id || initialData.uuid)) {
        const id = String(initialData.id ?? initialData.uuid);
        result = await updateMissCampaignWithForm(id, payload);
        showSuccess('Miss campaign updated successfully');
      } else {
        result = await createMissCampaign(payload);
        showSuccess('Miss campaign created successfully');
      }

      if (onSave) onSave(result);
      
      // For inline mode or if no navigation available, just close
      if (inline || !navigate) {
        if (onClose) onClose();
      } else {
        // Navigate to view page after a short delay to show success message
        setTimeout(() => {
          navigate('/miss-campaign/view');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Create/Update failed', err);
      const errorMsg = err?.message || 'Failed to save campaign';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={inline ? 'w-full' : 'p-6'}>
      <MasterCreateHeader
        title=""
        onClose={onClose ? onClose : () => navigate(-1)}
      />
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
          <div className="grid grid-cols-2 gap-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Brand Name <span className="text-[#FF0000]">*</span>
              </label>
              <div>
                <SelectField
                  name="brandName"
                  value={formData.brandName}
                  onChange={(v) => { setFormData(prev => ({ ...prev, brandName: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, brandName: '' })); }}
                  options={brandOptions.map(b => ({ value: String(b.id), label: b.name }))}
                  placeholder={brandLoading ? 'Loading brands...' : 'Search or select option'}
                  inputClassName={errors.brandName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  disabled={brandLoading}
                />
              </div>
              {errors.brandName && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.brandName}
                </div>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Source <span className="text-[#FF0000]">*</span>
              </label>
              <div>
                <SelectField
                  name="source"
                  value={formData.source}
                  onChange={(v) => { setFormData(prev => ({ ...prev, source: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, source: '' })); }}
                  options={sourceOptions.map(s => ({ value: String(s.id), label: s.source }))}
                  placeholder={sourceLoading ? 'Loading sources...' : 'Search or select option'}
                  inputClassName={errors.source ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  disabled={sourceLoading}
                />
              </div>
              {errors.source && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.source}
                </div>
              )}
            </div>

            {/* Sub Source (dropdown) */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Sub Source <span className="text-[#FF0000]">*</span>
                {subSourceLoading && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
              </label>
              <div>
                <SelectField
                  name="subSource"
                  value={formData.subSource}
                  onChange={(v) => { setFormData(prev => ({ ...prev, subSource: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, subSource: '' })); }}
                  options={subSourceOptions.map(s => ({ value: String(s.id), label: s.label }))}
                  placeholder={subSourceLoading ? 'Loading sub-sources...' : (formData.source ? 'Search or select option' : 'Select a source first')}
                  inputClassName={errors.subSource ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
                  disabled={subSourceLoading || !formData.source}
                />
              </div>
              {errors.subSource && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.subSource}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, productName: '' })); }}
                placeholder="Please Enter Product Name"
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${
                  errors.productName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                aria-invalid={errors.productName ? 'true' : 'false'}
                aria-describedby={errors.productName ? 'productName-error' : undefined}
              />
              {errors.productName && (
                <div id="productName-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.productName}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Upload Image
              </label>
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center ${saving ? 'pointer-events-none opacity-60' : ''}`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Supported format: JPEG, PNG, SVG
                    </span>
                  </label>
                </div>

                {formData.image && (
                  <div className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{formData.image.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2 btn-primary text-white rounded-lg transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;