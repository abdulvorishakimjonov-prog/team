Do not comment in code, if really necessary 1 or 2 words max;
Do not change the main.js without permission, in js is asked to write prefer writing after initial section script tag and its contents inside IIFE
gulp always runs and watches so do not try to launch gulp or change the gulp related files only inside src

Scss structure

src/scss/
  main.scss       — entry point, only @use imports
  _config.scss    — reset, base tags, utilities
  _layout.scss    — imports layout/*
  _pages.scss     — imports pages/*
  config/
    _variables.scss — CSS vars, breakpoints, colors
    _mixins.scss    — font(), devices(), line-fix()
  layout/         — reusable components
  pages/          — page-specific styles

Conventions:
- partials use leading underscore: _file.scss
- import without underscore: @use './layout/header'
- no CSS output from config/
- use devices() mixin for media queries
- use nested scss classes with kebab case

Components

src/components/
  layout/  — head, header, footer....
  section/ — about, hero...

Usage:
- copy blank.html for new pages
- include components via build includes or copy markup
- keep components self-contained; use inline scripts inside pages
- page structure : news.html - main page, news-view.html the one main page links all items
 

Libraries

- do not edit files in src/assets/libs/ 

Git

- DO NOT TOUCH GIT
 

 
