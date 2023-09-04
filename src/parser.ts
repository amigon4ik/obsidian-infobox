import type {App} from 'obsidian';
import {parseYaml, TFile} from 'obsidian';
import dayjs, {Dayjs} from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ru';

dayjs.extend(localizedFormat);
dayjs.locale('ru');

type Property = { key: string, value: unknown };
type Properties = Array<Property>;
export type Gender = 'male' | 'female' | null;
export type Entity = Person;

function toDate(value: unknown): Dayjs {
    return dayjs(typeof value === 'string' ? value : null, 'YYYY-MM-DD', true);
}

export class Person {
    private _gender: Gender = null;
    private _nationality = '';
    private _alive = true;
    private _birthName = '';
    private _birthDate: Dayjs;
    private _birthPlace = '';
    private _deathDate: Dayjs;
    private _deathPlace = '';
    private _burialPlace = '';

    constructor() {
        this._birthDate = toDate(null);
        this._deathDate = toDate(null);
    }

    get gender(): Gender {
        return this._gender;
    }

    set gender(value: Gender) {
        this._gender = value;
    }

    get nationality(): string {
        return this._nationality;
    }

    set nationality(value: string) {
        this._nationality = value;
    }

    get alive(): boolean {
        return this._alive;
    }

    set alive(value: boolean) {
        this._alive = value;
    }

    get birthName(): string {
        return this._birthName;
    }

    set birthName(value: string) {
        this._birthName = value;
    }

    get birthDate(): Dayjs {
        return this._birthDate;
    }

    set birthDate(value: Dayjs) {
        this._birthDate = value;
    }

    get birthPlace(): string {
        return this._birthPlace;
    }

    set birthPlace(value: string) {
        this._birthPlace = value;
    }

    get deathDate(): Dayjs {
        return this._deathDate;
    }

    set deathDate(value: Dayjs) {
        this._deathDate = value;
    }

    get deathPlace(): string {
        return this._deathPlace;
    }

    set deathPlace(value: string) {
        this._deathPlace = value;
    }

    get burialPlace(): string {
        return this._burialPlace;
    }

    set burialPlace(value: string) {
        this._burialPlace = value;
    }

    get age(): number {
        const start = this.birthDate;
        const end = this.alive ? dayjs() : this.deathDate;

        if (start.isValid() && end.isValid()) {
            if (start.isSame(end) || start.isBefore(end)) {
                return end.diff(start, 'years');
            }
        }

        return -1;
    }

    get ageInMonths(): number {
        const start = this.birthDate;
        const end = this.alive ? dayjs() : this.deathDate;

        if (start.isValid() && end.isValid()) {
            if (start.isSame(end) || start.isBefore(end)) {
                return end.diff(start, 'months');
            }
        }

        return -1;
    }

    get hasAge(): boolean {
        return this.age > -1;
    }
}

function getProp(meta: Properties, key: string): unknown {
    return meta.find(item => item.key === key)?.value;
}

function getPropAsString(meta: Properties, key: string): string {
    const prop = getProp(meta, key);
    return typeof prop === 'string' ? prop.trim() : '';
}

function getPropAsBool(meta: Properties, key: string, defaultValue = false): boolean {
    const prop = getProp(meta, key);
    return typeof prop === 'boolean' ? prop : defaultValue;
}

function getPropAsDate(meta: Properties, key: string): Dayjs {
    const prop = getPropAsString(meta, key);
    return toDate(prop);
}

function getPropAsGender(meta: Properties, key: string): Gender {
    const prop = getPropAsString(meta, key);
    return (prop === 'male' || prop === 'female') ? prop : null;
}

async function parseFrontmatter(app: App): Promise<Properties> {
    try {
        const file = app.workspace.getActiveFile();

        if (file instanceof TFile) {
            const fileCache = app.metadataCache.getFileCache(file);

            if (fileCache?.frontmatter) {
                // @ts-ignore - this is part of the new Obsidian API as of v1.4.1
                // eslint-disable-next-line no-unsafe-optional-chaining
                const {start, end} = fileCache?.frontmatterPosition;
                const fileContent = await app.vault.cachedRead(file);

                const yamlContent: string = fileContent.split('\n').slice(start.line, end.line).join('\n');
                const parsedYaml = parseYaml(yamlContent);
                const metaYaml: Property[] = [];

                for (const key in parsedYaml) {
                    metaYaml.push({key, value: parsedYaml[key]});
                }

                return metaYaml;
            }
        }
    } catch (e) {
        console.log(e);
    }

    return [];
}

export function parsePersonMeta(meta: Properties): Person {
    const person = new Person();
    person.gender = getPropAsGender(meta, 'gender');
    person.nationality = getPropAsString(meta, 'nationality');
    person.alive = getPropAsBool(meta, 'alive');
    person.birthName = getPropAsString(meta, 'birth_name');
    person.birthDate = getPropAsDate(meta, 'birth_date');
    person.birthPlace = getPropAsString(meta, 'birth_place');
    person.deathDate = getPropAsDate(meta, 'death_date');
    person.deathPlace = getPropAsString(meta, 'death_place');
    person.burialPlace = getPropAsString(meta, 'burial_place');
    return person;
}

export async function parse(app: App): Promise<Entity | null> {
    const meta = await parseFrontmatter(app);

    switch (getProp(meta, 'type')) {
        case 'person':
            return parsePersonMeta(meta);
    }

    return null;
}
