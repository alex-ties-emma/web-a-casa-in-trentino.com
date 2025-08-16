import fetch from 'node-fetch';
import simplify from '@turf/simplify';
import {writeFile} from 'fs/promises';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
let elementDefinitons = {};

let pageDefinitions = {}


// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = JSON.parse(fs.readFileSync('../data/locationdata.json', 'utf8'));
const trentinoDistrictsData = JSON.parse(fs.readFileSync('../data/trentino-district-data.json', 'utf8'));
const trentinoDistricts = JSON.parse(fs.readFileSync('../data/trentino-districts.json', 'utf8'));
const geolocation = JSON.parse(fs.readFileSync('../data/geolocation.json', 'utf8'));

const elementDefinitionfolderPath = path.join(__dirname, "../config/element-definitions");
const pageDefinitionfolderPath = path.join(__dirname, "../config/page-definitions");

fs.readdirSync(elementDefinitionfolderPath).forEach((file) => {
    if (file.endsWith(".json")) {
        const filePath = path.join(elementDefinitionfolderPath, file);

        try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const handle = data.handle;
            const id = data["@id"];

            if (handle && id) {
                elementDefinitons[handle] = id;
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

console.log({elementDefinitons, pageDefinitions})

function generateUUID() {
    return crypto.randomUUID();
}
let sites = {
    "development": "\/cms\/api\/site_configurations\/4e74aab8-b178-433e-9aaa-58caa27dc7dc",
    "staging": "\/cms\/api\/site_configurations\/018be6e8-c9fa-4e09-b301-d04f7ee560c8"
}

let languages = {

}

let elementDefinitions = {
    "content":"\/cms\/api\/section_element_definitions\/d68a7d34-6e0f-4477-9a03-f8aa47f592e5"


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
        "language": langShort,
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