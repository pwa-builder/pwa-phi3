import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import '@fluentui/web-components/button.js';
import '@fluentui/web-components/text-input.js';
import '@fluentui/web-components/text.js';
import '@fluentui/web-components/label.js';

import { styles } from '../styles/shared-styles';

import { classMap } from 'lit/directives/class-map.js';

import '../components/loading-toast';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() previousMessages: any[] = [];
  @state() loaded: boolean = false;

  @state() query: string | undefined = undefined;

  static styles = [
    styles,
    css`
      main {
        display: flex;
        flex-direction: column;
        gap: 8px;

        height: -webkit-fill-available;
        justify-content: space-between;
      }

      #no-messages {
        margin-top: 14px;
      }

      fluent-button svg {
        width: 11px;
        height: 11px;
      }

      fluent-text {
        border-radius: 4px;
        padding: 8px;
        display: block;
        color: white;
        background: #292929;
        min-height: 40px;
        display: flex;
        align-items: center;
      }

      fluent-text-input {
        flex: 1;
        max-width: unset;
      }

      fluent-text-input::part(root) {
        background: #292929;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        gap: 8px;
        flex-direction: column;

        max-height: 86vh;
        overflow-y: auto;
      }

      ul::-webkit-scrollbar {
        display: none;
      }

      li {
        margin-right: 50vw;
        animation: quickUp 0.2s;
      }

      li.assistant {
        margin-left: 50vw;
        margin-right: unset;
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

      #toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
      }

      @keyframes quickUp {
        0% {
          transform: translateY(0);
        }

        100% {
          transform: translateY(-10px);
        }
      }

      @media(prefers-color-scheme: light) {
        fluent-text {
          background: white;
          color: black;
        }

        fluent-text-input::part(root) {
          background: white;
        }
      }
  `];

  async firstUpdated() {
    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');


    const { Init } = await import('../services/phi');
    await Init(false);


    this.loaded = true;

    //set up to listen for the enter button
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (this.query && this.query.length > 0) {
          this.sendMessage();
        }
      }
    });
  }

  async sendMessage() {
    this.previousMessages = [
      ...this.previousMessages,
      {
        type: "user",
        content: this.query || ""
      }
    ];

    // make copy to use below
    let origQuery = this.query

    // reset this.query
    this.query = undefined;


    let completeMessage = "";

    this.previousMessages = [
      ...this.previousMessages,
      {
        type: "assistant",
        content: ""
      }
    ];

    const { Query } = await import('../services/phi');
    await Query(false, origQuery, (message: string) => {
      console.log("Message received: ", message);
      completeMessage = message;

      // update last previous message.content
      this.previousMessages[this.previousMessages.length - 1].content = completeMessage;
      this.requestUpdate();
    });
  }

  handleInputChange(query: string) {
    this.query = query;
  }

  render() {
    return html`
      <app-header></app-header>

      ${this.loaded === false ? html`<loading-toast></loading-toast>` : null}

      <main>

        ${this.previousMessages && this.previousMessages.length > 0 ? html`
        <ul>
          ${this.previousMessages.map((message) => html`
              <li class=${classMap({ assistant: message.type === "assistant" })}>
                <fluent-text>${message.content}</fluent-text>
              </li>
            `)
      }
        </ul>` : html`
          <div id="no-messages">
            <fluent-text appearance="subtle">No messages yet</fluent-text>
          </div>
        `}

        <div id="toolbar">
          <fluent-text-input appearance="filled-lighter" @change="${($event: any) => this.handleInputChange($event.target.value)}" .value="${this.query || ""}" ?disabled=${this.loaded === false}>
          </fluent-text-input>

          <fluent-button @click="${this.sendMessage}" ?disabled=${this.loaded === false} appearance="primary">
            Send message
          </fluent-button>
        </div>
      </main>
    `;
  }
}
