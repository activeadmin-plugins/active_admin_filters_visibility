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

  # Whitelist, not a reject list: a new directory in the repo does not
  # reach consumers until it is named here. The reject form needs a new
  # pattern every time the repo grows one, and that is how 1.3 MB of
  # README gifs under screen/ ended up published in the first place.
  s.files         = `git ls-files -z -- lib app vendor config exe bin README.md LICENSE`.split("\x0")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ['lib']
end
