import React, { useState, useMemo, useEffect } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useMap 
} from '@vis.gl/react-google-maps';
import { Listing } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { formatUploadTimeAgo } from '../utils/timeAgo';
import { 
  MapPin, 
  Navigation, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Compass,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ProduceMapProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  className?: string;
  defaultZoom?: number;
  center?: { lat: number; lng: number };
  interactive?: boolean;
}

// Center of Nigeria (Abuja / Regional Agro Axis)
const DEFAULT_CENTER = { lat: 8.9000, lng: 7.2000 };

const REGIONS = [
  { name: 'All Nigeria', center: { lat: 8.9000, lng: 7.2000 }, zoom: 6 },
  { name: 'Oyo / Ibadan', center: { lat: 7.3775, lng: 3.9470 }, zoom: 10 },
  { name: 'Kano Grain Silos', center: { lat: 12.0022, lng: 8.5920 }, zoom: 10 },
  { name: 'Benue Food Basket', center: { lat: 7.5167, lng: 9.3000 }, zoom: 9 },
  { name: 'Jos Highlands', center: { lat: 9.8965, lng: 8.8583 }, zoom: 10 },
  { name: 'Lagos & Ogun Hubs', center: { lat: 6.6018, lng: 3.3958 }, zoom: 10 },
];

function MapController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
}

/**
 * Coordinate mapping to percentage positions on Nigeria map bounds
 * Lat: 4.2N to 13.9N (~9.7 deg range)
 * Lng: 2.7E to 14.7E (~12.0 deg range)
 */
function getCanvasCoords(lat: number, lng: number): { x: number; y: number } {
  const minLat = 4.0;
  const maxLat = 14.0;
  const minLng = 2.5;
  const maxLng = 14.8;

  const xPercent = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
  // Invert Y because latitude goes north (up) while SVG/DOM Y goes down
  const yPercent = Math.max(5, Math.min(95, (1 - (lat - minLat) / (maxLat - minLat)) * 100));

  return { x: xPercent, y: yPercent };
}

export const ProduceMap: React.FC<ProduceMapProps> = ({
  listings,
  onSelectListing,
  className = 'h-[420px] w-full',
  defaultZoom = 6,
  center = DEFAULT_CENTER,
  interactive = true,
}) => {
  const { currency, filters, setFilters } = useMarketplace();
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [hasMapError, setHasMapError] = useState(false);
  const [svgZoom, setSvgZoom] = useState(1);

  // Check for valid Google Maps API Key
  const rawApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = Boolean(rawApiKey && rawApiKey.trim() !== '' && rawApiKey !== 'YOUR_API_KEY');

  // Intercept global Google Maps auth/project errors so they don't break the UI
  useEffect(() => {
    const handleGmAuthFailure = () => {
      setHasMapError(true);
    };
    (window as any).gm_authFailure = handleGmAuthFailure;
    return () => {
      if ((window as any).gm_authFailure === handleGmAuthFailure) {
        delete (window as any).gm_authFailure;
      }
    };
  }, []);

  // Filter listings with coordinates
  const mappedListings = useMemo(() => {
    return listings.filter(l => l.coordinates && l.coordinates.lat && l.coordinates.lng);
  }, [listings]);

  const handleRegionClick = (region: typeof REGIONS[0]) => {
    setMapCenter(region.center);
    setMapZoom(region.zoom);
    if (region.name === 'All Nigeria') {
      setFilters(prev => ({ ...prev, location: '' }));
      setSvgZoom(1);
    } else {
      setFilters(prev => ({ ...prev, location: region.name.split(' ')[0] }));
      setSvgZoom(1.4);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Vegetables': return '🍅';
      case 'Tubers & Roots': return '🥔';
      case 'Grains & Cereals': return '🌾';
      case 'Fruits': return '🍌';
      case 'Legumes & Pulses': return '🫘';
      default: return '🌱';
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#E0E5DD] shadow-sm bg-[#243026] flex flex-col ${className}`}>
      
      {/* Map Control Header / Region Filter Pills */}
      <div className="bg-[#2D3A30]/95 backdrop-blur-md px-4 py-3 border-b border-[#3D4D40] z-20 flex flex-wrap items-center justify-between gap-2.5 text-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#4A5D4E] text-[#E5B25D] flex items-center justify-center shadow-2xs border border-[#5B7060]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>Farm Hub Radar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[10px] text-[#A2B8A6] font-bold">
              {mappedListings.length} Active harvest zones pinned
            </p>
          </div>
        </div>

        {/* Region Quick Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
          {REGIONS.map(reg => (
            <button
              key={reg.name}
              onClick={() => handleRegionClick(reg)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all border whitespace-nowrap bg-[#1F2921] text-[#D4E2D4] border-[#3D4D40] hover:bg-[#4A5D4E] hover:text-white"
            >
              {reg.name}
            </button>
          ))}
          
          {hasValidApiKey && !hasMapError && (
            <button
              onClick={() => setMapType(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#4A5D4E] bg-[#1F2921] text-white hover:bg-[#4A5D4E] transition flex items-center gap-1"
              title="Toggle Satellite Imagery"
            >
              <Layers className="w-3 h-3 text-[#E5B25D]" />
              <span>{mapType === 'roadmap' ? 'Satellite' : 'Road'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Body Container */}
      <div className="flex-1 w-full h-full relative min-h-[320px] overflow-hidden bg-[#1E2620]">
        
        {hasValidApiKey && !hasMapError ? (
          /* Google Maps Platform SDK with @vis.gl/react-google-maps */
          <APIProvider apiKey={rawApiKey!}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              mapTypeId={mapType}
              gestureHandling={interactive ? 'greedy' : 'cooperative'}
              disableDefaultUI={!interactive}
              className="w-full h-full"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {mappedListings.map(listing => {
                const isSelected = selectedListing?.id === listing.id;
                return (
                  <AdvancedMarker
                    key={listing.id}
                    position={{ lat: listing.coordinates!.lat, lng: listing.coordinates!.lng }}
                    onClick={() => setSelectedListing(listing)}
                    title={`${listing.title} - ${currency}${listing.price.toLocaleString()}`}
                  >
                    <div className={`cursor-pointer transform transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-10'}`}>
                      <div className="bg-[#2D3A30] text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                        <span className="text-xs">{getCategoryEmoji(listing.category)}</span>
                        <span className="text-[10px] font-extrabold px-1 text-[#E5B25D]">
                          {currency}{listing.price >= 1000 ? `${(listing.price / 1000).toFixed(0)}k` : listing.price}
                        </span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {selectedListing && selectedListing.coordinates && (
                <InfoWindow
                  position={{ lat: selectedListing.coordinates.lat, lng: selectedListing.coordinates.lng }}
                  onCloseClick={() => setSelectedListing(null)}
                  pixelOffset={[0, -28]}
                >
                  <div className="p-1 max-w-[240px] text-[#2D3A30] font-sans">
                    <div className="w-full h-24 rounded-xl overflow-hidden mb-2 relative bg-slate-100">
                      <img 
                        src={selectedListing.imageUrl} 
                        alt={selectedListing.title} 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 right-1 bg-[#2D3A30]/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {selectedListing.quantity}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-xs leading-tight line-clamp-1 mb-0.5">
                      {selectedListing.title}
                    </h5>

                    <p className="text-[11px] font-bold text-[#4A5D4E] mb-1">
                      {selectedListing.farmerName} • <span className="text-[#86A38B]">{selectedListing.location}</span>
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
                      <span className="text-xs font-black text-[#2D3A30]">
                        {currency}{selectedListing.price.toLocaleString()} <span className="text-[9px] font-normal text-slate-500">/{selectedListing.unit}</span>
                      </span>

                      <button
                        onClick={() => {
                          onSelectListing(selectedListing);
                        }}
                        className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Interactive High-Precision Nigerian Agricultural Radar Canvas */
          <div className="relative w-full h-full min-h-[320px] select-none overflow-hidden bg-[#1E2620]">
            
            {/* Topographic & Agro Grid Vector Backdrop */}
            <svg 
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="agro-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4A5D4E" strokeWidth="0.75" />
                  <circle cx="40" cy="40" r="1.5" fill="#86A38B" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#agro-grid)" />
              
              {/* Regional Outline Contour Representation of Nigeria */}
              <path
                d="M 120 180 C 140 100, 260 70, 420 60 C 580 50, 720 120, 760 210 C 800 300, 740 440, 620 480 C 500 520, 360 490, 240 460 C 140 430, 80 280, 120 180 Z"
                fill="#2A372D"
                stroke="#4A5D4E"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="transition-all duration-700"
                style={{ transform: `scale(${svgZoom})`, transformOrigin: 'center' }}
              />
            </svg>

            {/* Geographical Hub Labels */}
            <div className="absolute inset-0 pointer-events-none p-6 text-[10px] font-mono font-bold text-[#86A38B]/60 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span>NIGERIA NORTH HUB (KANO / SOKOTO SILOS)</span>
                <span>CHAD BASIN BELT</span>
              </div>
              <div className="flex justify-between items-center px-12">
                <span>WEST AGRO CORRIDOR (OYO / OGUN)</span>
                <span className="text-[#E5B25D]/50 text-center font-sans font-extrabold text-xs">
                  BENUE FOOD BASKET & JOS HIGHLANDS
                </span>
                <span>EAST GRAIN ROUTE</span>
              </div>
              <div className="flex justify-between items-end">
                <span>GULF OF GUINEA (LAGOS / NIGER DELTA)</span>
                <span>CAMEROON BORDER AXIS</span>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1.5 bg-[#2D3A30] p-1 rounded-xl border border-[#3D4D40] shadow-md">
              <button
                onClick={() => setSvgZoom(prev => Math.min(prev + 0.25, 2.2))}
                className="w-7 h-7 rounded-lg bg-[#1F2921] hover:bg-[#4A5D4E] text-white flex items-center justify-center transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSvgZoom(prev => Math.max(prev - 0.25, 0.8))}
                className="w-7 h-7 rounded-lg bg-[#1F2921] hover:bg-[#4A5D4E] text-white flex items-center justify-center transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setSvgZoom(1); setFilters(prev => ({ ...prev, location: '' })); }}
                className="w-7 h-7 rounded-lg bg-[#1F2921] hover:bg-[#4A5D4E] text-white flex items-center justify-center transition"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Farm Pinned Markers */}
            <div className="absolute inset-0 p-4 transition-transform duration-500" style={{ transform: `scale(${svgZoom})`, transformOrigin: 'center' }}>
              {mappedListings.map(listing => {
                const { x, y } = getCanvasCoords(listing.coordinates!.lat, listing.coordinates!.lng);
                const isSelected = selectedListing?.id === listing.id;

                return (
                  <div
                    key={listing.id}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedListing(listing)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform group hover:scale-125"
                  >
                    {/* Pulsing Agro Beacon Ring */}
                    <div className="absolute -inset-2 rounded-full bg-[#E5B25D]/20 animate-ping opacity-75 pointer-events-none" />

                    {/* Produce Badge */}
                    <div className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 shadow-xl transition-all ${
                      isSelected 
                        ? 'bg-[#E5B25D] text-[#2D3A30] border-white scale-115 ring-4 ring-[#E5B25D]/40' 
                        : 'bg-[#2D3A30] text-white border-[#86A38B] hover:border-[#E5B25D]'
                    }`}>
                      <span className="text-sm">{getCategoryEmoji(listing.category)}</span>
                      <div className="flex flex-col text-left">
                        <span className={`text-[10px] font-black leading-tight ${isSelected ? 'text-[#2D3A30]' : 'text-[#E5B25D]'}`}>
                          {currency}{listing.price >= 1000 ? `${(listing.price / 1000).toFixed(0)}k` : listing.price}
                        </span>
                        <span className={`text-[8px] font-bold leading-none truncate max-w-[70px] ${isSelected ? 'text-[#2D3A30]/80' : 'text-[#A2B8A6]'}`}>
                          {listing.location.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Popup Card when a Produce Pin is Clicked */}
            {selectedListing && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-80 bg-white text-[#2D3A30] p-3.5 rounded-2xl border border-[#E0E5DD] shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-[#E0E5DD]">
                    <img 
                      src={selectedListing.imageUrl} 
                      alt={selectedListing.title} 
                      className="w-full h-full object-cover" 
                    />
                    <span className="absolute bottom-1 right-1 bg-[#2D3A30]/80 text-white text-[8px] font-bold px-1 rounded">
                      {selectedListing.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-[#4A5D4E] bg-[#E8F0E8] px-2 py-0.5 rounded-full uppercase">
                        {selectedListing.category}
                      </span>
                      <button 
                        onClick={() => setSelectedListing(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-700 px-1"
                      >
                        ✕
                      </button>
                    </div>

                    <h5 className="font-extrabold text-xs text-[#2D3A30] truncate mt-1">
                      {selectedListing.title}
                    </h5>

                    <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#86A38B] font-semibold">
                      <Clock className="w-2.5 h-2.5 text-[#E5B25D]" />
                      <span>{formatUploadTimeAgo(selectedListing.createdAt).relativeTime}</span>
                    </div>

                    <p className="text-[10px] text-[#4A5D4E] font-semibold mt-0.5 truncate flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#E5B25D]" />
                      <span>{selectedListing.location}</span>
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                      <span className="text-xs font-black text-[#2D3A30]">
                        {currency}{selectedListing.price.toLocaleString()}
                        <span className="text-[9px] font-normal text-slate-500"> /{selectedListing.unit}</span>
                      </span>

                      <button
                        onClick={() => onSelectListing(selectedListing)}
                        className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg flex items-center gap-1 transition"
                      >
                        <span>View Produce</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Footer Legend & Status */}
      <div className="bg-[#2D3A30] px-4 py-2 border-t border-[#3D4D40] flex flex-wrap items-center justify-between text-[11px] text-[#D4E2D4] font-semibold z-10 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">🍅 Vegetables</span>
          <span className="flex items-center gap-1">🥔 Tubers & Roots</span>
          <span className="flex items-center gap-1">🌾 Grains & Cereals</span>
          <span className="flex items-center gap-1">🫘 Honey Beans</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#A2B8A6]">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Farm GPS Radar Live</span>
          </span>
        </div>
      </div>
    </div>
  );
};
