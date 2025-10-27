import React from "react";
import { useState, useEffect } from "react";
import sweetalert2 from "sweetalert2";

const FormAltaUserPilates = ({
  isOpen,
  onClose,
  instructor,
  setSelectedInstructor,
  sedesDisponibles,
  obtenerUsuariosPilates,
}) => {
  const [form, setForm] = useState({
    nombre: instructor ? instructor.nombre : "",
    apellido: instructor ? instructor.apellido : "",
    telefono: instructor ? instructor.telefono : "",
    email: instructor ? instructor.email : "",
    password: "",
    repeatPassword: "",
    estado: instructor ? instructor.estado : "activo",
    rol: instructor ? instructor.rol : "Instructor",
    sede_id: instructor ? instructor.sede_id : "",
  });

  useEffect(() => {
    if (sedesDisponibles.length > 0 && !form.sede_id) {
      setForm((prevForm) => ({ ...prevForm, sede_id: sedesDisponibles[0].id }));
    }
  }, [sedesDisponibles]);

  useEffect(() => {
    if (instructor) {
      setForm({
        nombre: instructor.nombre,
        apellido: instructor.apellido,
        telefono: instructor.telefono,
        email: instructor.email,
        password: instructor.password,
        repeatPassword: instructor.password,
        estado: instructor.estado,
        rol: instructor.rol,
        sede_id: instructor.sede_id,
      });
    } else {
      setForm({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        password: "",
        repeatPassword: "",
        estado: "activo",
        rol: "Instructor",
        sede_id: "",
      });
    }
  }, [instructor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = instructor
      ? `http://localhost:8080/usuarios-pilates/${instructor.id}`
      : "http://localhost:8080/usuarios-pilates";
    const method = instructor ? "PUT" : "POST";

    if (form.password !== form.repeatPassword) {
      sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
      });
      return;
    }

    // Confirmación solo si es modificación
    if (instructor) {
      const confirmacion = await sweetalert2.fire({
        title: "¿Confirmar cambios?",
        text: "¿Seguro que desea modificar este instructor?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#7c3aed",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, modificar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      const respuesta = await fetch(url, {
        method,
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      if (!respuesta.ok) throw new Error("Error en la solicitud");

      await sweetalert2.fire({
        icon: "success",
        title: instructor ? "Cambios realizados" : "Se ha ingresado con éxito",
        showConfirmButton: false,
        timer: 1500,
      });

      onClose();
      setSelectedInstructor(null);
      setForm({
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        password: "",
        repeatPassword: "",
        estado: "activo",
        rol: "Instructor",
        sede_id: "",
      });
      await obtenerUsuariosPilates();
    } catch (error) {
      sweetalert2.fire({
        icon: "error",
        title: "Error",
        text: "Se ha producido un error. Intente nuevamente.",
      });
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-violet-700">
          {instructor ? "Modificar Instructor" : "Nuevo Instructor"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Apellido"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            type="password"
            className="w-full p-2 border rounded"
            required={!instructor}
          />
          <input
            name="repeatPassword"
            value={form.repeatPassword}
            onChange={handleChange}
            placeholder="Repetir contraseña"
            type="password"
            className="w-full p-2 border rounded"
            required={!instructor}
          />
          <select
            name="sede_id"
            value={form.sede_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            {sedesDisponibles.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-violet-700 text-white hover:bg-violet-800"
            >
              {instructor ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAltaUserPilates;
