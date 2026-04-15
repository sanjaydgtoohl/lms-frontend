import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterCreateHeader } from '../../components/ui/MasterCreateHeader';
import { Upload, Loader, Trash2 } from 'lucide-react';
import { SelectField } from '../../components/ui';
import { apiClient } from '../../utils/apiClient';
import { createMissCampaign, updateMissCampaignWithForm } from '../../services/Create';
import { listBrands } from '../../services/BrandMaster';
import { listCountries, listStates, listCities } from '../../services/CreateBrandForm';
import { listAttendees } from '../../services/AllUsers';
import { fetchCurrentUser } from '../../services/Header';
import SweetAlert from '../../utils/SweetAlert';


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
    industry: '',
    assignBy: '',
    assignTo: '',
    productName: '',
    country: '',
    state: '',
    city: '',
    mediaType: '',
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
  const [industryOptions, setIndustryOptions] = useState<{ id: string; name: string }[]>([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{ id: string; name: string }[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState<{ id: string; name: string }[]>([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [cityOptions, setCityOptions] = useState<{ id: string; name: string }[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(''); // for newly selected image preview
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Assign To users dropdown state
  const [assignToOptions, setAssignToOptions] = useState<{ value: string; label: string }[]>([]);
  const [assignToLoading, setAssignToLoading] = useState(false);

  // Current user state
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

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

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustryLoading(true);
        const response = await apiClient.get<any[]>('/industries/list');
        const industries = Array.isArray(response.data) ? response.data : [];
        const options = industries.map((industry) => ({
          id: String(industry.id ?? industry.value ?? industry),
          name: String(industry.name ?? industry.label ?? industry),
        }));
        setIndustryOptions(options);
      } catch (err) {
        console.error('Failed to fetch industries:', err);
        setIndustryOptions([]);
      } finally {
        setIndustryLoading(false);
      }
    };
    fetchIndustries();
  }, []);

  useEffect(() => {
    const fetchAssignToUsers = async () => {
      try {
        setAssignToLoading(true);
        const response = await listAttendees(1, 200);
        const options = (response.data || []).map((user: any) => ({
          value: String(user.id),
          label: String(user.name),
        }));
        setAssignToOptions(options);
      } catch (err) {
        console.error('Failed to fetch assign to users:', err);
        setAssignToOptions([]);
      } finally {
        setAssignToLoading(false);
      }
    };
    fetchAssignToUsers();
  }, []);

  // Fetch current user for assignBy
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await fetchCurrentUser();
        if (user && user.name) {
          setCurrentUser({ id: String(user.id), name: user.name });
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountryLoading(true);
        const response = await listCountries();
        const options = (response || []).map((country) => ({
          id: String(country.id),
          name: country.name,
        }));
        setCountryOptions(options);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setCountryOptions([]);
      } finally {
        setCountryLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!formData.country) {
      setStateOptions([]);
      setCityOptions([]);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
      return;
    }

    const fetchStates = async () => {
      try {
        setStateLoading(true);
        const response = await listStates({ country_id: formData.country });
        const options = (response || []).map((state) => ({
          id: String(state.id),
          name: state.name,
        }));
        setStateOptions(options);
      } catch (err) {
        console.error('Failed to fetch states:', err);
        setStateOptions([]);
      } finally {
        setStateLoading(false);
      }
    };
    fetchStates();
  }, [formData.country]);

  useEffect(() => {
    if (!formData.state) {
      setCityOptions([]);
      setFormData(prev => ({ ...prev, city: '' }));
      return;
    }

    const fetchCities = async () => {
      try {
        setCityLoading(true);
        const response = await listCities({ state_id: formData.state });
        const options = (response || []).map((city) => ({
          id: String(city.id),
          name: city.name,
        }));
        setCityOptions(options);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setCityOptions([]);
      } finally {
        setCityLoading(false);
      }
    };
    fetchCities();
  }, [formData.state]);

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
    const resolveLocationIds = async () => {
      if (mode === 'edit' && initialData) {
        const brandId = initialData.brand_id || initialData.brand?.id || initialData.brandId || initialData.brandName;
        const sourceId = initialData.lead_source_id || initialData.lead_source?.id || initialData.source_id || initialData.source;
        const subSourceId = initialData.lead_sub_source_id || initialData.lead_sub_source?.id || initialData.sub_source_id || initialData.subSource;
        const industryId = initialData.industry?.id || initialData.industry_id || initialData.industry;

        let resolvedIndustryId = industryId;
        if (industryOptions.length > 0 && industryId && typeof industryId === 'string') {
          const found = industryOptions.find(opt => opt.name.toLowerCase() === industryId.toLowerCase() || opt.id === industryId);
          if (found) resolvedIndustryId = found.id;
        }

        const countryId: any = initialData.country?.id || initialData.country_id || initialData.country;
        let stateId: any = initialData.state?.id || initialData.state_id || initialData.state;
        let cityId: any = initialData.city?.id || initialData.city_id || initialData.city;

        const isNumeric = (val: any) => !isNaN(Number(val));

        try {
          // ✅ Resolve State (if name)
          if (countryId && stateId && !isNumeric(stateId)) {
            const states = await listStates({ country_id: countryId });

            const foundState = states?.find(
              (s: any) =>
                String(s.name).toLowerCase() === String(stateId).toLowerCase()
            );

            if (foundState) {
              stateId = String(foundState.id);
            }
          }

          // ✅ Resolve City (if name)
          if (stateId && cityId && !isNumeric(cityId)) {
            const cities = await listCities({ state_id: stateId });

            const foundCity = cities?.find(
              (c: any) =>
                String(c.name).toLowerCase() === String(cityId).toLowerCase()
            );

            if (foundCity) {
              cityId = String(foundCity.id);
            }
          }
        } catch (err) {
          console.error("Location resolve error:", err);
        }

        // ✅ FINAL setFormData (only after resolving IDs)
        const assignToValue = initialData.assign_to_name ?? initialData.current_assign_user_name ?? initialData.assigned_user?.name ?? (initialData.current_assign_user && typeof initialData.current_assign_user === 'object' ? initialData.current_assign_user.name : '') ?? (initialData.assigned_user && typeof initialData.assigned_user === 'object' ? initialData.assigned_user.name : '') ?? initialData.assignTo ?? initialData.assign_to ?? '';

        setFormData(prev => ({
          ...prev,
          brandName: String(brandId ?? prev.brandName ?? ''),
          source: String(sourceId ?? prev.source ?? ''),
          subSource: String(subSourceId ?? prev.subSource ?? ''),
          industry: String(resolvedIndustryId ?? prev.industry ?? ''),
          assignBy: mode === 'edit' ? (initialData.assign_by_name ?? initialData.created_by_user?.name ?? initialData.created_by ?? '') : (currentUser?.name ?? ''),
          assignTo: String(assignToValue ?? prev.assignTo ?? ''),
          productName: String(initialData.name ?? initialData.productName ?? prev.productName ?? ''),
          country: String(countryId ?? prev.country ?? ''),
          state: String(stateId ?? prev.state ?? ''),
          city: String(cityId ?? prev.city ?? ''),
          image: null,
          image_url: initialData.image_url || initialData.image_path || '',
          remove_image: false,
        }));

        // ✅ Sub-source injection (same as your code)
        const nestedSub =
          initialData.lead_sub_source ??
          initialData.sub_source ??
          initialData.subSource;

        if (nestedSub && typeof nestedSub === 'object') {
          const nid = String(
            nestedSub.id ??
            nestedSub.lead_sub_source_id ??
            nestedSub.sub_source_id ??
            ''
          );
          const nlabel = String(
            nestedSub.name ??
            nestedSub.subSource ??
            nestedSub.label ??
            ''
          );

          if (nid && nlabel) {
            setSubSourceOptions(prev => {
              const exists = prev.find(p => String(p.id) === nid);
              if (exists) return prev;
              return [{ id: nid, label: nlabel }, ...prev];
            });
          }
        }
      }
    };

    resolveLocationIds();
  }, [mode, initialData, industryOptions, currentUser]);

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
    if (!formData.industry) next.industry = 'Please select an industry';
    if (!formData.productName || formData.productName.trim() === '') next.productName = 'Please enter product name';
    if (!formData.country) next.country = 'Please select a country';
    if (!formData.state) next.state = 'Please select a state';
    if (!formData.city) next.city = 'Please select a city';
    if (!formData.mediaType) next.mediaType = 'Please select a media type';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setError(null);
    setSaving(true);

    const payload: Record<string, any> = {
      name: formData.productName,
      brand_id: formData.brandName,
      lead_source_id: formData.source,
      lead_sub_source_id: formData.subSource,
      industry_id: formData.industry,
      assign_by: currentUser?.id || '',
      assign_to: formData.assignTo,
      country_id: formData.country,
      state_id: formData.state,
      city_id: formData.city,
      media_type: formData.mediaType,
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
        result = await updateMissCampaignWithForm(id, payload);
        SweetAlert.showUpdateSuccess();
      } else {
        result = await createMissCampaign(payload);
        SweetAlert.showCreateSuccess();
      }

      if (onSave) onSave(result);

      // dispatch a global update so lists can refresh when user returns
      try {
        window.dispatchEvent(new CustomEvent('missCampaigns:update', { detail: { id: (result as any)?.id } }));
      } catch {
        // no need to action
      }

      // For inline mode or if no navigation available, just close
      if (inline || !navigate) {
        if (onClose) onClose();
      } else {
        // Navigate to view page after a short delay to show success message
        setTimeout(() => {
          navigate('/pre-lead/view', { state: { refreshedAt: Date.now() } });
        }, 1800);
      }
    } catch (err: any) {
      console.error('Create/Update failed', err);
      const errorMsg = err?.message || 'Failed to save campaign';
      setError(errorMsg);
      try { SweetAlert.showError(errorMsg); } catch {
        // no need to action
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={inline ? 'w-full' : 'p-0'}>
      <MasterCreateHeader
        title=""
        onClose={onClose ? onClose : () => navigate(-1)}
      />
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            {/* Brand Name */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                Brand Name <span className="text-[#FF0000]">*</span>
              </label>
              <div className='w-full'>
                <SelectField
                  name="brandName"
                  value={formData.brandName}
                  onChange={(v) => { setFormData(prev => ({ ...prev, brandName: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, brandName: '' })); }}
                  options={brandOptions.map(b => ({ value: String(b.id), label: b.name }))}
                  placeholder={brandLoading ? 'Loading brands...' : 'Search or select option'}
                  inputClassName={errors.brandName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
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
            <div className='w-full sm:w-[calc(50%-12px)]'>
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
                  inputClassName={errors.source ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
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
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="flex text-sm font-medium mb-2 items-center gap-2">
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
                  inputClassName={errors.subSource ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
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

            {/* Assign To */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                Assign To
              </label>
              <div>
                <SelectField
                  name="assignTo"
                  value={formData.assignTo}
                  onChange={(v) => { setFormData(prev => ({ ...prev, assignTo: typeof v === 'string' ? v : v[0] ?? '' })); }}
                  options={assignToOptions}
                  placeholder={assignToLoading ? 'Loading users...' : 'Select Assign To'}
                  inputClassName="border-gray-200 focus:ring-blue-500"
                  disabled={assignToLoading}
                />
              </div>
            </div>

            {/* Industry */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                Industry <span className="text-[#FF0000]">*</span>
              </label>
              <div>
                <SelectField
                  name="industry"
                  value={formData.industry}
                  onChange={(v) => { setFormData(prev => ({ ...prev, industry: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, industry: '' })); }}
                  options={industryOptions.map(i => ({ value: String(i.id), label: i.name }))}
                  placeholder={industryLoading ? 'Loading industries...' : 'Search or select industry'}
                  inputClassName={errors.industry ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                  disabled={industryLoading}
                />
              </div>
              {errors.industry && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.industry}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={(e) => { handleChange(e); setErrors(prev => ({ ...prev, productName: '' })); }}
                placeholder="Please Enter Product Name"
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 transition-colors ${errors.productName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
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

            {/* Country */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                Country <span className="text-[#FF0000]">*</span>
              </label>
              <div className='w-full'>
                <SelectField
                  name="country"
                  value={formData.country}
                  onChange={(v) => {
                    const country = typeof v === 'string' ? v : v[0] ?? '';
                    setFormData(prev => ({
                      ...prev,
                      country,
                      state: '',
                      city: ''
                    }));
                    setErrors(prev => ({
                      ...prev,
                      country: '',
                      state: '',
                      city: ''
                    }));
                  }}
                  options={countryOptions.map(c => ({ value: String(c.id), label: c.name }))}
                  placeholder={countryLoading ? 'Loading countries...' : 'Search or select country'}
                  inputClassName={errors.country ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                  disabled={countryLoading}
                />
              </div>
              {errors.country && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.country}
                </div>
              )}
            </div>

            {/* State */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                State <span className="text-[#FF0000]">*</span>
              </label>
              <div className='w-full'>
                <SelectField
                  name="state"
                  value={formData.state}
                  onChange={(v) => {
                    const state = typeof v === 'string' ? v : v[0] ?? '';
                    setFormData(prev => ({
                      ...prev,
                      state,
                      city: ''
                    }));
                    setErrors(prev => ({
                      ...prev,
                      state: '',
                      city: ''
                    }));
                  }}
                  options={stateOptions.map(s => ({ value: String(s.id), label: s.name }))}
                  placeholder={stateLoading ? 'Loading states...' : (formData.country ? 'Search or select state' : 'Select a country first')}
                  inputClassName={errors.state ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                  disabled={stateLoading || !formData.country}
                />
              </div>
              {errors.state && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.state}
                </div>
              )}
            </div>

            {/* City */}
            <div className='w-full sm:w-[calc(50%-12px)]'>
              <label className="block text-sm font-medium mb-2">
                City <span className="text-[#FF0000]">*</span>
              </label>
              <div className='w-full'>
                <SelectField
                  name="city"
                  value={formData.city}
                  onChange={(v) => { setFormData(prev => ({ ...prev, city: typeof v === 'string' ? v : v[0] ?? '' })); setErrors(prev => ({ ...prev, city: '' })); }}
                  options={cityOptions.map(c => ({ value: String(c.id), label: c.name }))}
                  placeholder={cityLoading ? 'Loading cities...' : (formData.state ? 'Search or select city' : 'Select a state first')}
                  inputClassName={errors.city ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'}
                  disabled={cityLoading || !formData.state}
                />
              </div>
              {errors.city && (
                <div className="text-xs text-red-600 mt-1.5 flex items-center gap-1" role="alert">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.city}
                </div>
              )}
            </div>

            {/* Image Upload & Preview */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
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
              className="absolute top-3 right-3 bg-white rounded-full p-1 border z-50 cursor-pointer flex items-center justify-center"
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