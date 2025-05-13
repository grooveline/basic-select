function loadList() {
  chrome.storage.local.get({auths: []}, (data) => {
    const list = document.getElementById('auth-list');
    list.innerHTML = '';
    data.auths.forEach((entry, index) => {
      const div = document.createElement('div');
      div.className = 'entry';

      const label = document.createElement('div');
      label.textContent = entry.label;
      label.style.fontWeight = 'bold';
      div.appendChild(label);

      const buttonRow = document.createElement('div');
      buttonRow.className = 'button-row';

      const goBtn = document.createElement('button');
      goBtn.textContent = '▶ 認証アクセス';
      goBtn.onclick = () => applyAuth(entry.username, entry.password, entry.url);
      buttonRow.appendChild(goBtn);

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏ 編集';
      editBtn.onclick = () => openEditForm(index, entry);
      buttonRow.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑 削除';
      deleteBtn.onclick = () => deleteEntry(index);
      buttonRow.appendChild(deleteBtn);

      div.appendChild(buttonRow);
      list.appendChild(div);
    });
  });
}

function applyAuth(username, password, url = null) {
  if (url) {
    const u = new URL(url);
    const authUrl = `${u.protocol}//${username}:${password}@${u.host}${u.pathname}${u.search}${u.hash}`;
    chrome.tabs.create({url: authUrl});
  } else {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const current = new URL(tabs[0].url);
      const authUrl = `${current.protocol}//${username}:${password}@${current.host}${current.pathname}${current.search}${current.hash}`;
      chrome.tabs.create({url: authUrl});
    });
  }
}

function openEditForm(index, entry) {
  document.getElementById('label').value = entry.label;
  document.getElementById('url').value = entry.url || '';
  document.getElementById('username').value = entry.username;
  document.getElementById('password').value = entry.password;
  document.getElementById('edit-index').value = index;
  document.getElementById('add-form').style.display = 'block';
}

function deleteEntry(index) {
  if (!confirm('本当に削除しますか？')) return;
  chrome.storage.local.get({auths: []}, (data) => {
    data.auths.splice(index, 1);
    chrome.storage.local.set({auths: data.auths}, loadList);
  });
}

function clearForm() {
  document.getElementById('label').value = '';
  document.getElementById('url').value = '';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('edit-index').value = '';
  document.getElementById('add-form').style.display = 'none';
}

document.getElementById('add-btn').onclick = () => {
  clearForm();
  document.getElementById('add-form').style.display = 'block';
};


document.getElementById('cancel-btn').onclick = () => {
  clearForm();
};

document.getElementById('save-btn').onclick = () => {
  const label = document.getElementById('label').value;
  const url = document.getElementById('url').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const editIndex = document.getElementById('edit-index').value;

  chrome.storage.local.get({auths: []}, (data) => {
    if (editIndex !== '') {
      // 編集モード
      data.auths[parseInt(editIndex)] = {label, url, username, password};
    } else {
      // 新規追加モード
      data.auths.push({label, url, username, password});
    }

    chrome.storage.local.set({auths: data.auths}, () => {
      loadList();
      clearForm();
    });
  });
};

loadList();
