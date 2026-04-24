/*
 * wa-custom-select.js
 * Replaces native <select class="wa-select" data-wa-custom> dropdowns with
 * a fully styled custom popover that matches the Aurora dark theme.
 *
 * - Keeps the original <select> in the DOM (visually hidden) for form submission
 *   and accessibility fallback.
 * - Renders a <button> trigger + a <ul role="listbox"> popover.
 * - Mirrors all <option> changes both ways.
 * - Closes on outside click, Escape, blur.
 * - Keyboard: Up/Down/Home/End/Enter/Space/typeahead.
 */
(function () {
  'use strict';

  var INSTANCE_KEY = '__waCustomSelect';
  var openInstance = null;

  function uid() {
    return 'wa-cs-' + Math.random().toString(36).slice(2, 9);
  }

  function closeOpen() {
    if (openInstance) {
      openInstance.close();
      openInstance = null;
    }
  }

  document.addEventListener('click', function (e) {
    if (openInstance && !openInstance.root.contains(e.target)) {
      closeOpen();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openInstance) {
      openInstance.trigger.focus();
      closeOpen();
    }
  });

  function build(select) {
    if (select[INSTANCE_KEY]) return select[INSTANCE_KEY];
    if (select.multiple) return null; // not supported

    var id = uid();
    var listId = id + '-list';

    // Wrapper
    var root = document.createElement('div');
    root.className = 'wa-cs';
    if (select.classList.contains('wa-cs--ghost')) root.classList.add('wa-cs--ghost');
    if (select.dataset.waVariant) root.dataset.waVariant = select.dataset.waVariant;

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'wa-cs__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', listId);
    var aria = select.getAttribute('aria-label');
    if (aria) trigger.setAttribute('aria-label', aria);

    var label = document.createElement('span');
    label.className = 'wa-cs__label';
    var caret = document.createElement('span');
    caret.className = 'wa-cs__caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.innerHTML = '<svg viewBox="0 0 12 8" fill="none" width="12" height="8"><path d="M1 1.5l5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    trigger.appendChild(label);
    trigger.appendChild(caret);

    var list = document.createElement('ul');
    list.className = 'wa-cs__list';
    list.id = listId;
    list.setAttribute('role', 'listbox');
    list.setAttribute('tabindex', '-1');
    if (aria) list.setAttribute('aria-label', aria);

    // Insert wrapper BEFORE select, then move select inside wrapper as visually hidden.
    select.parentNode.insertBefore(root, select);
    root.appendChild(trigger);
    root.appendChild(list);
    root.appendChild(select);
    select.classList.add('wa-cs__native');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    var options = []; // { el (li), value, text, optionEl }

    function rebuild() {
      list.innerHTML = '';
      options = [];
      var opts = select.options;
      for (var i = 0; i < opts.length; i++) {
        var o = opts[i];
        var li = document.createElement('li');
        li.className = 'wa-cs__option';
        li.setAttribute('role', 'option');
        li.dataset.value = o.value;
        li.textContent = o.textContent;
        if (o.disabled) {
          li.setAttribute('aria-disabled', 'true');
          li.classList.add('is-disabled');
        }
        list.appendChild(li);
        options.push({ el: li, value: o.value, text: o.textContent, optionEl: o });
      }
      syncSelected();
    }

    function syncSelected() {
      var sel = select.options[select.selectedIndex];
      if (sel) {
        label.textContent = sel.textContent;
        for (var i = 0; i < options.length; i++) {
          var matches = options[i].optionEl === sel;
          options[i].el.setAttribute('aria-selected', matches ? 'true' : 'false');
          options[i].el.classList.toggle('is-selected', matches);
        }
      } else {
        label.textContent = '';
      }
    }

    function activate(idx) {
      for (var i = 0; i < options.length; i++) {
        options[i].el.classList.toggle('is-active', i === idx);
      }
      var active = options[idx];
      if (active) {
        active.el.scrollIntoView({ block: 'nearest' });
        list.setAttribute('aria-activedescendant', active.el.id || (active.el.id = id + '-opt-' + idx));
      }
    }

    function open() {
      if (root.classList.contains('is-open')) return;
      closeOpen();
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      var idx = select.selectedIndex < 0 ? 0 : select.selectedIndex;
      activate(idx);
      openInstance = api;
    }

    function close() {
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      for (var i = 0; i < options.length; i++) options[i].el.classList.remove('is-active');
    }

    function selectIdx(idx) {
      var opt = options[idx];
      if (!opt || opt.optionEl.disabled) return;
      select.selectedIndex = idx;
      syncSelected();
      // Dispatch change event for native form handlers
      var evt = new Event('change', { bubbles: true });
      select.dispatchEvent(evt);
      close();
      trigger.focus();
    }

    function getActiveIdx() {
      for (var i = 0; i < options.length; i++) {
        if (options[i].el.classList.contains('is-active')) return i;
      }
      return -1;
    }

    function moveActive(delta) {
      var idx = getActiveIdx();
      var next = idx + delta;
      while (next >= 0 && next < options.length && options[next].optionEl.disabled) next += delta;
      if (next < 0) next = 0;
      if (next >= options.length) next = options.length - 1;
      activate(next);
    }

    // Trigger interactions
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (root.classList.contains('is-open')) close(); else open();
    });
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
        if (e.key === 'ArrowDown') moveActive(1);
        else if (e.key === 'ArrowUp') moveActive(-1);
      }
    });

    // List interactions
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.wa-cs__option');
      if (!li) return;
      var idx = options.findIndex(function (o) { return o.el === li; });
      if (idx > -1) selectIdx(idx);
    });
    list.addEventListener('mouseover', function (e) {
      var li = e.target.closest('.wa-cs__option');
      if (!li) return;
      var idx = options.findIndex(function (o) { return o.el === li; });
      if (idx > -1) activate(idx);
    });

    // Keyboard on list
    list.addEventListener('keydown', handleKeydown);
    trigger.addEventListener('keydown', function (e) {
      if (root.classList.contains('is-open')) handleKeydown(e);
    });
    function handleKeydown(e) {
      if (!root.classList.contains('is-open')) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
      else if (e.key === 'Home') { e.preventDefault(); activate(0); }
      else if (e.key === 'End') { e.preventDefault(); activate(options.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var idx = getActiveIdx();
        if (idx > -1) selectIdx(idx);
      } else if (e.key === 'Tab') {
        close();
      }
    }

    // Native select changes (e.g. localization auto-submit)
    select.addEventListener('change', syncSelected);

    var api = { root: root, trigger: trigger, list: list, select: select, close: close, open: open, rebuild: rebuild };
    select[INSTANCE_KEY] = api;
    rebuild();
    return api;
  }

  function init(scope) {
    var ctx = scope || document;
    var nodes = ctx.querySelectorAll('select.wa-select, select.wa-locale-select, select[data-wa-custom]');
    nodes.forEach(function (s) {
      if (!s[INSTANCE_KEY]) build(s);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }

  // Re-init when Shopify section editor re-renders things
  document.addEventListener('shopify:section:load', function () { init(); });

  // Expose for manual init
  window.WaCustomSelect = { init: init };
})();
