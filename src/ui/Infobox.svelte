<script lang="ts">
    import type {App, MarkdownPostProcessorContext} from 'obsidian';
    import {onMount} from 'svelte';
    import PersonInfobox from './PersonInfobox.svelte';
    import type InfoboxPlugin from '../index';
    import type {Entity} from '../parser';
    import {parse, Person} from '../parser';

    export let app: App;
    export let ctx: MarkdownPostProcessorContext;
    export let plugin: InfoboxPlugin;
    let entity: Entity | null = null;

    async function parseEntity() {
        entity = await parse(app, ctx);
    }

    onMount(() => {
        parseEntity();

        const evt = app.metadataCache.on('changed', () => {
            parseEntity();
        });

        return () => {
            app.workspace.offref(evt);
        };
    });
</script>

{#if entity instanceof Person}
    <PersonInfobox app={app} ctx={ctx} plugin={plugin} person={entity}></PersonInfobox>
{/if}
