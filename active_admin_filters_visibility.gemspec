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

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ['lib']
end
