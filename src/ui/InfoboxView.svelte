<script lang="ts">
    import type {App, MarkdownPostProcessorContext} from 'obsidian';
    import {MarkdownView} from 'obsidian';
    import {onMount} from 'svelte';

    export let app: App;
    export let ctx: MarkdownPostProcessorContext;
    let inSourceMode = false;

    type Gender = 'male' | 'female' | null;

    interface PersonData {
        gender: Gender,
        alive: boolean,
        birthDate: string | null,
        deathDate: string | null,
    }

    let data: PersonData | null = null;

    function updateSourceMode(): void {
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        inSourceMode = view?.getMode?.() === 'source';
    }

    function toDate(value: any): string | null {
        return typeof value === 'string' && /^\d{4}-[01]\d-[0123]\d$/.test(value) ? value : null;
    }

    function updatePersonData(infobox: any): void {
        let gender: Gender = null;

        if (infobox?.gender === 'male') {
            gender = 'male';
        } else if (infobox?.gender === 'female') {
            gender = 'female';
        }

        const alive = infobox?.alive === true;
        const birthDate = toDate(infobox?.birth_date);
        const deathDate = toDate(infobox?.death_date);
        data = {gender, alive, birthDate, deathDate};
    }

    function updateData(): void {
        const id = ctx?.frontmatter?.id;
        const infobox = ctx?.frontmatter?.infobox;

        if (id && infobox?.type === 'person') {
            updatePersonData(infobox);
            return;
        }

        data = null;
    }

    onMount(() => {
        updateSourceMode();
        updateData();

        let x = app.workspace.on('layout-change', () => {
            updateSourceMode();
        });

        app.workspace.on('editor-change', () => {
            updateData();
        });

        return () => app.workspace.offref(x);
    });

    $: fallbackImage = `https://ui-avatars.com/api/?name=me&size=240`;
</script>

<div class="infobox">
    <img alt="Avatar" class="infobox__photo" src={fallbackImage}>
    <div class="infobox__description">
        <div class="infobox__grid">
            {JSON.stringify(data)}
        </div>
    </div>
</div>

<style>
    .infobox {
        display: flex;
        gap: 1rem;
    }

    .infobox__photo {
        width: 240px;
        height: 240px;
        object-fit: cover;
        border-radius: 6px;
    }

    .infobox__description {
        flex-grow: 1;
    }

    .infobox__grid {
        display: grid;
        gap: 0.25rem 0.5rem;
        grid-template-columns: auto 1fr;
    }
</style>
