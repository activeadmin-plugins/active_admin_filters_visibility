# ActiveAdminFiltersVisibility

ActiveAdmin plugin allows to hide any filter from Filters Sidebar.
Useful when page has many filters, but admin user needs only some of them.
Every filter saves its state using browser's LocalStorage. 

![Demonstration](https://raw.githubusercontent.com/activeadmin-plugins/active_admin_filters_visibility/master/screen/example_aa_filters_visibility.gif "Example")

## Install

In Gemfile add

```ruby
  gem 'active_admin_filters_visibility', git: 'https://github.com/activeadmin-plugins/active_admin_filters_visibility' 
```

in the 
``` 
  app/assets/javascript/active_admin.coffe 
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
    title: 'Visibility:'
}
```

You can change icon - this is a HTML text or symbol. You can pass empty string and customize it with your CSS.
Ou you can set class("iconClass") for icon or inline styles("iconStyle").

This plugin has minimal CSS styling. 
In case you want to use custom CSS, default styling can be ignored: 
set ```skipDefaultCss``` to ```true```

Plugin has only one text message - "title". It can be changed, example: ```title: "Unchecked filters will be hidden"```

### Saving state

Plugin saves list of hidden filters in LocalStorage, using jQuery plugin "Lockr" https://github.com/tsironis/lockr
It can be changed by overriding this object:

```javascript
$.fn.activeAdminFiltersVisibility.storage = function(storageUniqId) {
    // initialize storage with "storageUniqId"
    // every page(sidebar filters) must has its uniq storageUniqId
    var myStorage = MyCustomizedStorage(storageUniqId);
    return {
        add: function(labelText) {
            // add hidden filter "labelText" to storage myStorage
            this.myStorage.add(labelText);
        },
        remove: function(labelText) {
            // drop hidden filter "labelText" to storage myStorage
            // makes filter visible again
            this.myStorage.remove(labelText);
        },
        has: function(labelText) {
            // check if labelText already hidden(in storage)
            // should return true if exists
            var exists = this.myStorage.find(labelText) ? true : false;
            return exists; // true or false
        },
        all: function() {
            // return array of strings(labels)
            // this is hidden filters
            return this.myStorage.getAll(); // ['Id', 'Name', 'Created At']
        },
        any: function() {
            // check if current Sidebar Filter has some hidden elements
            // needs for showing indicator
            return this.all().length > 0;
        }
    }
};
```
