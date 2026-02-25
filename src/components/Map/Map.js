import React, { useState } from "react";
import { mapStylesDark, mapStylesLight } from "./mapStyles";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { formatRelative } from "date-fns";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "30vh",
};
const defaultZoom = 3;
const defaultCenter = {
  lat: 37.0902,
  lng: -95.7129,
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
    return "";
  }

  const city = result.location.city ? result.location.city.trim().toLowerCase() : "";
  const state = result.location.state ? result.location.state.trim().toLowerCase() : "";
  const country = result.location.country ? result.location.country.trim().toLowerCase() : "";

  return [city, state, country].filter(Boolean).join("|");
};

const getCityLookupAddress = (result) => {
  if (!result || !result.location) {
    return "";
  }

  const city = result.location.city ? result.location.city.trim() : "";
  const state = result.location.state ? result.location.state.trim() : "";
  const country = result.location.country ? result.location.country.trim() : "";

  return [city, state, country].filter(Boolean).join(", ");
};

const geocodeAddress = (geocoder, address) => {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
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

  const firstName = result.name && result.name.first ? result.name.first : "";
  const lastName = result.name && result.name.last ? result.name.last : "";
  const markerName = `${firstName} ${lastName}`.trim() || "Employee";

  return {
    id:
      (result.login && result.login.uuid) ||
      (result.id && result.id.value) ||
      `${coordinates.lat}-${coordinates.lng}-${index}`,
    lat: coordinates.lat,
    lng: coordinates.lng,
    time: new Date(),
    picture:
      result.picture && result.picture.thumbnail
        ? result.picture.thumbnail
        : null,
    name: markerName,
    city: result.location && result.location.city ? result.location.city : "",
  };
};

const EmployeeMap = (props) => {
  const mapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsApiKey,
    libraries,
  });

  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = useState(null);

  const mapRef = React.useRef(null);
  const geocoderRef = React.useRef(null);
  // Cache city lookups so sort/filter actions do not re-geocode the same place.
  const cityCoordinatesCacheRef = React.useRef(new window.Map());
  const markerRequestIdRef = React.useRef(0);

  const mapOptions = React.useMemo(
    () => ({
      styles: props.theme === "dark" ? mapStylesDark : mapStylesLight,
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

    if (!window.google || !window.google.maps) {
      return fallbackCoordinates;
    }

    if (!cityKey) {
      return fallbackCoordinates;
    }

    const cityAddress = getCityLookupAddress(result);
    if (!cityAddress) {
      return fallbackCoordinates;
    }

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    try {
      const coordinates = await geocodeAddress(geocoderRef.current, cityAddress);
      cityCoordinatesCacheRef.current.set(cityKey, coordinates);
      return coordinates;
    } catch (error) {
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

  React.useEffect(() => {
    if (!isLoaded) {
      return;
    }

    getEmployeeMarkers(props.results);
  }, [isLoaded, props.results, getEmployeeMarkers]);

  React.useEffect(() => {
    if (!isLoaded) {
      return undefined;
    }

    if (!props.selectedResult || !Object.keys(props.selectedResult).length) {
      return undefined;
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
  }, [isLoaded, props.selectedResult, resolveCoordinatesForResult]);

  const onMapLoad = React.useCallback(
    (map) => {
      mapRef.current = map;
      fitMapToMarkers(markers);
    },
    [fitMapToMarkers, markers]
  );

  const panTo = React.useCallback(({ lat, lng }) => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(10);
  }, []);

  if (!mapsApiKey) return "Add REACT_APP_GOOGLE_MAPS_API_KEY in .env to load the map.";
  if (loadError) return "Error loading Maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div>
      <Search panTo={panTo} />
      <Locate panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={defaultZoom}
        center={defaultCenter}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            icon={
              marker.picture
                ? {
                    url: marker.picture,
                    scaledSize: new window.google.maps.Size(34, 34),
                    anchor: new window.google.maps.Point(17, 17),
                  }
                : undefined
            }
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div className="map-info-window">
              <p className="m-0"><strong>{selected.name}</strong></p>
              {selected.city ? <p className="m-0">{selected.city}</p> : null}
              <p className="m-0">Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
};

export default EmployeeMap;

const Search = ({ panTo }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.6532, lng: () => -79.3832 },
      radius: 100 * 1000,
    },
  });

  return (
    <div className="mapSearch">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();
          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (error) {
            console.error(error);
          }
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder={"Enter a city or address"}
        />
        <ComboboxPopover>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};

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
