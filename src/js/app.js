import * as markdownit from "markdown-it";
import saveAs from 'file-saver';

const themeBtn = document.querySelector(".theme-btn");
const text = document.getElementById("text");
const preview = document.getElementById("preview");
const previewSec = document.querySelector(".preview");
const textSec = document.querySelector(".markdown");
const menuBtn = document.querySelector(".menu-btn");
const previewBtn = document.querySelector(".preview-btn");
const addBtn = document.querySelector(".add-btn");
const saveBtn = document.querySelector(".save-btn");
const menu = document.querySelector(".menu");
const menuFilesParent = menu.querySelector(".files-container");
const savedNum = document.getElementById("saved-num");
const header = document.querySelector(".header");
const filesParent = header.querySelector(".files-container");
const lastFilesEl = filesParent.lastElementChild;

const md = markdownit();

const data = [];

const changeLink = id => window.history.pushState("", "", `#${id}`);

const changeText = id => {
  if (!data.flat().find(item => item.id === +id)) return;
  text.value = data.flat().find(item => item.id === +id).content || "";
  preview.innerHTML = md.render(text.value);
};

const removeActive = () => header.querySelectorAll(".document-container").forEach(el => el.classList.remove("active"));

const setLocalStorage = (dataName, data) => localStorage.setItem(dataName, JSON.stringify(data));

const getLocalStorage = (dataName, initVal) => JSON.parse(localStorage.getItem(dataName)) || initVal;

const getCurId = () => window.location.href.slice(window.location.href.lastIndexOf("#") + 1);

const generateMarkup = (id, title = "Untitled") => {
  return `<li class="document-container" data-id="${id}">
            <i class="fa-regular fa-file"></i>
            <div class="doc-info">
              <span>document name</span>
              <div>
                <span id="file-name" role="textbox" contenteditable>${title}</span>
                <p>.md</p>
              </div>
            </div>
            <button class="remove-btn"><i class="fa-regular fa-x"></i></button>
          </li>`
    ;
};

const render = (id, title) => {
  textSec.classList.remove("hide");
  lastFilesEl.insertAdjacentHTML("beforebegin", generateMarkup(id, title));
};

const revealScroll = function () {
  header.querySelector("nav").classList.add("long-nav");
  header.querySelector(".menu-btn").classList.add("menu-btn-mode");
};

const setScroll = function (width = header.clientWidth) {
  if (header.scrollWidth > width) {
    const options = {
      left: header.scrollWidth,
      behavior: 'smooth',
    };
    header.scroll(options);
    revealScroll();
    setLocalStorage("scrollable", true);
  }
};

const removeScroll = function (width = header.clientWidth) {
  if (header.scrollWidth <= width) {
    header.querySelector("nav").classList.remove("long-nav");
    header.querySelector(".menu-btn").classList.remove("menu-btn-mode");
    setLocalStorage("scrollable", false);
  }
};

const formatFileName = function () {
  const fileNameHeader = header.querySelectorAll("#file-name");
  const fileNameMenu = menu.querySelectorAll("#file-name");

  const curFile = Array.from(fileNameHeader).find(el => el.closest(".document-container").dataset.id === getCurId());
  const curMenuFile = Array.from(fileNameMenu).find(el => el.closest(".document-container").dataset.id === getCurId());

  if (curFile) {
    curFile.textContent = curFile.textContent.length > 8 ? `${curFile.textContent.slice(0, 6)}...${curFile.textContent.slice(-1)}` : curFile.textContent;
  };

  if (curMenuFile) {
    curMenuFile.textContent = curFile ? curFile.textContent : curMenuFile.textContent.length > 8 ? `${curMenuFile.textContent.slice(0, 6)}...${curMenuFile.textContent.slice(-1)}` : curMenuFile.textContent;
  } else {
    Array.from(fileNameMenu).forEach(el => {
      el.textContent = el.textContent.length > 8 ? `${el.textContent.slice(0, 6)}...${el.textContent.slice(-1)}` : el.textContent;
    });
  };
};

const setDefaultName = e => {
  const fileName = e.target;
  if (!fileName.textContent.trim().length) fileName.textContent = "Untitled";
};

const generateMenuMarkup = (id, title = "Untitled") => {
  return `
      <li class="document-container" data-id="${id}">
        <div class="document">
          <i class="fa-regular fa-file"></i>
          <span id="file-name" role="textbox">${title}</span>
          <p>.md</p>
        </div>
        <div class="menu-file-btns">
          <button class="remove-btn"><i class="fa-regular fa-x"></i></button>
          <button class="download-btn"><i class="fa-solid fa-file-arrow-down"></i></button>
        </div>
      </li>
  `;
};

const updateDataTitle = e => {
  const fileName = e.target;
  data.flat().find(item => item.id === +getCurId()).title = fileName.textContent;
  setLocalStorage("data", data);
};

const changePrev = () => {
  if (data.flat().find(item => item.id === +getCurId()).previewMode) {
    previewSec.classList.remove("hide");
  } else {
    previewSec.classList.add("hide");
  }
  textSec.style.gridColumn = previewSec.classList.contains("hide") ? "1/-1" : "auto";
  previewBtn.innerHTML = `<i class="fa-regular fa-${previewSec.classList.contains("hide") ? "eye" : "eye-slash"}"></i>`;
  text.scrollTop = data.flat().find(item => item.id === +getCurId()).position.scroll;
  // text.focus();
  // text.setSelectionRange(...data.flat().find(item => item.id === +getCurId()).position.cursor);

  const secHeight = window.innerHeight - (header.clientHeight + textSec.firstElementChild.clientHeight);
  preview.style.overflowY = preview.scrollHeight > secHeight ? "scroll" : "hidden";
  preview.style.height = preview.scrollHeight > secHeight ? `${secHeight}px` : `${preview.scrollHeight}px`;

  const fullScroll = text.scrollTop + text.clientHeight;
  if (fullScroll === text.scrollHeight) {
    preview.scrollTop = text.scrollHeight;
  } else {
    preview.scrollTop = text.scrollTop;
  }
};

header.addEventListener("keyup", e => {
  if (e.target.id !== "file-name") return;
  updateDataTitle(e);
});

header.addEventListener("paste", e => {
  if (e.target.id !== "file-name") return;
  e.preventDefault();
});

header.addEventListener("keydown", e => {
  if (e.target.id !== "file-name" || e.key !== "Enter") return;
  const fileName = e.target;
  e.preventDefault();
  fileName.blur();
  setDefaultName(e);
  formatFileName();
});

header.addEventListener("focusout", e => {
  if (e.target.id !== "file-name") return;
  setDefaultName(e);
  updateDataTitle(e);
  formatFileName();
});

header.addEventListener("click", function (e) {
  Array.from(menu.querySelector(".files-container").children).forEach(el => el.style.removeProperty("height"));
  const curFile = e.target.closest(".document-container");
  const delBtn = e.target.parentElement.classList.contains("remove-btn");
  const fileName = e.target.id === "file-name" && e.target;

  if (!curFile) return;

  removeActive();
  changeLink(curFile.dataset.id);
  if (fileName) fileName.textContent = data.flat().find(item => item.id === +getCurId())?.title;

  if (curFile.dataset.id !== getCurId()) return;
  changeText(curFile.dataset.id);
  curFile.classList.add("active");
  checkHeight();
  changePrev();

  curFile.scrollIntoView({
    behavior: 'smooth'
  });

  if (!delBtn) return;

  if (!data.flat().some(item => item.saved)) {
    const filtredData = data.flat().filter(item => item.id !== +curFile.dataset.id);
    data.splice(0, data.length);
    data.push(filtredData);
    setLocalStorage("data", filtredData);
  }

  if (data.flat().find(item => item.id === +curFile.dataset.id)) {
    data.flat().find(item => item.id === +curFile.dataset.id).opened = false;
    setLocalStorage("data", data);
  };

  curFile.remove();

  removeScroll();

  if (filesParent.childElementCount === 1) {
    textSec.classList.add("hide");
    previewSec.classList.add("hide");
    text.value = preview.innerHTML = "";
    return;
  }

  const lastFileEl = lastFilesEl.previousElementSibling;
  changeLink(lastFileEl.dataset.id);
  lastFileEl.classList.add("active");
  changeText(lastFileEl.dataset.id);
  checkHeight();
  changePrev();
});

const observer = new ResizeObserver(entries => {
  const [entry] = entries;
  const [inlineSize] = entry.borderBoxSize;

  setScroll(inlineSize.inlineSize);
  removeScroll(inlineSize.inlineSize);
});
observer.observe(header);

saveBtn.addEventListener("click", function () {
  const headerFiles = Array.from(filesParent.querySelectorAll(".document-container"));
  const menuFiles = Array.from(menuFilesParent.children);
  const activeFile = headerFiles.find(headerFile => headerFile.classList.contains("active"));

  if (!activeFile || menuFiles.some(menuFile => menuFile.dataset.id === activeFile.dataset.id)) return;

  menuFilesParent.insertAdjacentHTML("afterbegin", generateMenuMarkup(activeFile.dataset.id, activeFile.querySelector("#file-name").textContent));
  data.flat().find(item => item.id === +getCurId()).saved = true;
  setLocalStorage("data", data);

  savedNum.textContent = `(${menuFilesParent.childElementCount})`;
});

menu.addEventListener("click", function (e) {
  const curFile = e.target.closest(".document-container");
  const delBtn = e.target.parentElement?.classList.contains("remove-btn");
  const downloadBtn = e.target.parentElement?.classList.contains("download-btn");

  if (downloadBtn) {
    const blob = new Blob([data.flat().find(item => item.id === +curFile.dataset.id).content], { type: "text/plain;charset=utf-8" });

    saveAs(blob, `${data.flat().find(item => item.id === +curFile.dataset.id).title}.md`, undefined);
  }

  if (delBtn) {
    data.flat().find(item => item.id === +curFile.dataset.id).saved = false;

    if (!Array.from(filesParent.querySelectorAll(".document-container")).some(file => file.dataset.id === curFile.dataset.id)) {
      const filtredData = data.flat().filter(item => item.id !== +curFile.dataset.id);
      data.splice(0, data.length);
      data.push(filtredData);
    }

    setLocalStorage("data", data);
    curFile.remove();
    savedNum.textContent = `(${menuFilesParent.childElementCount})`;
  };

  if (!curFile?.parentElement) return;

  if (!Array.from(filesParent.querySelectorAll(".document-container")).some(headerFile => curFile.dataset.id === headerFile.dataset.id)) {
    lastFilesEl.insertAdjacentHTML("beforebegin", generateMarkup(curFile.dataset.id, curFile.querySelector("#file-name").textContent));

    setScroll();
  };

  const headerFiles = Array.from(filesParent.querySelectorAll(".document-container"));

  removeActive();
  headerFiles.find(headerFile => curFile.dataset.id === headerFile.dataset.id).classList.add("active");
  changeLink(curFile.dataset.id);
  changeText(curFile.dataset.id);
  textSec.classList.remove("hide");

  checkHeight();
  changePrev();

  data.flat().find(item => item.id === +curFile.dataset.id).opened = true;
  setLocalStorage("data", data);
});

addBtn.addEventListener("click", function () {
  const id = Date.now();
  const info = {
    id: id,
    content: "",
    title: "Untitled",
    saved: false,
    opened: true,
    previewMode: false,
    position: {
      scroll: 0,
      cursor: [],
    },
  };

  data.push(info);
  setLocalStorage("data", data);

  render(id);

  removeActive();
  lastFilesEl.previousElementSibling.classList.add("active");
  text.value = preview.innerHTML = "";
  changeLink(id);
  setScroll();
  lastFilesEl.previousElementSibling.querySelector("#file-name").focus();
  checkHeight();

  changePrev();
});

document.querySelector("main").addEventListener("click", function (e) {
  if (e.target.parentElement.classList.contains("preview-btn")) previewSec.classList.toggle("hide");
  textSec.style.gridColumn = previewSec.classList.contains("hide") ? "1/-1" : "auto";
  previewBtn.innerHTML = `<i class="fa-regular fa-${previewSec.classList.contains("hide") ? "eye" : "eye-slash"}"></i>`;

  const secHeight = window.innerHeight - (header.clientHeight + textSec.firstElementChild.clientHeight);
  preview.style.overflowY = preview.scrollHeight > secHeight ? "scroll" : "hidden";
  preview.style.height = preview.scrollHeight > secHeight ? `${secHeight}px` : `${preview.scrollHeight}px`;
  preview.scrollTop = text.scrollTop;

  data.flat().find(item => item.id === +getCurId()).previewMode = previewSec.classList.contains("hide") ? false : true;
  setLocalStorage("data", data);
});

menuBtn.addEventListener("click", () => menu.classList.toggle("show"));

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle('dark-theme');
  themeBtn.innerHTML = `<i class="fa-solid fa-${document.body.classList.contains('dark-theme') ? "sun" : "moon"}"></i>`;
  setLocalStorage("isDark", document.body.classList.contains('dark-theme') ? true : false);
});

text.addEventListener("keyup", function () {
  data.flat().find(item => item.id === +getCurId()).content = text.value;
  preview.innerHTML = md.render(text.value);

  setLocalStorage("data", data);
});

window.addEventListener("load", function () {
  const menuFiles = menu.querySelector(".files-container");
  data.push(getLocalStorage("data", []).flat());

  data.flat().forEach(item => {
    if (item.opened) {
      render(item.id, item.title);
      changeText(getCurId());
      Array.from(filesParent.querySelectorAll(".document-container")).find(headerFile => getCurId() === headerFile.dataset.id)?.classList.add("active");
    };

    if (item.saved) {
      menuFiles.insertAdjacentHTML("afterbegin", generateMenuMarkup(item.id, item.title));
      savedNum.textContent = `(${menuFilesParent.childElementCount})`;
    };
  });

  formatFileName();

  if (getLocalStorage("isDark", false)) {
    document.body.classList.add('dark-theme');
    themeBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
  }

  if (getLocalStorage("scrollable", false)) revealScroll();

  checkHeight();

  if (data.flat().find(item => item.id === +getCurId())) {
    changePrev();
  }
});

let trueTextHeight;

const checkHeight = () => {
  const secHeight = window.innerHeight - (header.clientHeight + textSec.firstElementChild.clientHeight);
  trueTextHeight = text.scrollHeight;

  text.style.overflowY = trueTextHeight > secHeight ? "scroll" : "hidden";
  preview.style.overflowY = preview.scrollHeight > secHeight ? "scroll" : "hidden";
  preview.style.height = preview.scrollHeight > secHeight ? `${secHeight}px` : `${preview.scrollHeight}px`;
  text.style.height = 0;
  text.style.height = trueTextHeight > secHeight ? `${secHeight}px` : `${text.scrollHeight}px`;

  trueTextHeight = text.scrollHeight;
};

const saveCursor = () => {
  data.flat().find(item => item.id === +getCurId()).position.cursor = [];
  data.flat().find(item => item.id === +getCurId()).position.cursor.push(text.selectionStart, text.selectionEnd);
  setLocalStorage("data", data);
};

text.addEventListener("keyup", () => {
  checkHeight();
  saveCursor();
});

text.addEventListener("keypress", () => {
  checkHeight();
  saveCursor();
});

text.addEventListener("click", saveCursor);

text.addEventListener("scroll", () => {
  const fullScroll = text.scrollTop + text.clientHeight;
  if (fullScroll === text.scrollHeight) {
    preview.scrollTop = text.scrollHeight;
  } else {
    preview.scrollTop = text.scrollTop;
  }
  data.flat().find(item => item.id === +getCurId()).position.scroll = text.scrollTop;
  setLocalStorage("data", data);

  if (filesParent.childElementCount === 1) changeLink("");
});

window.addEventListener("resize", () => {
  const secHeight = window.innerHeight - (header.clientHeight + textSec.firstElementChild.clientHeight);

  if (!preview) return;
  preview.style.height = preview.scrollHeight > secHeight ? `${secHeight}px` : `${preview.scrollHeight}px`;

  if (!text) return;
  text.style.height = 0;
  text.style.height = trueTextHeight > secHeight ? `${secHeight}px` : `${text.scrollHeight}px`;
});

// for dev
// localStorage.clear();
