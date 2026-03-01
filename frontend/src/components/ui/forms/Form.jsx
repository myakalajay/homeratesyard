import React from 'react';
import { FormProvider } from 'react-hook-form';
import { cn } from '@/utils/utils';

/**
 * @component Form
 * @description A wrapper around react-hook-form's FormProvider.
 * Pass the methods returned from useForm() to this component.
 */
const Form = ({ methods, children, className, onSubmit, ...props }) => {
  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={methods.handleSubmit(onSubmit)} 
        className={cn("space-y-6", className)} 
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;