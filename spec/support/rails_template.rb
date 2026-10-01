# Rails 8.1 generates `stale_when_importmap_changes` into ApplicationController,
# but importmap-rails is not in this bundle (the suite serves assets through
# Sprockets), so the constant never gets defined and loading the controller
# raises NameError.
#
# This has to happen before anything else in this template: `generate` shells
# out to `rails generate`, which boots the app, and `config/environments/test.rb`
# sets `config.eager_load = ENV["CI"].present?` -- so on CI the controller is
# eager-loaded during generation and the template dies on its first model.
# Locally (no CI env var) it stays lazy and only the specs would notice.
gsub_file "app/controllers/application_controller.rb", /^\s*stale_when_importmap_changes\s*\n/, "", verbose: false

# Ensure Sprockets manifest exists (required by Rails 8+)
FileUtils.mkdir_p("app/assets/config")
File.write("app/assets/config/manifest.js",
  "//= link_directory ../javascripts .js\n//= link_directory ../stylesheets .css\n")

generate :model, 'author name:string{10}:uniq last_name:string birthday:date --force'
generate :model, 'post title:string:uniq body:text author:references --force'

inject_into_file "app/models/author.rb", "  validates_presence_of :name\n  validates_uniqueness_of :last_name\n", after: "ApplicationRecord\n"
inject_into_file "app/models/post.rb", "   validates_presence_of :author\n", after: ":author\n"

# Add ransackable_attributes for Ransack 4+
inject_into_file "app/models/author.rb",
  "  def self.ransackable_attributes(auth_object = nil)\n" \
  "    [\"name\", \"last_name\", \"birthday\", \"created_at\"]\n" \
  "  end\n",
  after: "ApplicationRecord\n"

inject_into_file "app/models/post.rb",
  "  def self.ransackable_attributes(auth_object = nil)\n" \
  "    [\"title\", \"body\", \"author_id\"]\n" \
  "  end\n" \
  "  def self.ransackable_associations(auth_object = nil)\n" \
  "    [\"author\"]\n" \
  "  end\n",
  after: "ApplicationRecord\n"

# Add our local Active Admin to the load path (Rails 7.1+)
gsub_file "config/environment.rb",
  'require_relative "application"',
  "require_relative \"application\"\n$LOAD_PATH.unshift('#{File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'lib'))}')\nrequire \"active_admin\"\n"

$LOAD_PATH.unshift(File.join(File.dirname(__FILE__), '..', 'lib'))

generate :'active_admin:install --skip-users'
generate :'formtastic:install'

# Wire the plugin into the dummy app: require the asset, then invoke the
# jQuery plugin on the filters sidebar panel. Without the invocation the
# plugin never runs and no spec can see anything.
inject_into_file "app/assets/javascripts/active_admin.js",
  "//= require active_admin_filters_visibility\n",
  after: "//= require active_admin/base\n"

append_to_file "app/assets/javascripts/active_admin.js", <<~JS
  $(document).ready(function() {
    $('#filters_sidebar_section').activeAdminFiltersVisibility();
  });
JS

run "rm -rf test"
route "root :to => 'admin/dashboard#index'"
rake "db:migrate"

run "rm -f Gemfile Gemfile.lock"
