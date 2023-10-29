<script lang="ts">
    import dayjs, {Dayjs} from 'dayjs';
    import {App, TFile} from 'obsidian';
    import {toDate} from '../parser';
    import {formatAge} from '../format';

    type BirthDays = Array<{ file: TFile, date: Dayjs, title: string }>;

    export let app: App;
    let curDate: Dayjs = dayjs().startOf('month');
    let start: Dayjs;
    let end: Dayjs;
    let dates: Dayjs[] = [];
    let birthDays: BirthDays = [];

    function today() {
        curDate = dayjs().startOf('month');
    }

    function prev() {
        curDate = curDate.subtract(1, 'month');
    }

    function next() {
        curDate = curDate.add(1, 'month');
    }

    function getDates(): Dayjs[] {
        let date = dayjs(start);
        const dates = [];

        while (date.isSame(end, 'date') || date.isBefore(end)) {
            dates.push(date);
            date = date.add(1, 'day');
        }

        return dates;
    }

    function getBirthDays(date: Dayjs): BirthDays {
        return birthDays.filter(birthDay => birthDay.date.isSame(date, 'day'));
    }

    function openNote(file: TFile) {
        app.workspace.openLinkText(file.basename, file.path);
    }

    $: if (curDate) {
        start = dayjs(curDate).startOf('week');
        end = dayjs(curDate).endOf('month').endOf('week');
        dates = getDates();

        birthDays = app.vault.getMarkdownFiles()
            .reduce((files, file): BirthDays => {
                const frontmatter = app.metadataCache.getFileCache(file)?.frontmatter;

                if (frontmatter) {
                    const birthDate = toDate(frontmatter?.birth_date);

                    if (birthDate.isValid() && end.isAfter(birthDate)) {
                        const date = birthDate.year(curDate.year()).hour(12);

                        if (start.isBefore(date) && end.isAfter(date)) {
                            const age = date.diff(birthDate, 'years');
                            const ageInMonths = date.diff(birthDate, 'months');
                            const title = `${file.basename} (${formatAge(age, ageInMonths)})`;
                            files.push({file, date, title});
                        }
                    }
                }

                return files;
            }, [])
            .sort((a, b) => a.file.basename.localeCompare(b.file.basename));
    }
</script>

<div class="ib-header">
    <button on:click={today}>Сегодня</button>
    <button on:click={prev}>◀️</button>
    <button on:click={next}>▶️</button>
    <h3 style="text-transform: capitalize; padding-left: 1rem;">
        { curDate.format('MMMM') } { curDate.format('YYYY') }
    </h3>
</div>

<div class="ib-body">
    <div class="ib-calendar">
        {#if dates.length}
            {#each Array(7) as _, index}
                <div class="ib-calendar__item ib-calendar__item--header">
                    {dates[index].format('dd')}
                </div>
            {/each}
            {#each dates as date, index}
                <div class="ib-calendar__item ib-calendar__item--date"
                     class:ib-calendar__item--secondary={!curDate.isSame(date, 'month')}
                     class:ib-calendar__item--current={dayjs().isSame(date, 'day')}>
                    <div class="ib-calendar__item_title">
                        {date.format('D')}
                        {#if index === 0 || date.date() === 1}
                            {date.format('MMM')}
                        {/if}
                    </div>
                    <div class="ib-calendar__events">
                        {#each getBirthDays(date) as birthDay}
                            <div class="ib-calendar__event"
                                 title={birthDay.title}
                                 on:click={() => openNote(birthDay.file)}>
                                🎁 {birthDay.title}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .ib-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .ib-calendar {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        grid-template-rows: auto;
        border-top: var(--border-width) solid var(--background-modifier-border);
        border-left: var(--border-width) solid var(--background-modifier-border);
    }

    .ib-calendar__item {
        border-bottom: var(--border-width) solid var(--background-modifier-border);
        border-right: var(--border-width) solid var(--background-modifier-border);
        padding: var(--size-4-1);
    }

    .ib-calendar__item--header {
        background-color: var(--background-secondary-alt);
        color: var(--text-accent);
        text-transform: capitalize;
        font-weight: var(--font-bold);
    }

    .ib-calendar__item--date {
        min-height: 8rem;
    }

    .ib-calendar__item--secondary {
        background-color: var(--background-secondary);
    }

    .ib-calendar__item--current {
        background-color: var(--background-modifier-message);
    }

    .ib-calendar__item_title {
        font-weight: var(--font-bold);
        margin-bottom: var(--size-2-1);
    }

    .ib-calendar__events {
        display: flex;
        flex-direction: column;
        gap: var(--size-2-1);
        position: relative;
    }

    .ib-calendar__event {
        font-size: var(--font-small);
        background-color: var(--interactive-accent);
        padding: var(--size-2-1);
        border-radius: var(--radius-s);
        white-space: nowrap;
        width: 100%;
        overflow-x: hidden;
        text-overflow: ellipsis;
        cursor: var(--cursor-link);
    }

    .ib-calendar__event:hover {
        background-color: var(--interactive-accent-hover);
    }
</style>
