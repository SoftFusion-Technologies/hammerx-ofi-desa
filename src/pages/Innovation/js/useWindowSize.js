// useWindowSize.js
// este archivo sirve para acomodar las particulas del canvas
import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight
  });

  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      // Usamos rAF para evitar múltiples renders durante el drag de la ventana
      raf = requestAnimationFrame(() => {
        setSize({ w: window.innerWidth, h: window.innerHeight });
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}
