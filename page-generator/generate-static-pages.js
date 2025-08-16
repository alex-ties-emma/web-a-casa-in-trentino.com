import fetch from 'node-fetch';
import simplify from '@turf/simplify';
import {writeFile} from 'fs/promises';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

let elementDefinitions = {};

let pageDefinitions = {}


// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locationdata = JSON.parse(fs.readFileSync('../data/locationdata.json', 'utf8'));
const trentinoDistrictsData = JSON.parse(fs.readFileSync('../data/trentino-district-data.json', 'utf8'));
const trentinoDistricts = JSON.parse(fs.readFileSync('../data/trentino-districts.json', 'utf8'));
const geolocation = JSON.parse(fs.readFileSync('../data/geolocation.json', 'utf8'));

const elementDefinitionfolderPath = path.join(__dirname, "../config/element-definitions");
const pageDefinitionfolderPath = path.join(__dirname, "../config/page-definitions");


let priceScale = [
    { "step": 0, "hex": "#33691E", "label":"very_low" },
    { "step": 1, "hex": "#5E841D", "label":"very_low"  },
    { "step": 2, "hex": "#89A01C", "label":"low"  },
    { "step": 3, "hex": "#B3BC1B", "label":"low" },
    { "step": 4, "hex": "#DED71A", "label":"medium" },
    { "step": 5, "hex": "#FFEB3B", "label":"medium" },
    { "step": 6, "hex": "#FFB62D", "label":"medium" },
    { "step": 7, "hex": "#FF8120", "label":"medium" },
    { "step": 8, "hex": "#FF4C12", "label":"high" },
    { "step": 9, "hex": "#FF1605", "label":"high" },
    { "step": 10, "hex": "#C30003", "label":"very_high" },
    { "step": 11, "hex": "#7B0000", "label":"very_high" }
];

const pricesValues = Object.values(locationdata).map(x => x.price);


const min = Math.min(...pricesValues);
const max = Math.max(...pricesValues);

const steps = [];

const stepSize = (max - min) / 11;

for (let i = 0; i < 12; i++) {
    const rawValue = min + stepSize * i;
    const roundedUpTo50 = Math.ceil(rawValue / 50) * 50;
    steps.push(roundedUpTo50);
}

Object.keys(locationdata).forEach((municipalityName) => {

    let price = locationdata[municipalityName].price;

    let index = getStepIndexForPrice(steps, price);

    let priceStep = priceScale.find(x => x.step === index);

    locationdata[municipalityName].priceValuation = {
        color: priceStep.hex,
        label: priceStep.label,

    }

});
Object.keys(trentinoDistrictsData).forEach((districtName) => {

    let price = trentinoDistrictsData[districtName].average;

    let index = getStepIndexForPrice(steps, price);

    let priceStep = priceScale.find(x => x.step === index);

    trentinoDistrictsData[districtName].priceValuation = {
        color: priceStep.hex,
        label: priceStep.label,

    }

});



fs.readdirSync(elementDefinitionfolderPath).forEach((file) => {
    if (file.endsWith(".json")) {
        const filePath = path.join(elementDefinitionfolderPath, file);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const handle = data.handle;
            const id = data["@id"];

            if (handle && id) {
                elementDefinitions[handle] = id;
            }
        } catch (err) {
            console.warn(`Skipping invalid JSON file: ${file}`);
        }
    }
});

fs.readdirSync(pageDefinitionfolderPath).forEach((file) => {
    if (file.endsWith(".json")) {
        const filePath = path.join(pageDefinitionfolderPath, file);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const handle = data.handle;
            const id = data["@id"];

            if (handle && id) {
                pageDefinitions[handle] = id;
            }
        } catch (err) {
            console.warn(`Skipping invalid JSON file: ${file}`);
        }
    }
});

console.log({elementDefinitions, pageDefinitions})

function generateUUID() {
    return crypto.randomUUID();
}
let sites = {
    "development": "\/cms\/api\/site_configurations\/4e74aab8-b178-433e-9aaa-58caa27dc7dc",
    "staging": "\/cms\/api\/site_configurations\/018be6e8-c9fa-4e09-b301-d04f7ee560c8"
}

let languages = {
    "DE": "\/cms\/api\/languages\/2ee8416f-7274-45c0-83e0-12fc6f3ef4f4",
    "IT": "\/cms\/api\/languages\/7fb31631-fe93-4ea9-b8d9-cc09c32e4477",
    "EN": "\/cms\/api\/languages\/d76b0d26-ea6d-4d83-bd88-99af344e8507"
}




function createPage(pageDefinitionHandle, siteHandle, handle) {
    let uuid = generateUUID()

    return {
        "@type": null,
        "@id": "\/cms\/api\/json_pages\/" + uuid,
        "uuid": uuid,
        "internalName": handle,
        "handle": handle,
        "parentPage": null,
        "pageDefinition": pageDefinitions[pageDefinitionHandle],
        "pageLanguages": [],
        "site": sites[siteHandle],
    }
}


function createPageLanguage(langShort) {
    let uuid = generateUUID();

    return {
        "@type": "page_language",
        "@id": "\/cms\/api\/page_languages\/" + uuid,
        "uuid": uuid,
        "description": "",
        "title": "homeDE",
        "navName": "homeDE",
        "visibleInSitemap": true,
        "ignoreSlidedContent": false,
        "visible": true,
        "showInNavigation": true,
        "structuredData": [],
        "url": "\/",
        "headHTML": "",
        "redirectTo": null,
        "language": languages[langShort],
        "titlePriority": 0,
        "descriptionPriority": 0,
        "itemIndex": 0,
        "settings": [],
        "elements": [],
        "hasTodo": false
    }
}

function createSection() {
    let uuid = generateUUID();

    return {
        "@type": "section",
        "@id": "\/cms\/api\/sections\/" + uuid,
        "uuid": uuid,
        "slides": false,
        "scoped": false,
        "itemIndex": 0,
        "content": [],
        "visible": true,
        "elementDefinition": elementDefinitions['content'],
        "translates": null,
        "translations": [],
        "siteSeason": null,
        "hasTodo": false
    }
}


function createContent(definitionHandle) {
    let uuid = generateUUID();

    return {
        "@type": "content",
        "@id": "\/cms\/api\/content\/" + uuid,
        "uuid": uuid,
        "slides": false,
        "scoped": false,
        "itemIndex": 0,
        "content": [],
        "visible": true,
        "elementDefinition": elementDefinitions[definitionHandle],
        "translates": null,
        "translations": [],
        "siteSeason": null,
        "hasTodo": false
    }
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

console.log(locationdata);


Object.keys(locationdata).forEach((municipalityName) => {

    let municipalityData = locationdata[municipalityName];

    console.log({value: municipalityData});

    let filename = 'municipality-' + municipalityData.slug + ".json";

    let page = createPage("municipality", "development", municipalityData.slug);
    page.internalName = municipalityName;

    let district = trentinoDistrictsData[municipalityData.district];

    let districtSlugPrefix = {
        "DE": "/bezirk/",
        "IT": "/distretto/",
        "EN": "/district/"
    }

    let municipalitySlugPrefix = {
        "DE": "/gemeinde/",
        "IT": "/comune/",
        "EN": "/municipality/"
    }

    Object.keys(municipalitySlugPrefix).forEach(language => {

        let pageLanguage = createPageLanguage(language);

        pageLanguage.title = municipalityData["pageMeta"]["page_title"][language];
        pageLanguage.description = municipalityData["pageMeta"]["meta_description"][language];
        pageLanguage.navName = municipalityName;
        pageLanguage.url = municipalitySlugPrefix[language] + municipalityData.slug;

        pageLanguage.settings = {
            municipality: municipalityName,
            population: municipalityData.population,
            meters_above_sea_level: municipalityData.height,
            price: {
                price: municipalityData.price,
                color: municipalityData.priceValuation.color,
                label: municipalityData.priceValuation.label,
            },
            infrastructureTable: municipalityData.infrastructure,
            descriptions: municipalityData.descriptions[language],
            district: {
                name: municipalityData.district,
                referenceText: district.referenceText[language],
                slug: districtSlugPrefix[language] + district.slug,
                image: district.slug + ".jpg"
            }
        };

        page.pageLanguages.push(pageLanguage);
    })


    let filepath = "../pages/" + filename;

    fs.writeFileSync(filepath, JSON.stringify(page, null, 2));
});

Object.keys(trentinoDistrictsData).forEach((districtName) => {

    let districtData = trentinoDistrictsData[districtName];

    let filename = 'district-' + districtData.slug + ".json";

    let page = createPage("municipality", "development", districtData.slug);
    page.internalName = districtName;


    let districtSlugPrefix = {
        "DE": "/bezirk/",
        "IT": "/distretto/",
        "EN": "/district/"
    }

    let municipalitySlugPrefix = {
        "DE": "/gemeinde/",
        "IT": "/comune/",
        "EN": "/municipality/"
    }


    Object.keys(districtSlugPrefix).forEach(language => {

        let pageLanguage = createPageLanguage(language);

        pageLanguage.title = districtData["pageMeta"]["page_title"][language];
        pageLanguage.description = districtData["pageMeta"]["meta_description"][language];
        pageLanguage.navName = districtName;
        pageLanguage.url = districtSlugPrefix[language] + districtData.slug;

        pageLanguage.settings = {
            district: districtName,
            price: {
                average: districtData.average,
                color: districtData.priceValuation.color,
                label: districtData.priceValuation.label,
            },
            infoTable: districtData.infos,
            descriptions: districtData.descriptions[language]
        };

        let municipalitiesData = [];

        Object.keys(locationdata).forEach((key) => {
            let municipality = locationdata[key];

            municipalitiesData.push({
                name: key,
                slug: municipalitySlugPrefix[language] + municipality.slug
            });
        })


        pageLanguage.settings.municipalities = municipalitiesData;


        page.pageLanguages.push(pageLanguage);
    })


    let filepath = "../pages/" + filename;

    fs.writeFileSync(filepath, JSON.stringify(page, null, 2));
});