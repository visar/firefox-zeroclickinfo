/*
 * Copyright (C) 2012 DuckDuckGo, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

self.port.emit('get-options');
var options = [];
self.port.on('set-options', function(opt){
    options = opt['options'];
});

var ddgBox = new DuckDuckBox({
                inputName: 'q',
                forbiddenIDs: [],
                contentDiv: (document.getElementById('b_results')) ? 'b_results' : 'results_container',
                className: 'bing',
                debug: options.dev
              });

ddgBox.search = function(query) {
self.port.emit('load-results', {'query': query});
    self.port.on('results-loaded', function(data) {
        // ditch the InstantAnswer Box if there is a Bing Calc one
        if (document.getElementById('rcCalB') !== null) {
            return true;
        }

        ddgBox.renderZeroClick(data.response, query);
    });

    if (options.dev)
        console.log("query:", query);
}

var ddg_timer;

function getQuery(direct) {
    var instant = document.getElementsByClassName("gssb_a");
    if (instant.length !== 0 && !direct){
        var selected_instant = instant[0];
        
        var query = selected_instant.childNodes[0].childNodes[0].childNodes[0].
                    childNodes[0].childNodes[0].childNodes[0].innerHTML;
        query = query.replace(/<\/?(?!\!)[^>]*>/gi, '');

        if(options.dev)
            console.log(query);

        return query;
    } else {
        return document.getElementsByName('q')[0].value;
    }
}

function qsearch(direct) {
    var query = getQuery(direct);
    ddgBox.lastQuery = query;
    ddgBox.search(query);
} 

// instant search

$('[name="q"]').keyup(function(e){
    var query = getQuery();
    if(ddgBox.lastQuery !== query && query !== '')
        ddgBox.hideZeroClick();

    if(options.dev)
        console.log(e.keyCode);

    var direct = false;
    if(e.keyCode == 40 || e.keyCode == 38)
        direct = true;

    clearTimeout(ddg_timer);
    ddg_timer = setTimeout(function(){
        qsearch(direct);
    }, 700);
   
});

$('[name="go"]').click(function(){
    qsearch();
});

ddgBox.init();

