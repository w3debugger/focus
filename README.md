&nbsp;
<p align="center">
  <img src="https://raw.githubusercontent.com/w3debugger/focus/master/icon.png" alt="Focus - Focus on the tasks at hand" />
</p>
<h3 align="center">Focus</h3>
<p align="center">
  Simply focus on the tasks in your browser tab.
</p>


<p align="center">
    <a href="https://chrome.google.com/webstore/detail/focus-to-keep-you-focused/mbndklaohlplphnlfafdlcnbdgklkojd" target="_blank">Chrome</a> |
    <a href="https://addons.mozilla.org/en-US/firefox/addon/focus-focus-on-tasks-at-hand/?src=search" target="_blank">Firefox</a> |
    <a href="https://w3debugger.github.io/focus/" target="_blank" >Web Version</a> 
</p>

<br />

<p align="center">
    <img src="" width="800" />
</p>

<a id="installation"></a>
# Installation

<a id="installation-chrome"></a>
### Chrome and Chromium-based browsers
You can get the latest available Focus Extension version from the [Chrome Web Store](https://chrome.google.com/webstore/detail/focus-to-keep-you-focused/mbndklaohlplphnlfafdlcnbdgklkojd).

<a id="installation-firefox"></a>
### Firefox
You can get the latest version of Focus Extension from the [Mozilla Add-ons website](https://addons.mozilla.org/en-US/firefox/addon/focus-focus-on-tasks-at-hand/?src=search).

<a id="contribution"></a>
# Contribution
### Requirements

- [nodejs](https://nodejs.org/en/download/)

Globally install sass:
```
  npm i -g sass
```

Clone this repo (alternatively click download and extract zip file):
```
  git clone https://github.com/w3debugger/focus.git
```


Go inside cloned/downloaded folde:
```
  cd focus
```

Compile CSS:
```
  sass --watch assets/sass/style.scss assets/css/style.css --style compressed --no-source-map
```