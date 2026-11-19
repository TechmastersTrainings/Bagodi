import React, { useState, useCallback, useRef } from "react";

export interface FieldError {
  message?: string;
  type?: string;
}

export type FieldErrors<T = any> = {
  [K in keyof T]?: FieldError;
};

export interface UseFormOptions<T extends Record<string, any>> {
  resolver?: (values: T) => { values: T; errors: FieldErrors<T> } | Promise<{ values: T; errors: FieldErrors<T> }>;
  defaultValues?: Partial<T>;
}

export interface UseFormReturn<T extends Record<string, any>> {
  register: (name: keyof T, options?: any) => {
    name: string;
    value?: any;
    checked?: boolean;
    onChange: (e: any) => void;
    onBlur: (e: any) => void;
  };
  handleSubmit: (
    onValid: (data: T) => void | Promise<any>,
    onInvalid?: (errors: FieldErrors<T>) => void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  formState: {
    errors: FieldErrors<T>;
    isSubmitting: boolean;
    isValid?: boolean;
    isDirty?: boolean;
  };
  reset: (values?: Partial<T>) => void;
  setValue: (name: keyof T, value: any) => void;
  getValues: (name?: keyof T) => any;
  watch: (name?: keyof T) => any;
}

export function useForm<T extends Record<string, any> = Record<string, any>>(
  options?: UseFormOptions<T>
): UseFormReturn<T> {
  const initialValues = (options?.defaultValues || {}) as T;
  const [values, setValues] = useState<T>(initialValues);
  const valuesRef = useRef<T>(initialValues);
  valuesRef.current = values;

  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      valuesRef.current = next;
      return next;
    });
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const register = useCallback(
    (name: keyof T) => {
      const val = values[name];
      const isBool = typeof val === "boolean";
      return {
        name: String(name),
        ...(isBool ? { checked: Boolean(val) } : { value: val !== undefined ? val : "" }),
        onChange: (e: any) => {
          let v: any = e;
          if (e && e.target) {
            v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
          }
          setValue(name, v);
        },
        onBlur: () => {},
      };
    },
    [values, setValue]
  );

  const handleSubmit = useCallback(
    (
      onValid: (data: T) => void | Promise<any>,
      onInvalid?: (errors: FieldErrors<T>) => void
    ) => {
      return async (e?: React.BaseSyntheticEvent) => {
        if (e && typeof e.preventDefault === "function") {
          e.preventDefault();
        }
        setIsSubmitting(true);
        try {
          const currentValues = valuesRef.current;
          if (options?.resolver) {
            const res = await options.resolver(currentValues);
            if (res.errors && Object.keys(res.errors).length > 0) {
              setErrors(res.errors);
              if (onInvalid) {
                onInvalid(res.errors);
              }
              setIsSubmitting(false);
              return;
            }
            setErrors({});
            await onValid(res.values || currentValues);
          } else {
            setErrors({});
            await onValid(currentValues);
          }
        } catch (err) {
          console.error("Form submit error:", err);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [options]
  );

  const reset = useCallback(
    (newValues?: Partial<T>) => {
      const next = (newValues || options?.defaultValues || {}) as T;
      setValues(next);
      valuesRef.current = next;
      setErrors({});
    },
    [options?.defaultValues]
  );

  const getValues = useCallback(
    (name?: keyof T) => {
      return name ? valuesRef.current[name] : valuesRef.current;
    },
    []
  );

  const watch = useCallback(
    (name?: keyof T) => {
      return name ? values[name] : values;
    },
    [values]
  );

  return {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isValid: Object.keys(errors).length === 0,
    },
    reset,
    setValue,
    getValues,
    watch,
  };
}

export function zodResolver<SchemaType extends any>(schema: SchemaType) {
  return async (values: any): Promise<{ values: any; errors: Record<string, { message: string; type: string }> }> => {
    try {
      if (typeof (schema as any)?.safeParseAsync === "function") {
        const result = await (schema as any).safeParseAsync(values);
        if (result.success) {
          return { values: result.data, errors: {} };
        }
        const errors: Record<string, { message: string; type: string }> = {};
        for (const issue of result.error?.issues || []) {
          const field = issue.path && issue.path[0] ? String(issue.path[0]) : "root";
          if (!errors[field]) {
            errors[field] = { message: issue.message, type: issue.code || "custom" };
          }
        }
        return { values, errors };
      }
      return { values, errors: {} };
    } catch (err: any) {
      return { values, errors: { root: { message: err?.message || "Validation failed", type: "custom" } } };
    }
  };
}

