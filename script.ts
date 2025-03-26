const button = document.getElementById("masonryButton");

const textarea = document.getElementById(
  "masonryTextarea"
) as HTMLTextAreaElement;
const container = document.getElementById("imgcontainer");
const windowWidth = 1920;
// const windowWidth = window.innerWidth;

let id_n = 0;
let x = 0;
const y = 55;

type HTMLImageOrVideo = HTMLImageElement | HTMLVideoElement;

button?.addEventListener("click", async (evt) => {
  evt.preventDefault();
  handleButton(evt);
  setFromTextarea();
});

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setMultipleFromTextarea(urls: string[]) {
  for (const url of urls) {
    setUrl(url);
    await pause(350);
  }
}

function setUrl(url: string) {
  let elem: HTMLImageOrVideo;

  if (url.includes(".mp4")) {
    elem = createAndStyleVid(url);
  } else {
    elem = createAndStyleImg(url);
  }
  container?.appendChild(elem);
  placeInView();
}

function setFromTextarea() {
  const urls = textarea.value;
  if (urls === "") return;

  if (urls.trim().includes(" ")) {
    const multipleUrls = urls.split(" ");
    console.log(multipleUrls);
    multipleUrls.shift();
    setMultipleFromTextarea(multipleUrls);
    textarea.value = "";
    return;
  }

  let elem: HTMLImageOrVideo;

  if (urls.includes(".mp4")) {
    elem = createAndStyleVid(urls);
  } else {
    elem = createAndStyleImg(urls);
  }
  container?.appendChild(elem);
  textarea.value = "";
  placeInView();
}

function createAndStyleImg(url: string) {
  const img = document.createElement("img");
  img.src = url;
  img.id = `${id_n}`;
  img.style.position = "absolute";
  img.style.top = `${y + 1}px`;
  img.style.left = `${x}px`;
  return img;
}

function createAndStyleVid(url: string) {
  const vid = document.createElement("video");
  const src = document.createElement("source");
  src.src = url;
  src.type = "video/mp4";
  vid.id = `${id_n}`;
  vid.style.top = `${y + 1}px`;
  vid.style.left = `${x}px`;
  vid.controls = true;
  vid.autoplay = true;
  // vid.muted = true;
  vid.volume = 0.2;
  vid.loop = true;
  vid.appendChild(src);
  vid.style.position = "absolute";
  return vid;
}

let biggestZ = 1;

let current_elem: HTMLImageOrVideo | null = null;
let has_right_clicked_elem = false;

document.addEventListener("mousedown", (evt) => {
  if (has_right_clicked_elem && current_elem) {
    current_elem = null;
    has_right_clicked_elem = false;
    return;
  }

  current_elem = document.elementFromPoint(
    evt.clientX,
    evt.clientY
  ) as HTMLImageOrVideo;

  const has_pressed_elem =
    current_elem instanceof HTMLImageElement ||
    current_elem instanceof HTMLVideoElement;

  has_right_clicked_elem = has_pressed_elem && evt.button === 2;

  if (current_elem && has_pressed_elem) {
    switch (evt.button) {
      // incrementa o decrementa el tamaño del elemento en 50
      case 0:
        current_elem.style.width = resizeElement(current_elem, 50);

        break;
      case 1:
        current_elem.style.width = resizeElement(current_elem, -50);

        break;
      case 2:
        onRightClick(evt);
        break;
    }
  }
});

function resizeElement(current_elem: HTMLImageOrVideo, amount: number): string {
  return `${
    Number.parseFloat(getComputedStyle(current_elem).width) + amount
  }px`;
}

function onRightClick(evt: MouseEvent) {
  if (has_right_clicked_elem) {
    beOnTop();
  }
}

function beOnTop() {
  const hasBiggestZIndex =
    current_elem && current_elem.style.zIndex === `${biggestZ}`;

  if (current_elem && !hasBiggestZIndex) {
    current_elem.style.zIndex = `${biggestZ}`;
    biggestZ++;
  }
}

document.addEventListener("mousemove", (evt) => {
  if (
    has_right_clicked_elem &&
    current_elem &&
    (evt.buttons === 2 || evt.buttons === 0)
  ) {
    followMouse(current_elem, evt);
  }
});

document.addEventListener("contextmenu", (evt) => {
  evt.preventDefault();
});

document.addEventListener("click", (evt) => {
  evt.preventDefault();
});

function followMouse(elem: HTMLImageOrVideo, evt: MouseEvent) {
  // Calculate the center position
  const elemWidth = elem.clientWidth;
  const elemHeight = elem.clientHeight;

  const centerX = evt.clientX - elemWidth / 2;
  const centerY = evt.clientY - elemHeight / 2;

  // Set the image position to follow the mouse, centered
  elem.style.left = `${centerX}px`;
  elem.style.top = `${centerY}px`;
}

async function placeInView() {
  const placed_img = document.getElementById(`${id_n}`) as HTMLImageOrVideo;
  setTimeout(() => {
    const prevX = x;

    handleY(placed_img, prevX);
    handleX(placed_img);
    id_n++;
  }, 300);
}

function handleButton(evt: MouseEvent) {
  evt.preventDefault();
  const buttonTarget = evt.target as HTMLButtonElement;

  buttonTarget.disabled = true;
  setTimeout(() => {
    buttonTarget.disabled = false;
  }, 300);
}

const desp = 0;

function handleY(placed_img: HTMLImageOrVideo, prevX: number) {
  const width = placed_img?.clientWidth;
  let newY = 55; //porque empiezan en 55

  const outOfBordersX = x + width > windowWidth;
  let tempX = x + 1 + desp;
  if (outOfBordersX) {
    tempX = 1;
  }

  let attemptsLeft = 15;
  for (let times = 0; times < 3; times++) {
    if (attemptsLeft < 1) {
      throw new GeolocationPositionError();
    }
    const element = getElemOrNull(tempX, newY);

    if (
      !element ||
      element.id === `${id_n}` ||
      element.id === "" ||
      element.id === "body"
    ) {
      tempX += width / 2;
      continue;
    }
    //encuentro elemento
    newY += element.height; //asigno la altura de ese elemento, para skippearlo en Y
    tempX = x + 1;
    times = 0;
    attemptsLeft -= 1;
  }
  placed_img.style.top = `${newY}px`;
}

function getElemOrNull(tempX: number, newY: number) {
  return document.elementFromPoint(tempX, newY) as HTMLImageOrVideo | null;
}

function handleX(placed_elem: HTMLImageOrVideo) {
  const width = placed_elem?.clientWidth;
  const outOfBordersX = x + width > windowWidth;
  if (!outOfBordersX) {
    x += placed_elem?.clientWidth;

    return;
  }

  placeDown(placed_elem);
}

function placeDown(placed_img: HTMLImageOrVideo) {
  placed_img.style.left = `${0}px`;
  x = placed_img.clientWidth;
}

document.addEventListener("keydown", (evt) => {
  // borrar con d
  if ((evt.key === "d" || evt.key === "D") && current_elem) {
    current_elem.remove();
    current_elem = null;
    has_right_clicked_elem = false;
  }
  // poner img desde enter
  if (evt.key === "Enter") {
    button?.click();
  }
});
