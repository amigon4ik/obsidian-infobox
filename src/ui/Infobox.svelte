<script lang="ts">
    import type {App, MarkdownPostProcessorContext} from 'obsidian';
    import {MarkdownView} from 'obsidian';
    import {onMount} from 'svelte';
    import PersonInfobox from './PersonInfobox.svelte';
    import type InfoboxPlugin from '../index';
    import {Entity, parse, Person} from '../parser';

    export let app: App;
    export let ctx: MarkdownPostProcessorContext;
    export let plugin: InfoboxPlugin;
    let isSourceMode: boolean = false;
    let entity: Entity | null = null;

    function updateSourceMode(): void {
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        isSourceMode = view?.getMode?.() === 'source';
    }

    async function parseEntity() {
        entity = await parse(app, ctx);
    }

    onMount(() => {
        updateSourceMode();
        parseEntity();

        const evt1 = app.workspace.on('layout-change', () => {
            updateSourceMode();
        });

        const evt2 = app.metadataCache.on('changed', () => {
            parseEntity();
        });

        return () => {
            app.workspace.offref(evt1);
            app.workspace.offref(evt2);
        };
    });
</script>

{#if entity instanceof Person}
    <PersonInfobox ctx={ctx} plugin={plugin} person={entity}></PersonInfobox>
{/if}
