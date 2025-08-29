// Cargamos todas las imágenes comercio*.png
const modules = import.meta.glob('../../images/marcas/comercio*.png', {
  eager: true
});

const items = Object.entries(modules)
  .map(([path, mod]) => {
    const m = path.match(/comercio(\d+)\.png$/);
    if (!m) return null;
    const num = Number(m[1]);
    return { num, url: mod.default };
  })
  .filter(Boolean)
  .filter(({ num }) => num !== 12 && num !== 13) // excluye 12 y 13
  .sort((a, b) => a.num - b.num);

// Array de URLs en orden (1,2,3, ... 19, 20, ...)
export const comerciosArray = items.map(({ url }) => url);

// Mapa { comercio1: url, comercio2: url, ... }
export const comerciosMap = Object.fromEntries(
  items.map(({ num, url }) => [`comercio${num}`, url])
);

// Si querés un default, exportá el array
export default comerciosArray;
