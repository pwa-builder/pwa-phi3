import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@fluentui/web-components/spinner.js';

@customElement('loading-toast')
export class LoadingToast extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }

            #toast {
                position: fixed;
                top: 10px;
                left: 40vw;
                right: 40vw;

                padding: 8px;
                padding-left: 12px;
                padding-right: 12px;
                background: #292929;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
                border-radius: 8px;

                justify-content: space-between;
                font-size: 14px;

                animation: quickFromTop 0.3s ease-out;
            }

            @media(max-width: 640px) {
                #toast {
                    left: 10px;
                    right: 10px;
                }
            }

            @keyframes quickFromTop {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }
        `
    ];

    render() {
        return html`
          <div id="toast">
            <span>Loading model...</span>

            <fluent-spinner appearance="primary" size="extra-small"></fluent-spinner>
          </div>
        `;
    }
}
