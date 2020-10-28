import { useState } from 'react';

export const useFormValues = (initialValue = {}) => {
  const [values, setValues] = useState(initialValue);

  const handleChange = (e) => {
    e.persist();
    setValues(values => ({ ...values,
      [e.target.name]: e.target.type === 'number' ?
      parseInt(e.target.value) :
      e.target.value }));
  };

  return {
    handleChange,
    values,
    setValues,
  };
};

