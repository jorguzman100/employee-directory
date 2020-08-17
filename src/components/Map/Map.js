import React, { useState } from "react";
import mapStyles from './mapStyles'

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
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";

import "@reach/combobox/styles.css";

/* import mapStyles from "./mapStyles"; */


const libraries = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '30vh'
};
const zoom = 3;
const center = {
  lat: 37.0902,
  lng: -95.7129
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true, // desable Google Maps default UI controls
  zoomControl: true
}



const Map = (props) => {
  // Load the Google Map when the component is mounted
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // useState hook to define the markers and its setter - causes re-render
  const [markers, setMarkers] = React.useState([]); // map onClick

  // state for the details window once a marker is selected
  const [selected, setSelected] = useState(null);
  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [...current, {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      time: new Date(),
    },
    ]);
    /* console.log('GoogleMap event', event);
    console.log('markers', markers); */
  });

  // useRef keeps a state without causing re-renders
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Re-position the map to the provided lat and lng
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(10);
  }, [])

  if (loadError) return "Error loading Maps";
  if (!isLoaded) return "Loading Maps...";

  return (
    <div>
      <div className='mapText'>Editable map text </div>

      {/* The Search */}
      <Search panTo={panTo}/>


      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={zoom}
        center={center}
        options={options}
        // Add markers after the user clicks on the map
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {/* Show the markers on the map*/}
        {markers.map(marker => (
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}

            // change the marker icon
            icon={{
              url: '/markerIcon.svg',
              scaledSize: new window.google.maps.Size(20, 20),
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(10, 10)
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {/* Show the window on the selected marker */}
        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}

            // Allow relaunch of the window after the "x" close button is clicked
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <p>Employee selected</p>
              <p>Spotted {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default Map;



const Search = ({panTo}) => {
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
  <div className='mapSearch'>
      <Combobox
        onSelect={async (address) => {
          console.log('address: ', address);

          // Update state and avoid keep showing the search popover in the search input
          setValue(address, false);
          clearSuggestions();
        try {
          const results = await getGeocode({ address });
          const { lat, lng } = await getLatLng(results[0]);
          panTo({lat, lng});
          console.log('geoCode results[0]: ', results[0]);
          console.log('lat, lng: ', lat, lng);
        } catch(error) {
          console.log(error);
        }
    }}
    >
      <ComboboxInput
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
        disabled={!ready}
        placeholder={'Enter an address'}
        />
        <ComboboxPopover>
          {status === 'OK' &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))
          }
        </ComboboxPopover>
    </Combobox>
    </div>
  )
}

function Locate({ panTo }) {
  return (
    <button
      className="locate"
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
      <img src="/compassIcon.svg" alt="compass" />
    </button>
  );
}

/* function Search({ panTo }) {
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

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log("😱 Error: ", error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search your location"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
} */




/*
/* const defineEmployeeMarkers = () => {
    props.results.forEach((result) => {
      console.log('lat: ' + result.location.coordinates.latitude + ' lng: ', result.location.coordinates.longitude);
      setMarkers((current) => [...current, {
        lat: result.location.coordinates.latitude,
        lng: result.location.coordinates.longitude,
        time: new Date(),
      },
      ]);
      console.log('markers', markers);
    });
  }
  */


