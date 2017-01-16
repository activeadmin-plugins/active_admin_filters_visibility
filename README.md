# ActiveAdminFiltersVisibility

ActiveAdmin plugin allows to hide any filter from Filters Sidebar.
Useful when page has many filters, but admin user needs only some of them.
Every filter saves its state using browser's LocalStorage. 

![Demonstration](https://raw.githubusercontent.com/activeadmin-plugins/active_admin_filters_visibility/master/screen/example_aa_filters_visibility.gif "Visibility example")

Also you can use drag&drop to change filters order

![Demonstration](https://raw.githubusercontent.com/activeadmin-plugins/active_admin_filters_visibility/master/screen/example_aa_filters_ordering.gif "Ordering example")

## Install

In Gemfile add

```ruby
  gem 'active_admin_filters_visibility', git: 'https://github.com/activeadmin-plugins/active_admin_filters_visibility' 
```

in the 
``` 
  app/assets/javascript/active_admin.coffee
```

and 

```coffeescript
  #= require active_admin_filters_visibility
```

and initialize it with:

```javascript 
  $(document).ready(function() {
    $('#filters_sidebar_section').activeAdminFiltersVisibility();
  });
```

## Customization

```coffeescript
  $('.jquery-selector').activeAdminFiltersVisibility(options)
```

ActiveAdminFiltersVisibility is a standard jQuery Plugin, and accepts some "options" as a hash. 
Default is:

```javascript
{
    sidebarUniqId: function() {
      return window.location.pathname;
    },
    icon: '&#9782;',
    iconClass: '',
    iconStyle: '',
    skipDefaultCss: false,
    title: 'Visibility:',
    ordering: false,
    orderHint: 'Drag&Drop to reorder filters',
    resetOrderButtonTitle: 'Reset order'
}
```

You can change icon - this is a HTML text or symbol. You can pass empty string and customize it with your CSS.
Or you can set class("iconClass") for icon or inline styles("iconStyle").

This plugin has minimal CSS styling. 
In case you want to use custom CSS, default styling can be ignored: 
set ```skipDefaultCss``` to ```true```


### Ordering

By default ordering is disabled. You can turn it: set option ```ordering``` to ```true```.


### Texts
Change text in options: ```title```, ```orderHint``` and ```resetOrderButtonTitle```


### Saving state

Plugin saves list of hidden filters in LocalStorage, using jQuery plugin "Lockr" https://github.com/tsironis/lockr
If you need to save this in cookies or user profile, you should write your own implementation - rewrite "$.fn.activeAdminFiltersVisibility.storage".
For example:

```javascript
$.fn.activeAdminFiltersVisibility.storage = function(storageUniqId) {
    // initialize storage with "storageUniqId"
    // every page(sidebar filters) must has its uniq storageUniqId
    var myStorage = new MyCustomizedStorage(storageUniqId);

    return {
        add: function(labelText) {
            // add hidden filter "labelText" to storage myStorage
            myStorage.add(labelText);
        },
        remove: function(labelText) {
            // drop hidden filter "labelText" to storage myStorage
            // makes filter visible again
            myStorage.remove(labelText);
        },
        has: function(labelText) {
            // check if labelText already hidden(in storage)
            // should return true if exists
            return myStorage.find(labelText) ? true : false;
        },
        all: function() {
            // return array of hidden labels(filters)
            return myStorage.getAll(); // ['Id', 'Name', 'Created At']
        },
        any: function() {
            // check if current Sidebar Filter has some hidden elements
            return this.all().length > 0;
        }
    }
};
```
