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
        var Lockr = function(){
            if (!Array.prototype.indexOf) {
                Array.prototype.indexOf = function(elt)
                {
                    var len = this.length >>> 0;

                    var from = Number(arguments[1]) || 0;
                    from = (from < 0)
                        ? Math.ceil(from)
                        : Math.floor(from);
                    if (from < 0)
                        from += len;

                    for (; from < len; from++)
                    {
                        if (from in this &&
                            this[from] === elt)
                            return from;
                    }
                    return -1;
                };
            }

            var Lockr = {};

            Lockr.prefix = "";

            Lockr._getPrefixedKey = function(key, options) {
                options = options || {};

                if (options.noPrefix) {
                    return key;
                } else {
                    return this.prefix + key;
                }

            };

            Lockr.set = function (key, value, options) {
                var query_key = this._getPrefixedKey(key, options);

                try {
                    localStorage.setItem(query_key, JSON.stringify({"data": value}));
                } catch (e) {
                    if (console) console.warn("Lockr didn't successfully save the '{"+ key +": "+ value +"}' pair, because the localStorage is full.");
                }
            };

            Lockr.get = function (key, missing, options) {
                var query_key = this._getPrefixedKey(key, options),
                    value;

                try {
                    value = JSON.parse(localStorage.getItem(query_key));
                } catch (e) {
                    if(localStorage[query_key]) {
                        value = {data: localStorage.getItem(query_key)};
                    } else{
                        value = null;
                    }
                }
                if(value === null) {
                    return missing;
                } else if (typeof value === 'object' && typeof value.data !== 'undefined') {
                    return value.data;
                } else {
                    return missing;
                }
            };

            Lockr.sadd = function(key, value, options) {
                var query_key = this._getPrefixedKey(key, options),
                    json;

                var values = Lockr.smembers(key);

                if (values.indexOf(value) > -1) {
                    return null;
                }

                try {
                    values.push(value);
                    json = JSON.stringify({"data": values});
                    localStorage.setItem(query_key, json);
                } catch (e) {
                    console.log(e);
                    if (console) console.warn("Lockr didn't successfully add the "+ value +" to "+ key +" set, because the localStorage is full.");
                }
            };

            Lockr.smembers = function(key, options) {
                var query_key = this._getPrefixedKey(key, options),
                    value;

                try {
                    value = JSON.parse(localStorage.getItem(query_key));
                } catch (e) {
                    value = null;
                }

                if (value === null)
                    return [];
                else
                    return (value.data || []);
            };

            Lockr.sismember = function(key, value, options) {
                return Lockr.smembers(key).indexOf(value) > -1;
            };

            Lockr.keys = function() {
                var keys = [];
                var allKeys = Object.keys(localStorage);

                if (Lockr.prefix.length === 0) {
                    return allKeys;
                }

                allKeys.forEach(function (key) {
                    if (key.indexOf(Lockr.prefix) !== -1) {
                        keys.push(key.replace(Lockr.prefix, ''));
                    }
                });

                return keys;
            };

            Lockr.getAll = function () {
                var keys = Lockr.keys();
                return keys.map(function (key) {
                    return Lockr.get(key);
                });
            };

            Lockr.srem = function(key, value, options) {
                var query_key = this._getPrefixedKey(key, options),
                    json,
                    index;

                var values = Lockr.smembers(key, value);

                index = values.indexOf(value);

                if (index > -1)
                    values.splice(index, 1);

                json = JSON.stringify({"data": values});

                try {
                    localStorage.setItem(query_key, json);
                } catch (e) {
                    if (console) console.warn("Lockr couldn't remove the "+ value +" from the set "+ key);
                }
            };

            Lockr.rm =  function (key) {
                localStorage.removeItem(key);
            };

            Lockr.flush = function () {
                if (Lockr.prefix.length) {
                    Lockr.keys().forEach(function(key) {
                        localStorage.removeItem(Lockr._getPrefixedKey(key));
                    });
                } else {
                    localStorage.clear();
                }
            };
            return Lockr;

        }();

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
