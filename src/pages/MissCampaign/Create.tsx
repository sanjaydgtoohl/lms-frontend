import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import { Upload, Loader, Trash2 } from 'lucide-react';
import { SelectField } from '../../components/ui';
import { apiClient } from '../../utils/apiClient';
import { createMissCampaign } from '../../services/Create';
import { updateMissCampaign } from '../../services/View';
import { listBrands } from '../../services/BrandMaster';
// Removed LeadSource import as per request
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
    image_url: '', // for preview
    remove_image: false, // for delete flag
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
  const [imagePreview, setImagePreview] = useState<string>(''); // for newly selected image preview
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  const openImageModal = (url: string) => {
    setModalImageUrl(url);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setModalImageUrl(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeImageModal();
    };
    if (imageModalOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imageModalOpen]);

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
        // API call for lead sources
          const response = await apiClient.get('/lead-sources');
          const data = Array.isArray(response.data) ? response.data : [];
          const options = data.map((source: { id: string; name: string }) => ({
            id: source.id,
            source: source.name,
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

    // Clear image preview when mode changes
    setImagePreview('');
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
        // API call for sub sources by source id
        const response = await apiClient.get(`/lead-sub-sources/by-source/${formData.source}`);
        const data = Array.isArray(response.data) ? response.data : [];
        const options = data.map((subSource: { id: string; name: string }) => ({
          id: subSource.id,
          label: subSource.name,
        }));
        setSubSourceOptions(options);
      } catch (err) {
        console.error('Failed to fetch lead sub-sources:', err);
        setSubSourceOptions([]);
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
        image_url: initialData.image_url || initialData.image_path || '',
        remove_image: false,
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
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file,
        image_url: '', // clear preview if uploading new
        remove_image: false,
      }));

      // Create a preview URL using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      remove_image: formData.remove_image,
    };
    // Only include image if a new file is selected
    if (formData.image) {
      payload.image_path = formData.image;
    }

    try {
      let result: any;
      if (mode === 'edit' && initialData && (initialData.id || initialData.uuid)) {
        const id = String(initialData.id ?? initialData.uuid);
        result = await updateMissCampaign(id, payload);
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

            {/* Image Upload & Preview */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {(formData.image_url && !formData.remove_image) || imagePreview ? 'Uploaded Image' : 'Upload Image'}
              </label>
              <div>
                {/* Uploaded image card (existing image_url preview) */}
                {formData.image_url && !formData.remove_image && !imagePreview && (
                  <div className="flex flex-col items-start mb-4">
                    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white flex flex-col items-center w-full max-w-md">
                      <div className="flex items-center justify-center w-full mb-4" style={{ height: 200 }}>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', cursor: 'pointer' }}
                          onClick={() => openImageModal(formData.image_url)}
                          title="Click to view full image"
                        />
                      </div>
                      <div className="w-full border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-1">File Name</p>
                            <p className="text-sm text-gray-900 font-semibold truncate">{formData.image?.name || initialData?.image_path?.split('/').pop() || 'image.jpg'}</p>
                          </div>
                          <div
                            className="flex-shrink-0 cursor-pointer"
                            title="Delete"
                            onClick={() => setFormData(prev => ({ ...prev, image_url: '', remove_image: true, image: null }))}
                          >
                              <Trash2 className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                        {initialData?.image_path && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">Path</p>
                            <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded border border-gray-100">{initialData.image_path}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Newly uploaded image preview */}
                {imagePreview && (
                  <div className="flex flex-col items-start mb-4">
                    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white flex flex-col items-center w-full max-w-md">
                      <div className="flex items-center justify-center w-full mb-4" style={{ height: 200 }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', cursor: 'pointer' }}
                          onClick={() => openImageModal(imagePreview)}
                          title="Click to view full image"
                        />
                      </div>
                      <div className="w-full border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium mb-1">File Name</p>
                            <p className="text-sm text-gray-900 font-semibold truncate">{formData.image?.name || 'image.jpg'}</p>
                          </div>
                          <div
                            className="flex-shrink-0 cursor-pointer"
                            title="Delete"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, image: null }));
                              setImagePreview('');
                            }}
                          >
                              <Trash2 className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload UI if no preview */}
                {!imagePreview && (!formData.image_url || formData.remove_image) && (
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
              {saving ? (mode === 'edit' ? 'Updating...' : 'Saving...') : (mode === 'edit' ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>

      {/* Image modal (soft alert) */}
      {imageModalOpen && modalImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeImageModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-lg p-4 max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImageUrl}
              alt="Full preview"
              className="max-w-[84vw] max-h-[84vh] object-contain"
            />
            <div
              role="button"
              tabIndex={0}
              aria-label="Close"
              onClick={closeImageModal}
              onKeyDown={(e) => { if (e.key === 'Enter') closeImageModal(); }}
              className="absolute top-3 right-3 bg-white/95 hover:bg-white rounded-full p-1 border z-50 cursor-pointer flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;