import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import '@fluentui/web-components/button.js';
import '@fluentui/web-components/text-input.js';
import '@fluentui/web-components/text.js';

import { styles } from '../styles/shared-styles';

import { classMap } from 'lit/directives/class-map.js';

import '../components/loading-toast';
import '../components/message-skeleton';

@customElement('app-home')
export class AppHome extends LitElement {

  @property() message = 'Welcome!';

  @state() previousMessages: any[] = [];
  @state() loaded: boolean = false;

  @state() query: string | undefined = undefined;

  phiWorker: Worker | undefined;

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

      fluent-text p {
        font-size: 16px;
      }

      li.assistant fluent-text {
        background: #292929;
      }

      li fluent-text {
        background: var(--colorBrandBackground);
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
    this.phiWorker = new Worker(
      new URL('../services/phi.ts', import.meta.url),
      { type: 'module' }
    );

    console.log("phiWorker", this.phiWorker)
    this.phiWorker.onmessage = (event: any) => {
      if (event.data.type === "loaded") {
        this.loaded = true;
      }
    }

    this.phiWorker.postMessage({ type: "Init" });


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
    const marked = await import('marked');

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
        content: "<message-skeleton></message-skeleton>"
      }
    ];

    this.phiWorker!.onmessage = async (event: any) => {
      if (event.data.type === "response") {
        const message = event.data.response;
        completeMessage = message;

        this.previousMessages[this.previousMessages.length - 1].content = await marked.parse(completeMessage);

        this.previousMessages = this.previousMessages;

        this.requestUpdate();
      }
    }

    this.phiWorker!.postMessage({
      type: "Query",
      continuation: false,
      prompt: origQuery
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
                <fluent-text .innerHTML="${message.content}"></fluent-text>
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
