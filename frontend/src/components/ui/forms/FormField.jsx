import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Label from './Label';
import ErrorMessage from './ErrorMessage';
import HelperText from './HelperText';
import { cn } from '@/utils/utils';

/**
 * @component FormField
 * @description Smart wrapper that handles Label, Input, Error, and Description wiring.
 */
const FormField = ({ 
  name, 
  label, 
  helperText, 
  required, 
  className, 
  render, 
  control: explicitControl // Optional: allow passing control explicitly
}) => {
  const { control: contextControl } = useFormContext() || {};
  const control = explicitControl || contextControl;

  if (!control) {
    console.error(`[FormField] Missing 'control'. Ensure this component is inside a <Form> or pass 'control' prop.`);
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className={cn("w-full", className)}>
          {label && (
            <div className="mb-2">
              <Label htmlFor={name} required={required}>
                {label}
              </Label>
            </div>
          )}
          
          {/* Render the actual input, passing field props (onChange, onBlur, value, ref) */}
          {render({ ...field, error })}

          {helperText && !error && <HelperText>{helperText}</HelperText>}
          <ErrorMessage error={error} />
        </div>
      )}
    />
  );
};

export default FormField;