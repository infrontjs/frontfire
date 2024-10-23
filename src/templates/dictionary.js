export default 'export default {\n'+
'<% for ( let ki = 0; ki < newDict.length; ki++ ) {   %>\n' +
'   "<%= newDict[ ki ].key %>" : {\n' +
'<% for( let ti = 0; ti < newDict[ ki ].trans.length; ti++ ) { %>' +
'<% if ( newDict[ ki ].trans[ ti ].val === null ) { %>' +
'       "<%= newDict[ ki ].trans[ ti ].cc; %>" : null<%= ((ti+1) < newDict[ ki ].trans.length) ? "," : "" %>' +
'<% } else { %>' +
'       "<%= newDict[ ki ].trans[ ti ].cc; %>" : "<%= newDict[ ki ].trans[ ti ].val; %>"<%= ((ti+1) < newDict[ ki ].trans.length) ? "," : "" %>' +
'<% } %>' +
'<% if ((ti+1) < newDict[ ki ].trans.length) { %> ' +
'\n' +
'<% } %>' +
'<% } %>\n' +
'   }<%= ((ki+1) < newDict.length) ? "," : "" %>\n' +
'<% }    %>\n' +
'};';
