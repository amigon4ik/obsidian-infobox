import {MarkdownRenderChild, Plugin} from 'obsidian';

import InfoboxView from './ui/InfoboxView.svelte';

export default class InfoboxPlugin extends Plugin {
    async onload() {
        this.registerMarkdownCodeBlockProcessor(
            'infobox',
            (source, containerEl, ctx) => {
                const node = containerEl.createEl('div');

                const svelteComponent = new InfoboxView({
                    target: containerEl,
                    props: {ctx, app: this.app},
                });

                class UnloadSvelteComponent extends MarkdownRenderChild {
                    onunload() {
                        svelteComponent.$destroy();
                    }
                }

                ctx.addChild(new UnloadSvelteComponent(node));
            }
        );
    }
}
