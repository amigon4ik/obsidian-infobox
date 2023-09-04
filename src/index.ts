import {MarkdownRenderChild, Plugin} from 'obsidian';
import Infobox from './ui/Infobox.svelte';

export default class InfoboxPlugin extends Plugin {
    async onload() {
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
