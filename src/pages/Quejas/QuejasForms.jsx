/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: Componente formulario para registro de quejas y comentarios con validación de campos y manejo de estados
 *
 *
 *  Tema: Portal de Atención - Formulario de Quejas
 *  Capa: Frontend
 */

import { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaCommentDots,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const QuejasForms = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    queja: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es obligatorio";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido";
    }

    if (!formData.queja.trim()) {
      newErrors.queja = "El comentario es obligatorio";
    } else if (formData.queja.trim().length < 10) {
      newErrors.queja = "El comentario debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    console.log(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Datos del formulario:", formData);
      setFormData({ nombre: "", telefono: "", queja: "" });
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error al enviar:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  const formFields = [
    {
      name: "nombre",
      label: "Nombre completo",
      type: "text",
      icon: FaUser,
      placeholder: "Ingresa tu nombre completo",
      value: formData.nombre,
    },
    {
      name: "telefono",
      label: "Número de teléfono",
      type: "tel",
      icon: FaPhone,
      placeholder: "Ej: +54 9 386 123-4567",
      value: formData.telefono,
    },
    {
      name: "queja",
      label: "Detalle de la queja o comentario",
      type: "textarea",
      icon: FaCommentDots,
      placeholder:
        "Describe tu consulta, queja o sugerencia con el mayor detalle posible...",
      value: formData.queja,
    },
  ];

  return (
    <div className="col-span-1 border-1 px-8 pb-8 bg-white rounded-md">
      <div className="col-span-1" data-aos="zoom-in">
        <h1 className="text-4xl lg:text-5xl mt-10 !text-orange-600 font-bignoodle">
          FORMULARIO DE QUEJAS Y COMENTARIOS
        </h1>
        <p className="text-lg lg:text-xl mt-5 text-gray-600 font-messina">
          Por favor completa todos los campos para que podamos atender tu
          solicitud correctamente.
        </p>

        {/* Mensaje de estado */}
        {submitStatus === "success" && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="font-messina">
              ¡Formulario enviado correctamente! Te contactaremos pronto.
            </span>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-red-600" />
            <span className="font-messina">
              Error al enviar el formulario. Por favor intenta nuevamente.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 gap-6">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="flex items-center gap-2 text-lg font-messina text-gray-700"
                >
                  <field.icon className="text-orange-600" />
                  {field.label}
                  <span className="text-red-500">*</span>
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    className={`w-full p-4 border-2 rounded-lg resize-none transition-all duration-300 font-messina ${
                      errors[field.name]
                        ? "border-red-400 focus:border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-orange-500 focus:bg-orange-50"
                    } focus:outline-none focus:ring-2 focus:ring-orange-200`}
                    rows="5"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={handleInputChange}
                  />
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    className={`w-full p-4 border-2 rounded-lg transition-all duration-300 font-messina ${
                      errors[field.name]
                        ? "border-red-400 focus:border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-orange-500 focus:bg-orange-50"
                    } focus:outline-none focus:ring-2 focus:ring-orange-200`}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={handleInputChange}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-red-500 text-sm font-messina flex items-center gap-1">
                    <FaExclamationTriangle size={12} />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-12 py-4 rounded-lg font-bignoodle text-2xl tracking-widest transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 hover:scale-105 focus:ring-4 focus:ring-orange-200"
              } text-white shadow-lg`}
            >
              {isSubmitting ? "ENVIANDO..." : "ENVIAR FORMULARIO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuejasForms;
