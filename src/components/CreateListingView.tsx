import React, { useState, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProduceCategory } from '../types';
import { processImageFile, createProducePlaceholder } from '../utils/imageHelper';
import { 
  Upload, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  ArrowLeft,
  Truck,
  Leaf,
  Camera,
  Trash2,
  Database,
  CloudUpload,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';

export const CreateListingView: React.FC = () => {
  const { 
    currentUser, 
    addListing, 
    setActiveTab, 
    currency,
    setSelectedListing,
    showToast,
    isOnline,
    pendingOfflineCount,
    openUpgradeModal,
    openAuthModal
  } = useMarketplace();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('Vegetables');
  const [price, setPrice] = useState<string>('18500');
  const [unit, setUnit] = useState('crate (25kg)');
  const [quantity, setQuantity] = useState('50 crates available');
  const [location, setLocation] = useState(currentUser.location || 'Ibadan / Oyo Agri-Belt, Nigeria');
  const [phone, setPhone] = useState(currentUser.phone || '+2348031234567');
  const [farmingMethod, setFarmingMethod] = useState<'Organic' | 'Conventional' | 'Greenhouse' | 'Hydroponic'>('Organic');
  const [harvestDate, setHarvestDate] = useState('Harvested today');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [minOrder, setMinOrder] = useState('2 crates');
  const [description, setDescription] = useState('');
  
  // Image direct upload state (stored as base64 in Firestore)
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: ProduceCategory[] = [
    'Vegetables',
    'Tubers & Roots',
    'Grains & Cereals',
    'Fruits',
    'Legumes & Pulses',
    'Herbs & Spices',
    'Other',
  ];

  const commonUnits = [
    'crate (25kg)',
    '50kg bag',
    '90kg bag',
    '100kg sack',
    'kg',
    'ton',
    'bunch',
    'basket',
    'piece',
  ];

  const quickTitles = [
    { title: 'Fresh Roma Tomatoes', cat: 'Vegetables' as ProduceCategory, unit: 'crate (25kg)', defaultPrice: '18500', loc: 'Ibadan Farm Hub, Oyo' },
    { title: 'Benue Golden Yams', cat: 'Tubers & Roots' as ProduceCategory, unit: 'set of 20 giant tubers', defaultPrice: '45000', loc: 'Gboko Farm Gate, Benue' },
    { title: 'Dry Yellow Maize', cat: 'Grains & Cereals' as ProduceCategory, unit: '100kg sack', defaultPrice: '52000', loc: 'Dawanau Grain Silos, Kano' },
    { title: 'Sombo Chili Peppers', cat: 'Vegetables' as ProduceCategory, unit: 'crate (15kg)', defaultPrice: '18500', loc: 'Jos Plateau Farmlands' },
    { title: 'Oloyin Honey Beans', cat: 'Legumes & Pulses' as ProduceCategory, unit: '100kg bag', defaultPrice: '68000', loc: 'Bida Agro Hub, Niger' },
    { title: 'Green Plantains', cat: 'Fruits' as ProduceCategory, unit: 'bunch batch (5 giant bunches)', defaultPrice: '28000', loc: 'Ore Agro Interchange, Ondo' },
  ];

  // Helper to approximate Nigerian coordinate for new listings
  const getCoordinatesForLocation = (locStr: string): { lat: number; lng: number } => {
    const l = locStr.toLowerCase();
    if (l.includes('kano') || l.includes('dawanau')) return { lat: 12.0022, lng: 8.5920 };
    if (l.includes('benue') || l.includes('gboko') || l.includes('makurdi')) return { lat: 7.3300, lng: 8.9900 };
    if (l.includes('jos') || l.includes('plateau')) return { lat: 9.8965, lng: 8.8583 };
    if (l.includes('lagos') || l.includes('mile 12') || l.includes('ketu')) return { lat: 6.6018, lng: 3.3958 };
    if (l.includes('ogun') || l.includes('sagamu') || l.includes('abeokuta')) return { lat: 7.1475, lng: 3.3619 };
    if (l.includes('kaduna') || l.includes('zaria')) return { lat: 10.5105, lng: 7.4165 };
    if (l.includes('ondo') || l.includes('ore') || l.includes('akure')) return { lat: 7.2571, lng: 5.2058 };
    if (l.includes('niger') || l.includes('bida') || l.includes('minna')) return { lat: 9.0820, lng: 6.0100 };
    return { lat: 7.3775 + (Math.random() - 0.5) * 0.1, lng: 3.9470 + (Math.random() - 0.5) * 0.1 };
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    try {
      setIsProcessingImage(true);
      const base64 = await processImageFile(file, 900, 900, 0.85);
      setUploadedImageBase64(base64);
      setImageFileName(file.name);
      showToast(`Image "${file.name}" compressed and ready for Firestore upload`);
    } catch (err) {
      console.error(err);
      showToast('Failed to process image. Please try another file.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter a produce title');
      return;
    }

    const numericPrice = parseFloat(price) || 1000;
    const coords = getCoordinatesForLocation(location);

    // If user didn't upload an image, generate a clean self-contained produce graphic
    const finalImage = uploadedImageBase64 || createProducePlaceholder(title, category);

    const newListing = addListing({
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: phone.trim() || currentUser.phone,
      farmerLocation: location.trim(),
      farmName: currentUser.farmName || `${currentUser.name}'s Farm`,
      farmerAvatar: currentUser.avatarUrl,
      farmerRating: currentUser.rating || 5.0,
      title: title.trim(),
      category,
      price: numericPrice,
      unit: unit.trim(),
      quantity: quantity.trim(),
      location: location.trim(),
      coordinates: coords,
      description: description.trim() || `Freshly harvested ${title} sourced directly from our farm in ${location}. High quality produce ready for immediate dispatch and wholesale distribution.`,
      imageUrl: finalImage,
      harvestDate: harvestDate.trim(),
      farmingMethod,
      deliveryAvailable,
      minOrder: minOrder.trim(),
    });

    setSelectedListing(newListing);
    setActiveTab('marketplace');
  };

  if (currentUser.role === 'buyer') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#2D3A30]">
        <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-[#E0E5DD] shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#E8F0E8] text-[#4A5D4E] flex items-center justify-center mx-auto shadow-xs border border-[#D4E2D4]">
            <Leaf className="w-8 h-8 text-[#4A5D4E]" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider bg-[#FAF5ED] text-[#D97706] px-3 py-1 rounded-full border border-[#E5B25D]/50">
              🛒 Buyer Account Active
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D3A30]">
              Farmer Account Required to List Produce
            </h2>
            <p className="text-sm text-[#86A38B] leading-relaxed">
              You are currently signed in as a buyer (<strong>{currentUser.name}</strong>). To list fresh farm produce, set your wholesale prices, and upload crop photos, please upgrade your account to a <strong>Farmer Account</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="create-upgrade-to-farmer-btn"
              onClick={openUpgradeModal}
              className="w-full sm:w-auto bg-[#4A5D4E] hover:bg-[#3d4d40] text-white font-black px-7 py-3.5 rounded-full shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Leaf className="w-4 h-4 text-[#E5B25D]" />
              <span>Upgrade to Farmer Account</span>
            </button>

            <button
              onClick={() => openAuthModal('farmer')}
              className="w-full sm:w-auto bg-[#F8F9F5] hover:bg-[#E8F0E8] text-[#4A5D4E] font-bold px-6 py-3.5 rounded-full border border-[#E0E5DD] transition text-sm"
            >
              Register Separate Farmer Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#2D3A30]">
      
      {/* Back Button & Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="back-to-market-btn"
          onClick={() => setActiveTab('marketplace')}
          className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E] hover:text-[#2D3A30] bg-white hover:bg-[#F8F9F5] px-4 py-2 rounded-full border border-[#E0E5DD] shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </button>

        {isOnline ? (
          <span className="text-xs font-bold text-[#4A5D4E] bg-[#E8F0E8] px-3.5 py-1.5 rounded-full border border-[#D4E2D4] flex items-center gap-1.5 shadow-2xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Online • Direct Cloud Sync</span>
          </span>
        ) : (
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-2xs">
            <WifiOff className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Low Network Mode • Auto-Sync on Connect</span>
          </span>
        )}
      </div>

      <div className="bg-white rounded-[32px] border border-[#E0E5DD] shadow-sm overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-[#4A5D4E] text-white p-6 sm:p-8 border-b border-[#E0E5DD]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E5B25D]">
              <Leaf className="w-6 h-6 text-[#E5B25D]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Post a Produce Listing
              </h1>
              <p className="text-sm text-[#D4E2D4] mt-1 font-medium">
                Upload your product photo directly to Firestore and publish your harvest to buyers across Nigeria.
              </p>
            </div>
          </div>
        </div>

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Quick Suggestions Chips */}
          <div className="bg-[#F8F9F5] p-5 rounded-2xl border border-[#E0E5DD]">
            <span className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider block mb-2.5">
              💡 Fast Templates (Click to Auto-Fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTitles.map(item => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => {
                    setTitle(item.title);
                    setCategory(item.cat);
                    setUnit(item.unit);
                    setPrice(item.defaultPrice);
                    setLocation(item.loc);
                  }}
                  className="bg-white hover:bg-[#E8F0E8] text-[#2D3A30] text-xs font-bold px-3 py-1.5 rounded-full border border-[#E0E5DD] transition shadow-2xs"
                >
                  + {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Crop Image Direct Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Upload Produce Photo</span>
              </h3>
              <span className="text-[11px] font-bold text-[#86A38B] flex items-center gap-1">
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Stored directly in Firestore</span>
              </span>
            </div>

            {/* Hidden Input File */}
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {uploadedImageBase64 ? (
              /* Uploaded Image Preview Box */
              <div className="relative rounded-2xl border-2 border-[#4A5D4E] p-4 bg-[#F8F9F5] flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-white border border-[#E0E5DD] shadow-xs relative">
                  <img 
                    src={uploadedImageBase64} 
                    alt="Produce upload preview" 
                    className="w-full h-full object-cover" 
                  />
                  <span className="absolute bottom-1 right-1 bg-[#2D3A30]/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Ready to Save
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-[#4A5D4E]">
                    <Check className="w-4 h-4 text-[#4A5D4E]" />
                    <span>Photo Uploaded & Compressed</span>
                  </div>
                  <p className="text-xs text-[#86A38B] font-mono truncate max-w-xs">
                    {imageFileName || 'produce-photo.jpg'}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white hover:bg-[#E8F0E8] text-[#2D3A30] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#E0E5DD] transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <span>Change Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImageBase64(null);
                        setImageFileName(null);
                      }}
                      className="text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-[#4A5D4E] bg-[#E8F0E8] scale-101' 
                    : 'border-[#D4E2D4] bg-[#F8F9F5] hover:bg-[#E8F0E8] hover:border-[#4A5D4E]'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-white text-[#4A5D4E] flex items-center justify-center mx-auto mb-3 shadow-xs border border-[#E0E5DD]">
                  {isProcessingImage ? (
                    <Sparkles className="w-7 h-7 text-[#E5B25D] animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7 text-[#4A5D4E]" />
                  )}
                </div>

                <h4 className="text-sm font-extrabold text-[#2D3A30]">
                  {isProcessingImage ? 'Optimizing Image for Firestore...' : 'Click to Upload Product Photo or Drag & Drop'}
                </h4>
                <p className="text-xs text-[#86A38B] font-medium mt-1">
                  Supports PNG, JPG, WebP from your phone or computer. Image will be stored directly in Firestore.
                </p>

                <div className="mt-4 inline-flex items-center gap-2 bg-white text-[#4A5D4E] text-xs font-bold px-4 py-2 rounded-full border border-[#E0E5DD] shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-[#E5B25D]" />
                  <span>Choose from Device / Take Photo</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Title & Category */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Crop Name & Category</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Produce Title */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Produce Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Fresh Red Roma Tomatoes"
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="create-category-select"
                  value={category}
                  onChange={e => setCategory(e.target.value as ProduceCategory)}
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none cursor-pointer transition"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: Pricing & Stock */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Price, Quantity & Unit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Price per Unit ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#86A38B] font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    id="create-price-input"
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full text-sm font-bold bg-[#F8F9F5] text-[#2D3A30] pl-8 pr-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                    placeholder="18500"
                  />
                </div>
                {price && parseFloat(price) > 0 && (
                  <p className="text-[11px] text-[#86A38B] mt-1.5 font-medium leading-tight">
                    Your payout: <strong className="text-emerald-700">{currency}{parseFloat(price).toLocaleString()}</strong> • Listed price on market: <strong className="text-[#2D3A30]">{currency}{(Math.round(parseFloat(price) * 1.05)).toLocaleString()}</strong>
                  </p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Unit Measurement <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-unit-input"
                  type="text"
                  list="units-list"
                  required
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="e.g. crate (25kg), 50kg bag"
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                />
                <datalist id="units-list">
                  {commonUnits.map(u => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Available Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-quantity-input"
                  type="text"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 45 crates available"
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                />
              </div>

            </div>
          </div>

          {/* Section 4: Location & Farmer Contact */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white text-[11px] flex items-center justify-center font-bold">4</span>
              <span>Location & Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Town / State Hub <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-[#86A38B] absolute left-3.5" />
                  <input
                    id="create-location-input"
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Ibadan Farm Hub, Oyo State"
                    className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Farmer WhatsApp / Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-[#4A5D4E] absolute left-3.5" />
                  <input
                    id="create-phone-input"
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+2348031234567"
                    className="w-full text-sm font-bold bg-[#F8F9F5] text-[#2D3A30] pl-10 pr-4 py-3 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-[#86A38B] font-medium mt-1">
                  Buyers will click to open WhatsApp order chats with this number.
                </p>
              </div>

            </div>
          </div>

          {/* Section 5: Additional Harvest Metadata */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4A5D4E] text-white text-[11px] flex items-center justify-center font-bold">5</span>
              <span>Farming & Logistics Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Farming Method
                </label>
                <select
                  value={farmingMethod}
                  onChange={e => setFarmingMethod(e.target.value as any)}
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:outline-none"
                >
                  <option value="Organic">Organic Farming</option>
                  <option value="Conventional">Conventional Field</option>
                  <option value="Greenhouse">Greenhouse</option>
                  <option value="Hydroponic">Hydroponic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Harvest Timing
                </label>
                <input
                  type="text"
                  value={harvestDate}
                  onChange={e => setHarvestDate(e.target.value)}
                  placeholder="Harvested today"
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                  Minimum Order
                </label>
                <input
                  type="text"
                  value={minOrder}
                  onChange={e => setMinOrder(e.target.value)}
                  placeholder="2 crates"
                  className="w-full text-sm font-semibold bg-[#F8F9F5] text-[#2D3A30] px-4 py-3 rounded-2xl border border-[#E0E5DD] focus:outline-none"
                />
              </div>
            </div>

            {/* Delivery Toggle */}
            <div className="flex items-center gap-3 bg-[#F8F9F5] p-4 rounded-2xl border border-[#E0E5DD]">
              <input
                id="create-delivery-checkbox"
                type="checkbox"
                checked={deliveryAvailable}
                onChange={e => setDeliveryAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <label htmlFor="create-delivery-checkbox" className="text-xs font-bold text-[#2D3A30] cursor-pointer flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#4A5D4E]" />
                <span>Inter-state / Regional Delivery Available by Truck</span>
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#2D3A30] mb-1.5">
                Description / Quality Notes
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Share details on crop freshness, sweetness, grade, packing, or dispatch logistics..."
                className="w-full text-sm font-medium bg-[#F8F9F5] text-[#2D3A30] p-4 rounded-2xl border border-[#E0E5DD] focus:border-[#4A5D4E] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[#E0E5DD] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#86A38B] font-medium">
              {isOnline 
                ? 'Harvest will be published to Firestore and visible immediately across Nigeria.' 
                : 'Offline outbox enabled: Listing will be safely saved locally and will auto-sync the instant you reconnect.'}
            </p>

            <button
              id="submit-produce-listing-btn"
              type="submit"
              disabled={isProcessingImage}
              className="w-full sm:w-auto bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-sm font-extrabold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-98 disabled:opacity-50"
            >
              {isOnline ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#E5B25D]" />
                  <span>Publish Crop to Firestore</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#E5B25D]" />
                  <span>Save Crop Offline (Auto-Sync)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
