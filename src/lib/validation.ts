export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  mustBeTrue?: boolean;
  custom?: (value: string) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

const siretPattern = /^\d{14}$/;

export const registrationSchema: ValidationSchema = {
  organizationName: {
    required: true,
    minLength: 1,
    maxLength: 255,
  },
  siret: {
    required: true,
    pattern: siretPattern,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  website: {
    maxLength: 255,
  },
  country: {
    maxLength: 100,
  },
  activityDescription: {
    maxLength: 2048,
  },
  termsAccepted: {
    required: true,
    mustBeTrue: true,
  },
};

export const errorMessages: Record<string, string> = {
  required: "This field is required",
  email: "Please enter a valid email address",
  siret: "SIRET must contain exactly 14 digits",
  minLength: "This field is too short",
  maxLength: "This field is too long",
  pattern: "Invalid format",
  termsRequired: "You must accept the terms and conditions",
};

export function validateField(
  value: unknown,
  rules: ValidationRule,
): string | null {
  if (rules.mustBeTrue) {
    return value === true ? null : errorMessages.termsRequired;
  }

  const normalized =
    typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
  const isEmpty = normalized.trim() === "";

  if (rules.required && isEmpty) {
    return errorMessages.required;
  }

  if (!rules.required && isEmpty) {
    return null;
  }

  if (rules.minLength && normalized.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }

  if (rules.maxLength && normalized.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }

  if (rules.pattern && !rules.pattern.test(normalized)) {
    if (rules.pattern === siretPattern) {
      return errorMessages.siret;
    }
    if (rules.pattern.toString().includes("@")) {
      return errorMessages.email;
    }
    return errorMessages.pattern;
  }

  if (rules.custom && !rules.custom(normalized)) {
    return errorMessages.pattern;
  }

  return null;
}

export function validateForm(
  data: Record<string, unknown>,
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
