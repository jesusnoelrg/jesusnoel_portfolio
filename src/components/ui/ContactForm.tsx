// src/components/ContactForm.tsx
import { useState, type FormEvent, type ChangeEvent } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';

import { Send } from 'lucide-react';

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface FieldForm {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [openModal, setOpenModal] = useState(false);
  const [result, setResult] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<FieldForm>({});

  const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  const cleanForm = (): FieldForm => {
    const formCleaned: FieldForm = {}

    formCleaned.name = "";
    formCleaned.email = "";
    formCleaned.message = "";

    return formCleaned
  }

  const validateForm = (formData: FormData): FieldErrors => {
    const newErrors: FieldErrors = {};

    const name = (formData.get('name') || '') as string;
    const email = (formData.get('email') || '') as string;
    const message = (formData.get('message') || '') as string;

    if(!name || (name.length < 3 || name.length > 50)) newErrors.name = "El nombre debe tener mínimo 3 caracteres y como máximo 50.";
    if(!email){
      newErrors.email = "El campo se encuentra vacio ingrese un email"
    }else if(!validateEmail(email)) {
      newErrors.email = "Has ingresado un email inválido."
    }
    if(!message || (message.length < 3 || message.length > 500)) newErrors.message = "El mensaje debe tener mínimo 3 caracteres y como máximo 500.";

    return newErrors;
  }

  const onSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);

    const validateErr = validateForm(formData);

    if(Object.keys(validateErr).length > 0){
      setErrors(validateErr)
      return;
    }

    formData.append("access_key", "e0ac6382-f33a-4d98-94f1-2873251bb2d3");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if(data.success) setOpenModal(true);
    setForm(cleanForm);
    setResult(data.success ? "Success!" : "Error");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> ) => {
    const {name, value} = event.target;

    if(name in errors && errors[name as keyof FieldErrors]){
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setForm(prev => ({...prev, [name]: value }))
  }

  return (
    <form onSubmit={onSubmit} className="w-1/2 p-10 flex flex-col items-center justify-center">
      
      <Input 
        className="w-70 sm:w-100" 
        label="Nombre" type="text" name="name"
        required={false}
        value={form.name}
        onChange={handleChange}
      />
      {errors.name as string ? 
        <p className="text-red-400 text-[12px] text-left mb-1">{errors.name}</p> 
        : 
        <p className='mb-5.25'></p>}
      
      <Input 
        className="w-70 sm:w-100" 
        label="E-Mail" type="email" name="email"
        labelClass="mt-3"
        required={false}
        value={form.email}
        onChange={handleChange}
       />
      {errors.email as string ? 
        <p className="text-red-400 text-[12px] text-left mb-1">{errors.email}</p> 
        : 
        <p className='mb-5.25'></p>}
       
      <TextArea 
        label="Mensaje"
        labelClass="mt-3"
        name="message" 
        minLength={5} maxLength={500} rows={5} 
        required={false}
        value={form.message}
        onChange={handleChange}
        className='w-70 sm:w-100'
       />
      {errors.message as string ? 
        <p className="text-red-400 text-[12px] text-left mb-1">{errors.message}</p> 
        : 
        <p className='mb-5.25'></p>}

      <Button text="Enviar" type="submit" className="w-50">
        <Send className="w-4 h-4" /> Enviar
      </Button>
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)} title="Mensaje enviado" size='sm'>
        <p className="text-center p-5">¡Su mensaje ha sido enviado con éxito!</p>
        <div className='flex justify-center'>
          <button onClick={() => setOpenModal(false)}
            className='bg-zinc-700/40 hover:bg-zinc-500/40 transition-colors duration-300 px-4 py-2 rounded-md'>Aceptar</button>
        </div>
      </Modal>
    </form>
  );
}   