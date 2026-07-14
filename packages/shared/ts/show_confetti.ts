import JSConfetti from "js-confetti";
import { wait } from "@shared/ts/helpers";
export default async function show_confetti() {
  let canvas = document.createElement("canvas");
  canvas.setAttribute(
    "style",
    `
    position: absolute;
    pointer-events: none;
    z-index: 99999909;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
`
  );
  // @ts-ignore
  document.querySelector("body").append(canvas);
  const jsConfetti = new JSConfetti({ canvas });
  jsConfetti.addConfetti({
    confettiRadius: 3,
    confettiNumber: 500,
  });
  await wait(5000);
  canvas.remove();
  //
}
