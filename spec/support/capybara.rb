require 'capybara/cuprite'

Capybara.server = :puma, { Silent: true }
Capybara.register_driver :cuprite do |app|
  # --no-sandbox and the longer process_timeout keep Chrome starting on
  # GitHub runners, where it sometimes takes over Ferrum's 10s default.
  Capybara::Cuprite::Driver.new(app, headless: true, window_size: [1280, 800],
                                process_timeout: 30,
                                browser_options: { 'no-sandbox': nil })
end
Capybara.default_driver = :cuprite
Capybara.javascript_driver = :cuprite
Capybara.default_max_wait_time = 5
