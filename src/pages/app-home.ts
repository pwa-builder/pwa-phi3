import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import '@fluentui/web-components/button.js';
import '@fluentui/web-components/text-input.js';
import '@fluentui/web-components/label.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() previousMessages: any[] = [];
  @state() loaded: boolean = false;

  query: string = "";

  static styles = [
    styles,
    css`
      main {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      fluent-button svg {
        width: 11px;
        height: 11px;
      }

      fluent-text {
        min-height: 50vh;
        background: #ffffff12;
        border-radius: 4px;
        padding: 8px;
      }

      #actions-menu {
        display: flex;
        gap: 8px;
        flex-direction: row;
        justify-content: space-between;

        margin-bottom: 10px;
      }

      #main-action-block {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #file-data-block {
        display: flex;
        gap: 4px;
      }

      #file-size {
        color: grey;
        font-size: 10px;
      }

      #file-name {
        color: grey;
        font-size: 12px;
        font-weight: bold;

        max-width: 169px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow-x: hidden;
      }

      #file-data-block {
        display: flex;
        flex-direction: column;
      }

      @media(prefers-color-scheme: light) {
        fluent-text {
          background: #f0f0f0;
        }
      }

      @media(max-width: 640px) {
        main {
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
        }
      }
  `];

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');

    window.onload = async () => {
      const { Init } = await import('../services/phi');
      await Init(false);

      this.loaded = true;
    }
  }

  async sendMessage() {
    const { Query } = await import('../services/phi');
    Query(false, this.query, (message: string) => {
      console.log("Message received: ", message);
    });
  }

  handleInputChange(query: string) {
    this.query = query;
  }

  private async copyTranscript() {

  }

  private async shareTranscript() {

  }

  private async downloadTranscript() {

  }

  render() {
    return html`
      <app-header></app-header>

      <main>

        <ul>
          ${
            this.previousMessages.length > 0 ?
            this.previousMessages.map((message: string) => html``) : null
          }
        </ul>

        <div id="toolbar">
          <fluent-text-input @change="${($event: any) => this.handleInputChange($event.target.value)}" ?disabled=${this.loaded === false}>
            <fluent-label>Why is the sky blue?</fluent-label>
          </fluent-text-input>

          <fluent-button @click="${this.sendMessage}" ?disabled=${this.loaded === false} appearance="primary">
            Send message
          </fluent-button>
        </div>
      </main>
    `;
  }
}
