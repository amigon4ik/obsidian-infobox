<script lang="ts">
    import type {MarkdownPostProcessorContext} from 'obsidian';
    import {MarkdownRenderer} from 'obsidian';
    import EmojiAvatar from './EmojiAvatar.svelte';
    import type InfoboxPlugin from '../index';
    import {formatAge, formatDate, formatGender} from '../format';

    export let ctx: MarkdownPostProcessorContext;
    export let plugin: InfoboxPlugin;
    export let person: Person;

    let birthPlaceEl: HTMLElement;
    let deathPlaceEl: HTMLElement;
    let burialPlaceEl: HTMLElement;

    function renderMarkdown(el: HTMLElement, content: string): void {
        el.innerHTML = '';

        if (content.length) {
            MarkdownRenderer.renderMarkdown(content, el, ctx?.sourcePath ?? '', plugin);
        }
    }

    $: if (birthPlaceEl) {
        renderMarkdown(birthPlaceEl, person.birthPlace);
    }

    $: if (deathPlaceEl) {
        renderMarkdown(deathPlaceEl, person.deathPlace);
    }

    $: if (burialPlaceEl) {
        renderMarkdown(burialPlaceEl, person.burialPlace);
    }
</script>

<div class="ib-container">
    <div class="ib-avatar">
        <EmojiAvatar gender={person.gender} age={person.age}></EmojiAvatar>
    </div>
    <div class="ib-grid">
        <div class="ib-label">Пол:</div>
        <div>{ formatGender(person.gender) }</div>

        {#if person.nationality}
            <div class="ib-label">Национальность:</div>
            <div>{person.nationality}</div>
        {/if}

        {#if person.birthName}
            <div class="ib-label">Имя при рождении:</div>
            <div>{person.birthName}</div>
        {/if}

        <div class="ib-label">Дата рождения:</div>
        <div>
            { formatDate(person.birthDate) }

            {#if person.alive && person.hasAge}
                ({ formatAge(person.age, person.ageInMonths) })
            {/if}
        </div>

        {#if person.birthPlace}
            <div class="ib-label">Место рождения:</div>
            <div class="ib-place" bind:this={birthPlaceEl}></div>
        {/if}

        {#if !person.alive}
            <div class="ib-label">Дата смерти:</div>
            <div>
                { formatDate(person.deathDate) }
                {#if person.hasAge}
                    ({ formatAge(person.age, person.ageInMonths) })
                {/if}
            </div>

            {#if person.deathPlace}
                <div class="ib-label">Место смерти:</div>
                <div class="ib-place" bind:this={deathPlaceEl}></div>
            {/if}

            {#if person.burialPlace}
                <div class="ib-label">Место погребения:</div>
                <div class="ib-place" bind:this={burialPlaceEl}></div>
            {/if}
        {/if}
    </div>
</div>

<style>
    .ib-container {
        display: flex;
        gap: 2rem;
        align-items: start;
        margin-bottom: 2rem;
    }

    .ib-avatar {
        display: grid;
        place-content: center;
        width: 180px;
        height: 180px;
        background-image: linear-gradient(#6dd0f7, #ff99cb);
        border-radius: 8px;
        font-size: 110px;
        user-select: none;
        flex-shrink: 0;
        text-shadow: #000 1px 0 6px;
    }

    .ib-grid {
        display: grid;
        gap: 0 1rem;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto;
    }

    .ib-label {
        font-weight: var(--font-light);
        font-style: italic;
        color: var(--italic-color);
    }

    .ib-place {
        --p-spacing: 0 !important;
    }
</style>
