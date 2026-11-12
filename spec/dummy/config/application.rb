# Minimal ActiveAdmin 4 host (importmap + propshaft). The stylesheet is built
# by spec/support/tailwind.rb before the suite runs.
require 'rails'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_view/railtie'
require 'propshaft'
require 'importmap-rails'

# Loaded only by gemfiles/active_admin_theme.gemfile.
begin
  require 'active_admin_theme'
rescue LoadError
  nil
end
require 'active_admin'
require 'active_admin_filters_visibility'

module Dummy
  class Application < Rails::Application
    config.root = File.expand_path('..', __dir__)
    config.load_defaults Rails::VERSION::STRING.to_f
    config.eager_load = false
    config.consider_all_requests_local = true
    config.secret_key_base = 'dummy-secret-key-base-for-tests-only'
    config.hosts.clear
    config.active_support.deprecation = :stderr
    config.logger = Logger.new(nil)
    config.public_file_server.enabled = true

    # Stock ActiveAdmin 4.0.0.beta23 has no javascript_modules setting, so the
    # dummy imports the module from an _html_head override, as the README
    # tells hosts to. The theme brings its own _html_head.
    config.paths['app/views'] << 'app/views_stock' unless defined?(ActiveAdminTheme)
  end
end
