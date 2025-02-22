# sleek
## sleek is a todo app based on todo.txt, free and open-source. Available for Linux, Windows and MacOS
sleek is an open-source todo app that makes use of the todo.txt format. sleeks GUI is modern and clean yet offers a decent set of functions which help users getting things done. sleek is available as a client for Windows, MacOS and Linux.

By using sleeks GUI or simply writing in plain text todo.txt format, users can add contexts, projects, priorities, due dates or recurrences to their todos and use these todo.txt attributes as filters or search for them by full text search.

sleek watches todo.txt files continuously for changes so it can be used with other todo.txt apps. Users can switch between bright and dark mode, choose several languages and manage multiple todo.txt files.

The todo list can be sorted and grouped by priorities or due dates. Todos with due date or repeating todos will trigger alarms with thresholds of 1 or 2 days before the due date. Completed todos can be hidden or archived into separate done.txt files and if users have tons of todos, a compact view can come in handy.

![Alt text](assets/screenshots/mac/main.png?raw=true "Screenshot of sleek's main view as seen on MacOS")
![Alt text](assets/screenshots/mac/main_filter_dark.png?raw=true "Screenshot of sleek's filter drawer in dark mode as seen on MacOS")

### Get it from Microsoft Store
You can install sleek from Microsofts Windows Store

<a href='//www.microsoft.com/store/apps/9NWM2WXF60KR?cid=storebadge&ocid=badge'><img src='https://developer.microsoft.com/store/badges/images/English_get-it-from-MS.png' alt='English badge' width='180'/></a>

### Get it from Snap Store
You can install sleek from Canonicals Snap Store using: `sudo snap install sleek`

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/sleek)

### Get it from Flathub
Install sleek from <a href="https://flathub.org/apps/details/com.github.ransome1.sleek">Flathub</a> using: `flatpak install flathub com.github.ransome1.sleek`

Run it using: `flatpak run com.github.ransome1.sleek`

<a href='https://flathub.org/apps/details/com.github.ransome1.sleek'><img width='180' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

### Download the binary
You can download sleek for Windows, MacOS and Linux on the <a href="https://github.com/ransome1/sleek/releases/latest">release page</a>.

### This app is open source and you can help this project by
* contributing <a href="https://github.com/ransome1/sleek/issues">bug reports, code improvements, features or simply suggest new features</a>.
* opting in to the optional Matomo tracking feature. It's fully anonymized, and the data will give me a basic idea on which functions are actually used and which ones don't have a benefit you.
* translating sleek into your own language and contributing your translations. To do so just duplicate the "src/locales/en" folder, rename it according to your language code, do your translations in the "translation.json" file and send me a <a href="https://help.github.com/articles/using-pull-requests/">pull request</a>. I will include your translations into the next release.

### Features
* An existing todo.txt file can be used or a new one can be created
* Todos can be
  - added
  - edited
  - marked as complete (and vice versa)
  - deleted
* Dark and light mode can be toggled
* A compact view is available
* Completed todos can be bulk archived to a separate done.txt ([name of todo file]_done.txt) file
* Completed todos can be shown or hidden
* Todos can be enriched by
  - contexts
  - projects
  - start dates
  - due dates
* Multi line todos can be created
* A due date can be set using a datepicker
* Todos can repeat themselves based on a given due date. You can use a dedicated picker to add the recurrence or type it in by hand:
  - "rec:d" (daily)
  - "rec:w" (weekly)
  - "rec:m" (monthly)
  - "rec:y" (annually)
  - also more specific recurrences are possible: "rec:2d" (every 2nd day)
* Available contexts and projects will be suggested according to your input
* Todos can be filtered by contexts and projects
* Todos can be sorted and grouped either by their priorities or due dates
* Filters are sorted alphanummerically
* Todos can be looked up using full-text search
* Hyperlinks are detected automatically and can be clicked using the icon
* Alarms will be triggered when a todo is due tomorrow or today
* Todos that include either contexts or projects can be shown or hidden entirely
* A file watcher rereads the file if it has been changed
* Multiple todo.txt files can be managed
* Multiple languages are automatically detected or can be set by hand
  - English
  - German
  - Italian
  - Spanish
  - French
* Tabindex available
* Existing todos can be used as templates for new ones
* Basic keyboard shortcuts are available:
  - New todo: CMD/CTRL + n
  - Find todo: CMD/CTRL + f
  - Show or hide completed todos: CMD/CTRL + h
  - Toggle dark mode: CMD/CTRL + d
  - Open file: CMD/CTRL + o
  - Open settings: CMD/CTRL + ,
  - Toggle side bar: CMD/CTRL + b
  - Set priorities (available when add/edit window is open): CTRL+SHIFT+[A-Z]

### Used libraries
- Electron: https://github.com/electron/electron
- Electron builder: https://github.com/electron-userland/electron-builder
- Electron packager (only for the Snap builds): https://github.com/electron/electron-packager
- electron-util: https://github.com/sindresorhus/electron-util
- Bulma CSS: https://github.com/jgthms/bulma
- Font Awesome: https://github.com/FortAwesome/Font-Awesome
- jsTodoTxt: https://github.com/jmhobbs/jsTodoTxt
- autolink-js: https://github.com/bryanwoods/autolink-js
- vanillajs-datepicker: https://github.com/mymth/vanillajs-datepicker
- i18next: https://github.com/i18next/i18next
- Matomo: https://github.com/matomo-org/matomo
