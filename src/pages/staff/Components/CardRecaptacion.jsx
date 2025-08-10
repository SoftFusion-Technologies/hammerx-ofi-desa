import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CardRecaptacion({ userLevel, userId, mes, anio }) {
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({
      level: userLevel || '',
      ...(userId ? { usuario_id: userId } : {}),
      ...(mes ? { mes: String(mes) } : {}),
      ...(anio ? { anio: String(anio) } : {})
    });

    fetch(
      `http://localhost:8080/recaptacion/pendientes/count?${params.toString()}`
    )
      .then((r) => r.json())
      .then((d) => setPendientes(d?.count ?? 0))
      .catch(() => setPendientes(0));
  }, [userLevel, userId, mes, anio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.6 }}
      className="relative bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
    >
      {pendientes > 0 && (
        <span className="absolute -top-6 -right-6 lg:-top-7 lg:-right-7 bg-red-500 text-white rounded-full px-5 py-3 text-2xl lg:text-3xl font-extrabold shadow-2xl">
           {pendientes} 
        </span>
      )}

      <Link to="/dashboard/recaptacion">
        <button className="btnstaff">Recaptación</button>
      </Link>
    </motion.div>
  );
}
