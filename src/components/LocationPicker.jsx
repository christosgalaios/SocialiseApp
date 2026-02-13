import { useState, useMemo, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const libraries = ['places'];

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
};

const defaultCenter = {
    lat: 51.5074, // London
    lng: -0.1278,
};

const mapOptions = {
    disableDefaultUI: true,
    clickableIcons: false,
    zoomControl: true,
    styles: [
        {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e9e9e9' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }]
        }
    ]
};

const LocationPicker = ({ value, onChange, apiKey }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey || '',
        libraries: libraries,
    });

    if (!apiKey) {
        return (
            <div className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-secondary/50 text-sm">
                <AlertCircle size={16} />
                <span>Map API Key missing</span>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                <span>Error loading maps</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl p-8 flex items-center justify-center">
                <Loader2 size={24} className="text-primary animate-spin" />
            </div>
        );
    }

    return <MapSearch value={value} onChange={onChange} />;
};

const MapSearch = ({ value, onChange }) => {
    const initialLocation = typeof value === 'object' && value?.address != null
        ? value
        : { address: typeof value === 'string' ? value : '', lat: defaultCenter.lat, lng: defaultCenter.lng };
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);

    const {
        ready,
        value: inputValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {},
        debounce: 300,
        defaultValue: typeof value === 'string' ? value : value?.address || '',
    });

    useEffect(() => {
        const nextAddress = typeof value === 'string' ? value : value?.address ?? '';
        const nextLocation = typeof value === 'object' && value?.address != null
            ? value
            : { address: nextAddress, lat: defaultCenter.lat, lng: defaultCenter.lng };
        setSelectedLocation(nextLocation);
        setValue(nextAddress, false);
    }, [value, setValue]);

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);

            const newLocation = { address, lat, lng };
            setSelectedLocation(newLocation);
            onChange(newLocation); // Pass full object back
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    const center = useMemo(() => ({
        lat: selectedLocation.lat || defaultCenter.lat,
        lng: selectedLocation.lng || defaultCenter.lng
    }), [selectedLocation]);

    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative z-10">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
                <input
                    value={inputValue}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!ready}
                    placeholder="Search location..."
                    className="w-full bg-secondary/5 border border-secondary/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-secondary/30 text-[var(--text)]"
                />

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                    {status === 'OK' && (
                        <motion.ul
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-paper border border-secondary/10 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto z-20"
                        >
                            {data.map(({ place_id, description }) => (
                                <li
                                    key={place_id}
                                    onClick={() => handleSelect(description)}
                                    className="px-4 py-3 hover:bg-secondary/5 cursor-pointer text-sm font-medium text-secondary truncate flex items-center gap-2"
                                >
                                    <MapPin size={14} className="text-secondary/40 flex-shrink-0" />
                                    {description}
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            {/* Map Preview */}
            <div className="h-48 w-full rounded-2xl overflow-hidden border border-secondary/10 relative">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={14}
                    center={center}
                    options={mapOptions}
                    onClick={(e) => {
                        // Optional: Allow clicking map to set location reverse geocoding
                        // For now just console log or simple pin move without address update could be confusing
                        // Keep it simple: Search drives the map.
                    }}
                >
                    <Marker position={center} />
                </GoogleMap>
            </div>
        </div>
    );
};

export default LocationPicker;
