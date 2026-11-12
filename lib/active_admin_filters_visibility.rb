require 'activeadmin'
require 'active_admin_filters_visibility/version'

module ActiveAdminFiltersVisibility
  JAVASCRIPT_MODULE = 'active_admin_filters_visibility'

  module Rails
    class Engine < ::Rails::Engine
      # ActiveAdmin renders its own import map, ActiveAdmin.importmap, so the
      # module is pinned there. A host without importmap-rails bundles the npm
      # package instead.
      initializer 'active_admin_filters_visibility.importmap', after: 'active_admin.importmap' do |app|
        next unless app.config.respond_to?(:importmap)

        ActiveAdmin.importmap.draw(root.join('config', 'importmap.rb'))
        app.config.assets.paths << root.join('app/javascript') if app.config.respond_to?(:assets)
      end

      # javascript_modules comes from activeadmin/activeadmin#9148. Without it,
      # or without importmap-rails (nothing pinned), the host imports the
      # module itself (see README).
      config.after_initialize do |app|
        if app.config.respond_to?(:importmap) && ActiveAdmin.application.respond_to?(:javascript_modules)
          ActiveAdmin.application.javascript_modules |= [JAVASCRIPT_MODULE]
        end
      end
    end
  end
end
