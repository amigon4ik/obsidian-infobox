import {ItemView, MarkdownRenderChild, Plugin, WorkspaceLeaf} from 'obsidian';
import Infobox from './ui/Infobox.svelte';
import Calendar from './ui/Calendar.svelte';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ru';

dayjs.extend(localizedFormat);
dayjs.locale('ru');

const CALENDAR_VIEW_TYPE = 'infobox-calendar-view';

class CalendarView extends ItemView {
    component: Calendar;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return CALENDAR_VIEW_TYPE;
    }

    getDisplayText() {
        return 'Calendar';
    }

    async onOpen() {
        this.component = new Calendar({
            target: this.contentEl,
            props: {app: this.app},
        });
    }

    async onClose() {
        this.component?.$destroy();
    }
}

export default class InfoboxPlugin extends Plugin {
    async onload() {
        this.registerView(CALENDAR_VIEW_TYPE, (leaf: WorkspaceLeaf) => {
            return new CalendarView(leaf);
        });

        this.addRibbonIcon('calendar-with-checkmark', 'Open calendar view', async () => {
            const leaf = this.app.workspace.getLeaf(true);
            this.app.workspace.setActiveLeaf(leaf);
            await leaf.setViewState({type: CALENDAR_VIEW_TYPE});
        });

        this.registerMarkdownCodeBlockProcessor(
            'infobox',
            (source, containerEl, ctx) => {
                const node = containerEl.createEl('div');

                const infobox = new Infobox({
                    target: containerEl,
                    props: {ctx, app: this.app, plugin: this},
                });

                class UnloadInfobox extends MarkdownRenderChild {
                    onunload() {
                        infobox.$destroy();
                    }
                }

                ctx.addChild(new UnloadInfobox(node));
            }
        );
    }
}
