# -*- encoding: utf-8 -*-
$:.push File.expand_path('../lib', __FILE__)
require 'active_admin_filters_visibility/version'

Gem::Specification.new do |s|
  s.name        = 'active_admin_filters_visibility'
  s.version     = ActiveAdminFiltersVisibility::VERSION
  s.authors     = ['Gena M.']
  s.email       = ['workgena@gmail.com']
  s.homepage    = 'https://github.com/workgena/active_admin_filters_visibility'
  s.summary     = %q{active_admin_filters_visibility gem}
  s.description = %q{extension for activeadmin gem to hide any filters from sidebar-filters panel}

  s.add_dependency 'activeadmin'

  # Dev-only paths stay out of the package. `screen/` is two README
  # demo gifs totalling 1.38 MB — 98.5% of the published gem, for
  # images nobody sees outside GitHub. `s.test_files` is dropped:
  # RubyGems deprecated it, and it pointed at files this gem no longer
  # ships.
  s.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features|screen|\.github)/}) }
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ['lib']
end
