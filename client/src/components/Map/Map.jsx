import React, { useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { formatRelative } from 'date-fns';
import { mapStylesDark, mapStylesLight } from './mapStyles';

const mapContainerStyle = {
  width: '100%',
  height: '30vh',
};

const defaultZoom = 3;
const defaultCenter = {
  lat: 37.0902,
  lng: -95.7129,
};

const withTimeout = (promise, timeoutMs, label) => {
  let timeoutId = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });
};

const getFallbackCoordinates = (result) => {
  if (!result || !result.location || !result.location.coordinates) {
    return null;
  }

  const lat = Number.parseFloat(result.location.coordinates.latitude);
  const lng = Number.parseFloat(result.location.coordinates.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const getCityLookupKey = (result) => {
  if (!result || !result.location) {
    return '';
  }

  const city = result.location.city ? result.location.city.trim().toLowerCase() : '';
  const state = result.location.state ? result.location.state.trim().toLowerCase() : '';
  const country = result.location.country ? result.location.country.trim().toLowerCase() : '';

  return [city, state, country].filter(Boolean).join('|');
};

const getCityLookupAddress = (result) => {
  if (!result || !result.location) {
    return '';
  }

  const city = result.location.city ? result.location.city.trim() : '';
  const state = result.location.state ? result.location.state.trim() : '';
  const country = result.location.country ? result.location.country.trim() : '';

  return [city, state, country].filter(Boolean).join(', ');
};

const geocodeAddress = (geocoder, address) => {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
        return;
      }

      reject(new Error(status));
    });
  });
};

const buildEmployeeMarker = (result, coordinates, index = 0) => {
  if (!result || !coordinates) {
    return null;
  }

  const firstName = result.name && result.name.first ? result.name.first : '';
  const lastName = result.name && result.name.last ? result.name.last : '';
  const markerName = `${firstName} ${lastName}`.trim() || 'Employee';

  return {
    id:
      (result.login && result.login.uuid) ||
      (result.id && result.id.value) ||
      `${coordinates.lat}-${coordinates.lng}-${index}`,
    lat: coordinates.lat,
    lng: coordinates.lng,
    time: new Date(),
    picture: result.picture && result.picture.thumbnail ? result.picture.thumbnail : null,
    name: markerName,
    city: result.location && result.location.city ? result.location.city : '',
  };
};

const getPlacePredictionText = (placePrediction) => {
  if (!placePrediction) {
    return '';
  }

  if (typeof placePrediction.text === 'string') {
    return placePrediction.text;
  }

  if (placePrediction.text && typeof placePrediction.text.text === 'string') {
    return placePrediction.text.text;
  }

  if (
    placePrediction.structuredFormat &&
    placePrediction.structuredFormat.mainText &&
    typeof placePrediction.structuredFormat.mainText.text === 'string'
  ) {
    return placePrediction.structuredFormat.mainText.text;
  }

  return '';
};

const getPlacePredictionId = (placePrediction, index) => {
  if (!placePrediction) {
    return `suggestion-${index}`;
  }

  return (
    placePrediction.placeId ||
    placePrediction.id ||
    `${getPlacePredictionText(placePrediction)}-${index}`
  );
};

const escapeHtml = (value) => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const getInitials = (name) => {
  if (!name) {
    return 'EA';
  }

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return 'EA';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const buildAdvancedMarkerContent = (marker) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'map-marker-avatar';

  if (marker.picture) {
    const image = document.createElement('img');
    image.src = marker.picture;
    image.alt = '';
    image.loading = 'lazy';
    image.className = 'map-marker-avatar-image';
    wrapper.appendChild(image);
    return wrapper;
  }

  const fallbackLabel = document.createElement('span');
  fallbackLabel.className = 'map-marker-avatar-fallback';
  fallbackLabel.textContent = getInitials(marker.name);
  wrapper.appendChild(fallbackLabel);
  return wrapper;
};

const EmployeeMap = (props) => {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [isMapsReady, setIsMapsReady] = React.useState(false);
  const [isPlacesReady, setIsPlacesReady] = React.useState(false);
  const [loadError, setLoadError] = React.useState('');
  const [mapDebugStep, setMapDebugStep] = React.useState('idle');
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = useState(null);
  const [searchValue, setSearchValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);

  const mapElementRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerInstancesRef = React.useRef([]);
  const geocoderRef = React.useRef(null);
  const infoWindowRef = React.useRef(null);
  const placesLibraryRef = React.useRef(null);
  const cityCoordinatesCacheRef = React.useRef(new globalThis.Map());
  const markerRequestIdRef = React.useRef(0);
  const searchDebounceRef = React.useRef(null);
  const searchWrapperRef = React.useRef(null);

  const mapOptions = React.useMemo(
    () => ({
      styles: props.theme === 'dark' ? mapStylesDark : mapStylesLight,
      disableDefaultUI: true,
      zoomControl: true,
    }),
    [props.theme]
  );

  const fitMapToMarkers = React.useCallback((employeeMarkers) => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    if (!employeeMarkers.length) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
      return;
    }

    if (employeeMarkers.length === 1) {
      mapRef.current.panTo({
        lat: employeeMarkers[0].lat,
        lng: employeeMarkers[0].lng,
      });
      mapRef.current.setZoom(10);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    employeeMarkers.forEach((marker) => {
      bounds.extend({ lat: marker.lat, lng: marker.lng });
    });
    mapRef.current.fitBounds(bounds);
  }, []);

  const resolveCoordinatesForResult = React.useCallback(async (result) => {
    const fallbackCoordinates = getFallbackCoordinates(result);
    const cityKey = getCityLookupKey(result);

    if (cityKey && cityCoordinatesCacheRef.current.has(cityKey)) {
      return cityCoordinatesCacheRef.current.get(cityKey);
    }

    if (!window.google || !window.google.maps || !geocoderRef.current) {
      return fallbackCoordinates;
    }

    if (!cityKey) {
      return fallbackCoordinates;
    }

    const cityAddress = getCityLookupAddress(result);
    if (!cityAddress) {
      return fallbackCoordinates;
    }

    try {
      const coordinates = await geocodeAddress(geocoderRef.current, cityAddress);
      cityCoordinatesCacheRef.current.set(cityKey, coordinates);
      return coordinates;
    } catch (_error) {
      if (fallbackCoordinates) {
        cityCoordinatesCacheRef.current.set(cityKey, fallbackCoordinates);
      }
      return fallbackCoordinates;
    }
  }, []);

  const getEmployeeMarkers = React.useCallback(
    async (employees) => {
      const requestId = markerRequestIdRef.current + 1;
      markerRequestIdRef.current = requestId;

      const employeeMarkers = [];
      const list = employees || [];

      for (let index = 0; index < list.length; index += 1) {
        const result = list[index];
        const coordinates = await resolveCoordinatesForResult(result);
        const marker = buildEmployeeMarker(result, coordinates, index);

        if (marker) {
          employeeMarkers.push(marker);
        }
      }

      if (requestId !== markerRequestIdRef.current) {
        return;
      }

      setMarkers(employeeMarkers);
      setSelected(null);
      fitMapToMarkers(employeeMarkers);
    },
    [fitMapToMarkers, resolveCoordinatesForResult]
  );

  const clearRenderedMarkers = React.useCallback(() => {
    markerInstancesRef.current.forEach((marker) => {
      if (typeof marker.setMap === 'function') {
        marker.setMap(null);
        return;
      }

      marker.map = null;
    });
    markerInstancesRef.current = [];
  }, []);

  React.useEffect(() => {
    if (!mapsApiKey) {
      setLoadError('Add VITE_GOOGLE_MAPS_API_KEY in .env to load the map.');
      setMapDebugStep('missing-api-key');
      return;
    }

    let isMounted = true;
    const previousAuthFailure = window.gm_authFailure;
    setMapDebugStep('starting-loader');

    window.gm_authFailure = () => {
      setLoadError(
        'Google Maps authentication failed. Check API key, billing, and allowed referrers (localhost + deployed domain).'
      );
      setMapDebugStep('auth-failed');
    };

    const initializeMap = async () => {
      try {
        console.info('[Map] init start');
        const loader = new Loader({
          apiKey: mapsApiKey,
          version: 'weekly',
          libraries: ['places'],
        });

        setMapDebugStep('loading-google-script');
        await withTimeout(loader.load(), 12000, 'Google Maps script load');
        console.info('[Map] script loaded');

        if (!isMounted || !mapElementRef.current || !window.google || !window.google.maps) {
          console.warn('[Map] prerequisites missing after script load', {
            isMounted,
            hasElement: Boolean(mapElementRef.current),
            hasGoogle: Boolean(window.google),
            hasMaps: Boolean(window.google && window.google.maps),
          });
          setMapDebugStep('prereq-missing');
          return;
        }

        setMapDebugStep('creating-services');
        geocoderRef.current = new window.google.maps.Geocoder();
        infoWindowRef.current = new window.google.maps.InfoWindow();

        setMapDebugStep('loading-marker-library');
        try {
          await withTimeout(
            window.google.maps.importLibrary('marker'),
            10000,
            'Marker library import'
          );
        } catch (markerError) {
          console.warn('[Map] marker library import failed, using legacy markers:', markerError);
        }

        setMapDebugStep('creating-map-instance');
        mapRef.current = new window.google.maps.Map(mapElementRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
        });

        setLoadError('');
        setMapDebugStep('map-ready');
        setIsMapsReady(true);
        console.info('[Map] map ready');

        // Do not block map render on places import; search suggestions are optional.
        setMapDebugStep('loading-places-library');
        try {
          placesLibraryRef.current = await withTimeout(
            window.google.maps.importLibrary('places'),
            10000,
            'Places library import'
          );
          setIsPlacesReady(true);
          setMapDebugStep('ready');
          console.info('[Map] places imported');
        } catch (placesError) {
          console.warn('[Map] places import failed, continuing without suggestions:', placesError);
          setIsPlacesReady(false);
          setMapDebugStep('ready-no-places');
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown Maps load error';
          setLoadError(`Error loading Maps: ${errorMessage}`);
          setMapDebugStep('error');
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      clearRenderedMarkers();
      if (previousAuthFailure) {
        window.gm_authFailure = previousAuthFailure;
      } else {
        delete window.gm_authFailure;
      }
    };
  }, [clearRenderedMarkers, mapsApiKey]);

  React.useEffect(() => {
    if (!isMapsReady || !mapRef.current) {
      return;
    }

    mapRef.current.setOptions(mapOptions);
  }, [isMapsReady, mapOptions]);

  React.useEffect(() => {
    if (!isMapsReady || !window.google || !window.google.maps || !mapRef.current) {
      return;
    }

    clearRenderedMarkers();
    const mapId = mapRef.current.get('mapId');
    const canUseAdvancedMarkers = Boolean(
      mapId &&
      window.google.maps.marker &&
      window.google.maps.marker.AdvancedMarkerElement
    );

    markers.forEach((marker) => {
      if (canUseAdvancedMarkers) {
        const mapMarker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.name,
          content: buildAdvancedMarkerContent(marker),
        });

        if (typeof mapMarker.addListener === 'function') {
          mapMarker.addListener('gmp-click', () => {
            setSelected(marker);
          });
        } else if (typeof mapMarker.addEventListener === 'function') {
          mapMarker.addEventListener('gmp-click', () => {
            setSelected(marker);
          });
        }

        markerInstancesRef.current.push(mapMarker);
        return;
      }

      const markerOptions = {
        map: mapRef.current,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.name,
      };

      if (marker.picture) {
        markerOptions.icon = {
          url: marker.picture,
          scaledSize: new window.google.maps.Size(34, 34),
          anchor: new window.google.maps.Point(17, 17),
        };
      }

      const mapMarker = new window.google.maps.Marker(markerOptions);
      mapMarker.addListener('click', () => {
        setSelected(marker);
      });

      markerInstancesRef.current.push(mapMarker);
    });
  }, [clearRenderedMarkers, isMapsReady, markers]);

  React.useEffect(() => {
    if (!isMapsReady || !infoWindowRef.current || !mapRef.current) {
      return;
    }

    if (!selected) {
      infoWindowRef.current.close();
      return;
    }

    const cityMarkup = selected.city
      ? `<p class="m-0">${escapeHtml(selected.city)}</p>`
      : '';

    const content = `
      <div class="map-info-window">
        <p class="m-0"><strong>${escapeHtml(selected.name)}</strong></p>
        ${cityMarkup}
        <p class="m-0">Spotted ${escapeHtml(formatRelative(selected.time, new Date()))}</p>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.setPosition({ lat: selected.lat, lng: selected.lng });
    infoWindowRef.current.open({ map: mapRef.current });
  }, [isMapsReady, selected]);

  React.useEffect(() => {
    if (!isMapsReady || !infoWindowRef.current) {
      return;
    }

    const listener = infoWindowRef.current.addListener('closeclick', () => {
      setSelected(null);
    });

    return () => {
      listener.remove();
    };
  }, [isMapsReady]);

  React.useEffect(() => {
    if (!isMapsReady) {
      return;
    }

    getEmployeeMarkers(props.results);
  }, [getEmployeeMarkers, isMapsReady, props.results]);

  React.useEffect(() => {
    if (!isMapsReady) {
      return;
    }

    if (!props.selectedResult || !Object.keys(props.selectedResult).length) {
      return;
    }

    let isSubscribed = true;

    const setSelectedMarker = async () => {
      const coordinates = await resolveCoordinatesForResult(props.selectedResult);
      const selectedMarker = buildEmployeeMarker(props.selectedResult, coordinates);

      if (!isSubscribed || !selectedMarker) {
        return;
      }

      setSelected(selectedMarker);

      if (mapRef.current) {
        mapRef.current.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lng });
        mapRef.current.setZoom(10);
      }
    };

    setSelectedMarker();

    return () => {
      isSubscribed = false;
    };
  }, [isMapsReady, props.selectedResult, resolveCoordinatesForResult]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchWrapperRef.current &&
        event.target instanceof Node &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(10);
  }, []);

  const fetchAutocompleteSuggestions = React.useCallback(async (input) => {
    const placesLibrary = placesLibraryRef.current;

    if (!placesLibrary || !placesLibrary.AutocompleteSuggestion || !input.trim()) {
      setSuggestions([]);
      return;
    }

    const request = {
      input: input.trim(),
      includedRegionCodes: ['us'],
    };

    const mapCenter = mapRef.current && mapRef.current.getCenter ? mapRef.current.getCenter() : null;
    if (mapCenter) {
      request.origin = mapCenter;
    }

    try {
      const response = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      const nextSuggestions = (response.suggestions || [])
        .map((suggestion, index) => {
          const placePrediction = suggestion.placePrediction || suggestion;
          const text = getPlacePredictionText(placePrediction);

          if (!text) {
            return null;
          }

          return {
            id: getPlacePredictionId(placePrediction, index),
            text,
            placePrediction,
          };
        })
        .filter(Boolean);

      setSuggestions(nextSuggestions);
    } catch (error) {
      console.error(error);
      setSuggestions([]);
    }
  }, []);

  const handleSuggestionSelect = React.useCallback(
    async (suggestion) => {
      if (!suggestion) {
        return;
      }

      setSearchValue(suggestion.text);
      setSuggestions([]);

      try {
        if (
          suggestion.placePrediction &&
          typeof suggestion.placePrediction.toPlace === 'function'
        ) {
          const place = suggestion.placePrediction.toPlace();
          if (place && typeof place.fetchFields === 'function') {
            await place.fetchFields({ fields: ['location'] });
            if (
              place.location &&
              typeof place.location.lat === 'function' &&
              typeof place.location.lng === 'function'
            ) {
              panTo({ lat: place.location.lat(), lng: place.location.lng() });
              return;
            }
          }
        }

        if (geocoderRef.current) {
          const coordinates = await geocodeAddress(geocoderRef.current, suggestion.text);
          panTo(coordinates);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [panTo]
  );

  const handleSearchChange = React.useCallback(
    (event) => {
      const value = event.target.value;
      setSearchValue(value);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      searchDebounceRef.current = setTimeout(() => {
        fetchAutocompleteSuggestions(value);
      }, 250);
    },
    [fetchAutocompleteSuggestions]
  );

  const mapStatus = React.useMemo(() => {
    if (!mapsApiKey) {
      return {
        type: 'error',
        text: 'Add `VITE_GOOGLE_MAPS_API_KEY` in `.env` and restart `npm run dev`.',
      };
    }

    if (loadError) {
      return { type: 'error', text: loadError };
    }

    if (!isMapsReady) {
      return { type: 'info', text: `Loading Maps... (${mapDebugStep})` };
    }

    return null;
  }, [isMapsReady, loadError, mapDebugStep, mapsApiKey]);

  return (
    <div className="map-shell">
      <div className="mapSearch" ref={searchWrapperRef}>
        <input
          value={searchValue}
          onChange={handleSearchChange}
          disabled={!isMapsReady || !isPlacesReady}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && suggestions.length) {
              event.preventDefault();
              handleSuggestionSelect(suggestions[0]);
            }
          }}
          placeholder={isPlacesReady ? 'Enter a city or address' : 'Map search unavailable right now'}
          aria-label="Map location search"
        />

        {suggestions.length ? (
          <ul className="mapSearchSuggestions" role="listbox" aria-label="Location suggestions">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="mapSearchSuggestion"
                  onClick={() => {
                    handleSuggestionSelect(suggestion);
                  }}
                >
                  {suggestion.text}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Locate panTo={panTo} />

      <div className="map" ref={mapElementRef} style={mapContainerStyle} />
      {mapStatus ? (
        <div
          className={`map-overlay ${mapStatus.type === 'error' ? 'map-load-error' : 'map-load-info'}`}
          role={mapStatus.type === 'error' ? 'alert' : 'status'}
        >
          {mapStatus.text}
        </div>
      ) : null}
    </div>
  );
};

export default EmployeeMap;

function Locate({ panTo }) {
  return (
    <button
      type="button"
      className="mapLocate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >
      <i className="fas fa-location-arrow"></i>
    </button>
  );
}
