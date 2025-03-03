import { Field } from 'formik';
import Alerta from './Error'; // Asegúrate de importar correctamente el componente de alerta

const SelectSede = ({ setFieldValue, errors, touched }) => {
  return (
    <div className="mb-4 px-6">
      <Field
        as="select"
        id="sede"
        name="sede"
        className="form-select mt-2 block w-full p-4 text-black bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        onChange={(e) => {
          setFieldValue('sede', e.target.value);
          // setVisible(e.target.value === 'Multisede');
        }}
      >
        <option value="" disabled>
          Sede:
        </option>
        <option value="Multisede">Multi Sede</option>
        <option value="SMT">SMT</option>
        <option value="Monteros">Monteros</option>
        <option value="Concepción">Concepción</option>
      </Field>
      {errors.sede && touched.sede ? <Alerta>{errors.sede}</Alerta> : null}
    </div>
  );
};

export default SelectSede;
