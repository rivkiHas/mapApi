import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncSelect from "react-select/async";
import "./searchForm.css";
import { useState, useEffect } from "react";
import { MapContainer } from 'react-leaflet/MapContainer';
import { TileLayer } from 'react-leaflet/TileLayer';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

//עיצוב של המרקר
const markerIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
});

export const SearchForm = () => {
    let [position1, setPosition1] = useState(null);
    //הבאת המיקום הנוכחי
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPosition1({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    });
                    console.log(position);

                },
                (error) => {
                    console.error("Error fetching location:", error);
                }
            );
        } else {
            console.error("Geolocation not supported by this browser.");

        }
    }, []);
    //הבאת המיקום החדש
    const MapFlyTo = ({ position }) => {
        const map = useMapEvents({});
        useEffect(() => {
            if (position.lat && position.lon) {
                map.flyTo([position.lat, position.lon], map.getZoom());
            }
        }, [position, map]);
        return null;
    };

    //סכמה שהאוביקט תקין
    let validateForm = yup.object().shape({
        userName: yup.string("שם לא חוקי").required("שדה חובה").min(2, "שם קצר מידי").max(15, "שם ארוך מידי"),
        address: yup.string("כתובת לא חוקית").required("שדה חובה").min(2, "כתובת קצרה מידי"),
        phone: yup.string().required("שדה חובה").matches(/^[0-9]{1,}$/, "מספר לא חוקי"),
        email: yup.string().required("שדה חובה").email("כתובת מייל לא חוקית").test('is-valid-email', 'כתובת מייל לא חוקית', (value) => {
            const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
            return emailRegex.test(value);
        }),
        numOfRooms: yup.number("מספר לא חוקי").required("שדה חובה").min(1, "מספר לא חוקי").max(12, "מספר לא חוקי"),
        distance: yup.number("מספר לא חוקי").required("שדה חובה").min(0, "מספר לא חוקי")
    });

    const { handleSubmit, control, register, formState: { errors }, reset } = useForm({
        resolver: yupResolver(validateForm),
    });
    //פונקציה לשמירת נתוני הטופס
    const saveDetails = async (data) => {
        data.status = "מחפש";
        console.log("Saved Data:", data);
        // alert(JSON.stringify(data));
        reset();
    };

    // פונקציה להבאת כתובות
    const getAddress = async (inputValue) => {
        if (!inputValue) return [];
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&limit=7`
            );
            const data = await response.json();
            return data.map((item) => ({
                value: item.display_name,
                label: item.display_name,
                lat: item.lat,
                lon: item.lon
            }));
        } catch (err) {
            console.error("Error fetching addresses:", err);
            return [];
        }
    };

    //שינוי המיקום בUSESTATE
    const setThePosition = (data) => {
        let copy = { lat: data.lat, lon: data.lon };
        setPosition1(copy);
        console.log(data);
    }

    return (
        <>
            <div className="all">
                <form onSubmit={handleSubmit(saveDetails)}>
                    <div className="details">
                        <label className="det-label">שם משתמש</label>
                        <input className="det-input" type="text" {...register("userName")} />
                        {errors.userName && <span className='error'>{errors.userName.message}</span>}
                    </div>

                    <div className="details">
                        <label className="det-label">כתובת לחיפוש</label>
                        <Controller name="address" control={control} render={({ field }) => (
                            <AsyncSelect id="select" {...field} cacheOptions loadOptions={getAddress}
                                onChange={(selectedOption) => {
                                    field.onChange(selectedOption?.value)
                                    setThePosition(selectedOption)
                                }}
                                value={field.value ? { label: field.value, value: field.value } : null}

                                placeholder="התחל להקליד כתובת..."
                            />)} />
                        {errors.address && <span className="error">{errors.address.message}</span>}
                    </div>

                    <div className="details">
                        <label className="det-label">טלפון</label>
                        <input className="det-input" type="text" {...register("phone")} />
                        {errors.phone && <span className='error'>{errors.phone.message}</span>}
                    </div>
                    <div className="details">
                        <label className="det-label">מייל</label>
                        <input className="det-input" type="email"{...register("email")} />
                        {errors.email && <span className='error'>{errors.email.message}</span>}
                    </div>
                    <div className="details" id="chexboxDiv">
                        <label className="det-label">חיבור לאינטרנט</label>
                        <input className="det-input" type="checkbox"{...register("internet")} />
                    </div>
                    <div className="details" id="chexboxDiv">
                        <label className="det-label">מטבח</label>
                        <input className="det-input" type="checkbox" {...register("kitchen")} />
                    </div>
                    <div className="details" id="chexboxDiv">
                        <label className="det-label">מכונת קפה</label>
                        <input className="det-input" type="checkbox" {...register("coffeeMachine")} />
                    </div>
                    <div className="details">
                        <label className="det-label">מספר חדרים</label>
                        <input className="det-input" type="number" {...register("numOfRooms")} defaultValue="1" />
                        {errors.numOfRooms && <span className='error'>{errors.numOfRooms.message}</span>}
                    </div>
                    <div className="details">
                        <label className="det-label">מרחק מהכתובת</label>
                        <input className="det-input" type="number"{...register("distance")} defaultValue="0" />
                        {errors.distance && <span className='error'>{errors.distance.message}</span>}
                    </div>

                    <input type="submit" />
                </form>
                {position1 && (
                    <MapContainer
                        className='mapDiv'
                        center={[position1.lat, position1.lon]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: "580px", width: "580px" }}
                        name="myMap"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[position1.lat, position1.lon]} icon={markerIcon}>
                            <Popup>
                                מיקום נוכחי
                            </Popup>
                        </Marker>
                        <MapFlyTo position={position1} />
                    </MapContainer>
                )}
            </div>
        </>
    );
};