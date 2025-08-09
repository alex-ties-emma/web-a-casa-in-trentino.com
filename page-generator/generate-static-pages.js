import fetch from 'node-fetch';
import simplify from '@turf/simplify';
import {writeFile} from 'fs/promises';
import fs from 'fs';
import {v4 as uuidv4} from 'uuid';

const data = JSON.parse(fs.readFileSync('data/locationdata.json', 'utf8'));
const trentinoDistrictsData = JSON.parse(fs.readFileSync('data/trentino-district-data.json', 'utf8'));
const trentinoDistricts = JSON.parse(fs.readFileSync('data/trentino-districts.json', 'utf8'));
const geolocation = JSON.parse(fs.readFileSync('data/geolocation.json', 'utf8'));

