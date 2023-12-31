import type {MarkdownPostProcessorContext} from 'obsidian';
import {App, TFile} from 'obsidian';
import dayjs, {Dayjs} from 'dayjs';

type Property = { key: string, value: unknown };
type Properties = Array<Property>;
export type Gender = 'male' | 'female' | null;
export type Entity = Person;

export function toDate(value: unknown): Dayjs {
    return dayjs(typeof value === 'string' ? value : null, 'YYYY-MM-DD', true);
}

export class Person {
    private readonly app: App;
    private _gender: Gender = null;
    private _nationality = '';
    private _alive = true;
    private _birthName = '';
    private _birthDate: Dayjs;
    private _birthPlace = '';
    private _deathDate: Dayjs;
    private _deathPlace = '';
    private _burialPlace = '';
    private _image = '';

    constructor(app: App) {
        this.app = app;
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

    get image(): string {
        return this._image;
    }

    set image(value: string) {
        this._image = value;
    }

    get imageFile(): TFile | null {
        const image = this.image;

        if (image) {
            const file = this.app.vault.getAbstractFileByPath(image);

            if (file instanceof TFile) {
                return file;
            }
        }

        return null;
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

async function parseFrontmatter(app: App, ctx: MarkdownPostProcessorContext): Promise<Properties> {
    try {
        const file = app.vault.getAbstractFileByPath(ctx.sourcePath);

        if (file instanceof TFile) {
            const cache = app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;

            if (frontmatter) {
                const meta: Property[] = [];

                for (const key in frontmatter) {
                    meta.push({key, value: frontmatter[key]});
                }

                return meta;
            }
        }
    } catch (e) {
        console.log(e);
    }

    return [];
}

export function parsePersonMeta(app: App, meta: Properties): Person {
    const person = new Person(app);
    person.gender = getPropAsGender(meta, 'gender');
    person.nationality = getPropAsString(meta, 'nationality');
    person.alive = getPropAsBool(meta, 'alive');
    person.birthName = getPropAsString(meta, 'birth_name');
    person.birthDate = getPropAsDate(meta, 'birth_date');
    person.birthPlace = getPropAsString(meta, 'birth_place');
    person.deathDate = getPropAsDate(meta, 'death_date');
    person.deathPlace = getPropAsString(meta, 'death_place');
    person.burialPlace = getPropAsString(meta, 'burial_place');
    person.image = getPropAsString(meta, 'image');
    return person;
}

export async function parse(app: App, ctx: MarkdownPostProcessorContext): Promise<Entity | null> {
    const meta = await parseFrontmatter(app, ctx);

    switch (getProp(meta, 'type')) {
        case 'person':
            return parsePersonMeta(app, meta);
    }

    return null;
}
