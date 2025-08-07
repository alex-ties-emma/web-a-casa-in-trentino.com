import leaflet from "leaflet";
import locationdata from "./data/locationdata.json";
import geolocation from "./data/geolocation.json";

export function initMap() {




    let map = leaflet.map('map').setView([46.096835, 11.177346], 8);


    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    let scale = [
        { "step": 0, "hex": "#33691E" },
        { "step": 1, "hex": "#5E841D" },
        { "step": 2, "hex": "#89A01C" },
        { "step": 3, "hex": "#B3BC1B" },
        { "step": 4, "hex": "#DED71A" },
        { "step": 5, "hex": "#FFEB3B" },
        { "step": 6, "hex": "#FFB62D" },
        { "step": 7, "hex": "#FF8120" },
        { "step": 8, "hex": "#FF4C12" },
        { "step": 9, "hex": "#FF1605" },
        { "step": 10, "hex": "#C30003" },
        { "step": 11, "hex": "#7B0000" }
    ];


    const pricesValues = Object.values(locationdata).map(x => x.price);
    if (pricesValues.length === 0) {
        throw new Error("Object has no price values.");
    }

    const min = Math.min(...pricesValues);
    const max = Math.max(...pricesValues);
    const steps = [];

    console.log({pricesValues, min, max});

    const stepSize = (max - min) / 11;

    for (let i = 0; i < 12; i++) {
        const rawValue = min + stepSize * i;
        const roundedUpTo50 = Math.ceil(rawValue / 50) * 50;
        steps.push(roundedUpTo50);
    }

    console.log({
        min,
        max,
        steps
    });




    Object.entries(locationdata).forEach(([municipality, data]) => {


        let price = data.price;

        console.log({municipality, data, price});

        const feature = geolocation.find(f =>
            f.municipality === municipality
        );

        if (feature && feature.geo_json) {

            let index = getStepIndexForPrice(steps, price);

            let color = scale.find(x => x.step === index).hex;


            L.geoJSON(feature.geo_json, {
                style: { color: color, weight: 2, fillOpacity: 0.8 }
            }).bindPopup(`${municipality}<br>Price: ${price}`)
                .addTo(map);
        }
    });



}


function getStepIndexForPrice(steps, price) {
    for (let i = 0; i < steps.length; i++) {
        if (price <= steps[i]) {
            return i;
        }
    }
    // If price is greater than all steps, return the last index
    return steps.length - 1;
}