def add_author_resource(options = {}, &block)

  ActiveAdmin.register Author do
    config.filters = true
  end

  Rails.application.reload_routes!

end
