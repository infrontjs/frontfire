export default '' +
'// import * as IF from "infrontjs";\n' +
'import template from "./template.html";\n' +
'class <%= className %> extends HTMLElement\n' +
'{\n' +
'    constructor()\n' +
'    {\n' +
'        super();\n' +
'        this._isConnected = false;\n' +
'    }\n' +
'\n' +
'    connectedCallback()\n' +
'    {\n' +
'        if ( false === this._isConnected )\n' +
'        {\n' +
'            // Resolve default InfrontJS instance\n' +
'            // this.app = IF.App.get();\n' +
'            this.render();\n' +
'\n' +
'            this._isConnected = true;\n' +
'        }\n' +
'    }\n' +
'\n' +
'    render()\n' +
'    {\n' +
'        // Eg. Render template\n' +
'        // this.innerHTML = this.app.view.getHtml( template, { user : this.app.user } );\n' +
'        this.innerHTML = template;\n' +
'    }\n' +
'}\n' +
'\n' +
'customElements.define(<%= wcName %>, <%= className %> );'
