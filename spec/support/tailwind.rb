require 'fileutils'

# Builds the dummy app's ActiveAdmin stylesheet the way a host does: Tailwind
# with ActiveAdmin's plugin, then the theme (when bundled), then this gem's
# plain CSS.
module TailwindBuild
  module_function

  def run!
    dummy = File.expand_path('../dummy', __dir__)
    aa = Gem.loaded_specs.fetch('activeadmin').full_gem_path
    theme = Gem.loaded_specs['active_admin_theme']&.full_gem_path
    gem_css = File.expand_path('../../app/assets/stylesheets/active_admin_filters_visibility.css', __dir__)

    lines = [
      '@import "tailwindcss";',
      '@custom-variant dark (&:where(.dark, .dark *));',
      %(@plugin "#{aa}/plugin.js";),
      %(@source "#{aa}/app/views";),
      %(@source "#{aa}/lib/active_admin";),
      %(@source "#{aa}/vendor/javascript/flowbite.js";),
      %(@source "#{dummy}/app";)
    ]
    if theme
      lines << %(@import "#{theme}/app/tailwind/active_admin_theme.css";)
      lines << %(@source "#{theme}/app";)
      lines << %(@source "#{theme}/lib";)
    end
    lines << %(@import "#{gem_css}";)

    input = File.join(dummy, 'tmp/active_admin.tailwind.css')
    output = File.join(dummy, 'app/assets/builds/active_admin.css')
    FileUtils.mkdir_p(File.dirname(input))
    File.write(input, lines.join("\n") + "\n")

    cli = Gem.bin_path('tailwindcss-ruby', 'tailwindcss')
    system(cli, '-i', input, '-o', output, out: File::NULL, err: File::NULL) or
      raise 'tailwindcss failed to build the dummy stylesheet'
  end
end
