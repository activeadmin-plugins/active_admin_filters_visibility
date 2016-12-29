(function($) {

    // Plugin definition
    $.fn.activeAdminFiltersVisibility = function(options) {
        var settings = $.extend({}, $.fn.activeAdminFiltersVisibility.defaults, options || {});

        var storageKey = settings.sidebarUniqId(),
            storage = $.fn.activeAdminFiltersVisibility.storage(storageKey),
            panel = $(this);

        if (panel.length > 1) {
            console.log('Cant be applied to multiple sidebars');
            return panel;
        }

        function findFilterWrapperByLabelText(labelText) {
            return panel.find(".filter_form_field label").filter(function() {
                var nodeText = $(this)[0].childNodes[0].textContent;
                return nodeText === labelText;
            }).closest('.filter_form_field');
        }

        function buildCheckboxesHtml() {
            var html = '';

            var labels = panel.find('.filter_form_field label:first-child').map(function() {
                return $(this).text().trim();
            }).get();

            $.each(labels, function(i, text) {
                var checked = storage.has(text) ? '' : 'checked="checked"';
                html += '<div><label><input type="checkbox" value="'+text+'" ' + checked +'> ' + text + '</label></div>';
            });

            return html;
        }

        function renderNotice() {
            var btn = panel.find('.filters-visibility-button');
            if (storage.any()) {
                btn.addClass('active');
            } else {
                btn.removeClass('active');
            }
        }

        function render() {
            // Button
            panel.find('h3:first')
                .append('<span class="filters-visibility-button" class="' + settings.iconClass + '" style="' + settings.iconStyle + '">' + settings.icon + '</span>');

            // Settings Panel
            panel.find('.panel_contents').prepend(
                '<div class="filters-visibility-panel">' +
                    '<div><strong>' + settings.title + '</strong></div>' +
                    buildCheckboxesHtml() +
                '</div>'
            );

            // Hide filters
            $.each(storage.all(), function(i, labelText) {
                findFilterWrapperByLabelText(labelText).hide();
            });

            // Mark button if some filters are hidden
            renderNotice();
        }



        function hide(labelText) {
            findFilterWrapperByLabelText(labelText).hide();
            storage.add(labelText);
            renderNotice();
        }

        function show(labelText) {
            findFilterWrapperByLabelText(labelText).show();
            storage.remove(labelText);
            renderNotice();
        }


        // apply styles
        if (settings.skipDefaultCss == false) {
            $.fn.activeAdminFiltersVisibility.css();
        }


        panel.on('click', '.filters-visibility-button', function() {
            panel.find('.filters-visibility-panel').toggle();
        });

        panel.on('change', '.filters-visibility-panel input[type=checkbox]', function() {
            var $this = $(this),
                labelText = $this.parent().text().trim();

            if ($this.prop('checked')) {
                show(labelText);
            } else {
                hide(labelText);
            }
        });

        render();

        return panel;
    };


    // Plugin Storage method
    $.fn.activeAdminFiltersVisibility.storage = function(storageUniqId) {
        // https://github.com/tsironis/lockr
        var Lockr = function(){"use strict";Array.prototype.indexOf||(Array.prototype.indexOf=function(a){var b=this.length>>>0,c=Number(arguments[1])||0;for(c=c<0?Math.ceil(c):Math.floor(c),c<0&&(c+=b);c<b;c++)if(c in this&&this[c]===a)return c;return-1});var a={};return a.prefix="",a._getPrefixedKey=function(a,b){return b=b||{},b.noPrefix?a:this.prefix+a},a.set=function(a,b,c){var d=this._getPrefixedKey(a,c);try{localStorage.setItem(d,JSON.stringify({data:b}))}catch(c){console&&console.warn("Lockr didn't successfully save the '{"+a+": "+b+"}' pair, because the localStorage is full.")}},a.get=function(a,b,c){var e,d=this._getPrefixedKey(a,c);try{e=JSON.parse(localStorage.getItem(d))}catch(a){e=localStorage[d]?{data:localStorage.getItem(d)}:null}return null===e?b:"object"==typeof e&&"undefined"!=typeof e.data?e.data:b},a.sadd=function(b,c,d){var f,e=this._getPrefixedKey(b,d),g=a.smembers(b);if(g.indexOf(c)>-1)return null;try{g.push(c),f=JSON.stringify({data:g}),localStorage.setItem(e,f)}catch(a){console.log(a),console&&console.warn("Lockr didn't successfully add the "+c+" to "+b+" set, because the localStorage is full.")}},a.smembers=function(a,b){var d,c=this._getPrefixedKey(a,b);try{d=JSON.parse(localStorage.getItem(c))}catch(a){d=null}return null===d?[]:d.data||[]},a.sismember=function(b,c,d){return a.smembers(b).indexOf(c)>-1},a.keys=function(){var b=[],c=Object.keys(localStorage);return 0===a.prefix.length?c:(c.forEach(function(c){c.indexOf(a.prefix)!==-1&&b.push(c.replace(a.prefix,""))}),b)},a.getAll=function(){var b=a.keys();return b.map(function(b){return a.get(b)})},a.srem=function(b,c,d){var f,g,e=this._getPrefixedKey(b,d),h=a.smembers(b,c);g=h.indexOf(c),g>-1&&h.splice(g,1),f=JSON.stringify({data:h});try{localStorage.setItem(e,f)}catch(a){console&&console.warn("Lockr couldn't remove the "+c+" from the set "+b)}},a.rm=function(a){localStorage.removeItem(a)},a.flush=function(){a.prefix.length?a.keys().forEach(function(b){localStorage.removeItem(a._getPrefixedKey(b))}):localStorage.clear()},a}();

        return {
            add: function(labelText) {
                Lockr.sadd(storageUniqId, labelText);
            },
            remove: function(labelText) {
                Lockr.srem(storageUniqId, labelText);
            },
            has: function(labelText) {
                return Lockr.sismember(storageUniqId, labelText);
            },
            all: function() {
                return Lockr.smembers(storageUniqId);
            },
            any: function() {
                return this.all().length > 0;
            }
        }
    };


    // Style
    $.fn.activeAdminFiltersVisibility.css = function() {
        var lines = [];

        lines.push('.filters-visibility-button { margin: 0 5px 0 5px; padding: 0 4px 0 4px; background-color: rgba(0, 0, 0, 0.05); float: right; cursor: pointer; }');
        lines.push('.filters-visibility-button.active { color: #007ab8; }');
        lines.push('.filters-visibility-panel { display: none; border-left: 10px solid rgba(0, 0, 0, 0.1); background-color: rgba(0, 0, 0, 0.02); margin-bottom: 10px; }');
        lines.push('.filters-visibility-panel > div { margin-left: 5px; }');

        var sheet = document.createElement('style');
        sheet.type = 'text/css';
        sheet.innerHTML = lines.join(' ');
        document.body.appendChild(sheet);
    };


    // Plugin defaults
    $.fn.activeAdminFiltersVisibility.defaults = {
        sidebarUniqId: function() {
            return window.location.pathname;
        },
        icon: '&#9782;',
        iconClass: '',
        iconStyle: '',
        skipDefaultCss: false,
        title: 'Visibility:'
    };

})(jQuery);
