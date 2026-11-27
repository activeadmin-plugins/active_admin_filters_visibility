source 'https://rubygems.org'

gemspec

default_rails_version = '8.1.0'
default_activeadmin_version = '4.0.0.beta23'

gem 'rails', "~> #{ENV['RAILS'] || default_rails_version}"
gem 'activeadmin', ENV['AA'] || default_activeadmin_version

group :test do
  gem 'simplecov', require: false
  gem 'rspec-rails'
  gem 'sqlite3', '~> 2.0'
  gem 'propshaft'
  gem 'importmap-rails'
  # Builds the dummy app's ActiveAdmin stylesheet with the plugin CSS.
  gem 'tailwindcss-ruby', '~> 4.0'
  gem 'capybara'
  gem 'cuprite'
  gem 'puma'
end
