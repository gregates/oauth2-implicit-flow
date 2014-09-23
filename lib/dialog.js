function openWindow(url) {
  var dialog = window.open(url, "Authorize", "width=450,height=600,scrollbars=yes");

  if (window.focus && dialog) { dialog.focus(); }
  if (dialog) {
    return dialog;
  } else {
    window.console.error("Failed to open authorization dialog");
    return null;
  }
}

module.exports = openWindow;
