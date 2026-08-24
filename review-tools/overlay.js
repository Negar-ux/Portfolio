/* Local review overlay. Injected by review-tools/review-server.py only when a
   page is opened with ?review=1, so nothing here exists on the live site.

   Notes are collected into numbered rounds. You add notes to the open round,
   then press "Submit Review N", which closes it and opens the next. Claude
   reads review-comments.json, acts on the submitted round, and writes back a
   resolution against each note, which then shows here. */
(function () {
  'use strict';

  var PAGE = location.pathname.replace(/^\//, '') || 'index.html';
  var doc = { currentRound: 1, rounds: [] };
  var picking = false;
  var hovered = null;

  // ---------------------------------------------------------------- helpers
  function openRound() {
    var r = doc.rounds.filter(function (x) { return x.round === doc.currentRound; })[0];
    if (!r) {
      r = { round: doc.currentRound, submitted: null, status: 'draft', comments: [] };
      doc.rounds.push(r);
    }
    return r;
  }

  function selectorFor(el) {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    var parts = [];
    while (el && el.nodeType === 1 && el !== document.body && parts.length < 5) {
      var part = el.tagName.toLowerCase();
      var cls = (el.getAttribute('class') || '').trim().split(/\s+/)
                  .filter(function (c) { return c && !/^rv-/.test(c); })[0];
      if (cls) part += '.' + cls;
      var parent = el.parentElement;
      if (parent) {
        var same = Array.prototype.filter.call(parent.children, function (n) {
          return n.tagName === el.tagName;
        });
        if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(el) + 1) + ')';
      }
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function snippet(el) {
    var t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.length > 120 ? t.slice(0, 120) + '…' : t;
  }

  function sectionFor(el) {
    var sec = el.closest ? el.closest('section[id]') : null;
    if (!sec) return '';
    var h = sec.querySelector('h2, h3');
    return h ? h.textContent.trim() : sec.id;
  }

  function save() {
    return fetch('/__review/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    }).then(function (r) { return r.json(); });
  }

  function addNote(fields) {
    var r = openRound();
    r.comments.push(Object.assign({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      page: PAGE,
      created: new Date().toISOString(),
      status: 'open',
      resolution: ''
    }, fields));
    return save().then(function () { render(); setStatus('Saved to Review ' + doc.currentRound + '.'); });
  }

  // ------------------------------------------------------------------- UI
  var panel = document.createElement('aside');
  panel.className = 'rv-panel';
  panel.innerHTML =
    '<header class="rv-head">' +
      '<strong class="rv-title">Review</strong>' +
      '<button class="rv-min" type="button" title="Collapse">–</button>' +
    '</header>' +
    '<div class="rv-body">' +
      '<button class="rv-pick" type="button">Comment on an element</button>' +
      '<textarea class="rv-general" rows="2" placeholder="…or a note about the page as a whole"></textarea>' +
      '<button class="rv-add-general" type="button">Add page note</button>' +
      '<ul class="rv-list"></ul>' +
      '<button class="rv-submit" type="button">Submit review</button>' +
      '<p class="rv-status"></p>' +
      '<details class="rv-history"><summary>Earlier rounds</summary><div class="rv-history-body"></div></details>' +
    '</div>';
  document.body.appendChild(panel);

  var list = panel.querySelector('.rv-list');
  var status = panel.querySelector('.rv-status');

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'rv-status' + (kind ? ' rv-' + kind : '');
    if (msg) setTimeout(function () { status.textContent = ''; }, 3000);
  }

  function itemNode(c, editable) {
    var li = document.createElement('li');
    li.className = 'rv-item' + (c.status === 'addressed' ? ' rv-addressed' : '');
    var where = c.selector
      ? (c.section ? c.section + ' — ' : '') + (c.snippet || c.selector)
      : 'Whole page';

    var pw = document.createElement('p'); pw.className = 'rv-where'; pw.textContent = where;
    var pt = document.createElement('p'); pt.className = 'rv-text'; pt.textContent = c.comment;
    li.appendChild(pw); li.appendChild(pt);

    if (c.resolution) {
      var pr = document.createElement('p');
      pr.className = 'rv-resolution';
      pr.textContent = 'Claude: ' + c.resolution;
      li.appendChild(pr);
    }

    var acts = document.createElement('div'); acts.className = 'rv-actions';
    if (c.selector) {
      var show = document.createElement('button');
      show.type = 'button'; show.className = 'rv-show'; show.textContent = 'Show';
      show.onclick = function () {
        var el = null;
        try { el = document.querySelector(c.selector); } catch (e) {}
        if (!el) { setStatus('That element is no longer on the page.', 'warn'); return; }
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('rv-flash');
        setTimeout(function () { el.classList.remove('rv-flash'); }, 1600);
      };
      acts.appendChild(show);
    }
    if (editable) {
      var del = document.createElement('button');
      del.type = 'button'; del.className = 'rv-del'; del.textContent = 'Delete';
      del.onclick = function () {
        var r = openRound();
        r.comments = r.comments.filter(function (x) { return x.id !== c.id; });
        save().then(function () { render(); setStatus('Deleted.'); });
      };
      acts.appendChild(del);
    }
    li.appendChild(acts);
    return li;
  }

  function render() {
    var r = openRound();
    panel.querySelector('.rv-title').textContent = 'Review ' + doc.currentRound;

    var mine = r.comments.filter(function (c) { return c.page === PAGE; });
    list.innerHTML = '';
    if (!mine.length) {
      var li = document.createElement('li');
      li.className = 'rv-empty';
      li.textContent = 'No notes on this page yet in round ' + doc.currentRound + '.';
      list.appendChild(li);
    } else {
      mine.forEach(function (c) { list.appendChild(itemNode(c, true)); });
    }

    var total = r.comments.length;
    var btn = panel.querySelector('.rv-submit');
    btn.textContent = total
      ? 'Submit Review ' + doc.currentRound + ' (' + total + ')'
      : 'Submit Review ' + doc.currentRound;
    btn.disabled = !total;

    // history
    var hb = panel.querySelector('.rv-history-body');
    hb.innerHTML = '';
    var past = doc.rounds.filter(function (x) { return x.round !== doc.currentRound; })
                         .sort(function (a, b) { return b.round - a.round; });
    if (!past.length) {
      hb.innerHTML = '<p class="rv-empty">No submitted rounds yet.</p>';
    }
    past.forEach(function (pr) {
      var wrap = document.createElement('div');
      wrap.className = 'rv-round';
      var done = pr.comments.filter(function (c) { return c.status === 'addressed'; }).length;
      var h = document.createElement('p');
      h.className = 'rv-round-head';
      h.textContent = 'Review ' + pr.round + ' · ' + pr.comments.length + ' notes · '
                      + done + ' addressed';
      wrap.appendChild(h);
      var ul = document.createElement('ul');
      ul.className = 'rv-list';
      pr.comments.filter(function (c) { return c.page === PAGE; })
                 .forEach(function (c) { ul.appendChild(itemNode(c, false)); });
      wrap.appendChild(ul);
      hb.appendChild(wrap);
    });
  }

  // ------------------------------------------------------------- element pick
  function onOver(e) {
    if (!picking || panel.contains(e.target)) return;
    if (hovered) hovered.classList.remove('rv-target');
    hovered = e.target;
    hovered.classList.add('rv-target');
  }

  function onClick(e) {
    if (!picking || panel.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    var el = e.target;
    stopPicking();
    var text = window.prompt('Note about:\n\n' + snippet(el) + '\n');
    if (text && text.trim()) {
      addNote({ section: sectionFor(el), selector: selectorFor(el),
                snippet: snippet(el), comment: text.trim() });
    }
  }

  function startPicking() {
    picking = true;
    document.body.classList.add('rv-picking');
    panel.querySelector('.rv-pick').textContent = 'Click an element… (Esc to cancel)';
  }

  function stopPicking() {
    picking = false;
    document.body.classList.remove('rv-picking');
    if (hovered) { hovered.classList.remove('rv-target'); hovered = null; }
    panel.querySelector('.rv-pick').textContent = 'Comment on an element';
  }

  panel.querySelector('.rv-pick').onclick = function () {
    picking ? stopPicking() : startPicking();
  };

  panel.querySelector('.rv-add-general').onclick = function () {
    var ta = panel.querySelector('.rv-general');
    var text = ta.value.trim();
    if (!text) return;
    ta.value = '';
    addNote({ section: '', selector: '', snippet: '', comment: text });
  };

  panel.querySelector('.rv-submit').onclick = function () {
    var r = openRound();
    if (!r.comments.length) return;
    var n = r.comments.length;
    if (!window.confirm('Submit Review ' + doc.currentRound + ' with ' + n +
        ' note' + (n === 1 ? '' : 's') + ' across all pages?\n\nA new round will open for further notes.')) return;
    r.status = 'submitted';
    r.submitted = new Date().toISOString();
    doc.currentRound = doc.currentRound + 1;
    openRound();
    save().then(function () {
      render();
      setStatus('Review ' + (doc.currentRound - 1) + ' submitted. Now on Review ' + doc.currentRound + '.', 'ok');
    });
  };

  panel.querySelector('.rv-min').onclick = function () {
    panel.classList.toggle('rv-collapsed');
    this.textContent = panel.classList.contains('rv-collapsed') ? '+' : '–';
  };

  document.addEventListener('mouseover', onOver, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && picking) stopPicking();
  });

  // ------------------------------------------------------------------- boot
  fetch('/__review-comments')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data && Array.isArray(data.rounds)) doc = data;
      render();
    })
    .catch(function () { render(); });
})();
