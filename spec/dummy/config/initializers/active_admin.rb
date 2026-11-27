ActiveAdmin.setup do |config|
  config.site_title = 'Dummy'
  config.authentication_method = false
  config.current_user_method = false
  config.comments = false
  config.batch_actions = false
end

# The dummy's own module turns ordering on, the way a host configures the
# plugin.
ActiveAdmin.importmap.pin 'filters_visibility_config', to: 'filters_visibility_config.js', preload: false

# The theme's _html_head imports this list. Without the theme the dummy
# overrides _html_head instead (app/views_stock, see config/application.rb).
if defined?(ActiveAdminTheme)
  ActiveAdminTheme.javascripts += %w[active_admin_filters_visibility filters_visibility_config]
end
