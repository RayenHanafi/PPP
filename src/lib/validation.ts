export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  mustBeTrue?: boolean;
  custom?: (value: any) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const registrationSchema: ValidationSchema = {
  organizationName: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  siret: {
    required: true,
    pattern: /^[0-9A-Za-z\-]+$/,
    minLength: 5,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  website: {
    required: true,
    pattern: /^https?:\/\/.+/,
  },
  country: {
    required: true,
  },
  activityDescription: {
    required: true,
    minLength: 50,
    maxLength: 1000,
  },
  termsAccepted: {
    required: true,
    mustBeTrue: true,
  },
};

export const errorMessages: Record<string, string> = {
  required: "This field is required",
  email: "Please enter a valid email address",
  url: "Please enter a valid URL starting with http:// or https://",
  minLength: "This field is too short",
  maxLength: "This field is too long",
  pattern: "Invalid format",
  termsRequired: "You must accept the terms and conditions",
};

export function validateField(
  value: any,
  rules: ValidationRule,
): string | null {
  if (rules.required && (!value || value.toString().trim() === "")) {
    return errorMessages.required;
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    if (rules.pattern.toString().includes("@")) {
      return errorMessages.email;
    }
    if (rules.pattern.toString().includes("http")) {
      return errorMessages.url;
    }
    return errorMessages.pattern;
  }

  if (rules.mustBeTrue && value !== true) {
    return errorMessages.termsRequired;
  }

  if (rules.custom && !rules.custom(value)) {
    return errorMessages.pattern;
  }

  return null;
}

export function validateForm(
  data: Record<string, any>,
  schema: ValidationSchema,
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach((field) => {
    const error = validateField(data[field], schema[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}
