export default 'import { State } from "infrontjs";\n' +
'import template from \'./<%= stateName %>Template.html\';\n' +
'export class <%= stateName %>State extends State\n' +
'{\n' +
'    static ROUTE = "/<%= stateId %>";\n' +
'    static ID = "<%= stateId %>";\n' +
'\n' +
'    async enter()\n' +
'    {\n' +
'        console.log( "Hello from state <%= stateName %>" );\n' +
'    }\n' +
'}';
