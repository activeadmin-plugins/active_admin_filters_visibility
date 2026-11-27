require 'simplecov'
SimpleCov.start do
  add_filter '/spec/'
end

ENV['RAILS_ENV'] = 'test'
require_relative 'dummy/config/environment'

ActiveRecord::Migration.verbose = false
load File.expand_path('support/schema.rb', __dir__)

require 'rspec/rails'
require 'capybara/rspec'
require_relative 'support/capybara'
require_relative 'support/tailwind'

RSpec.configure do |config|
  config.use_transactional_fixtures = false
  config.before(:suite) { TailwindBuild.run! }
  config.after { Author.delete_all }
end
