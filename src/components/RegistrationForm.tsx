import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
} from "lucide-react";
import { FormInput } from "./FormInput";
import { FormTextarea } from "./FormTextarea";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckbox";
import { SuccessMessage } from "./SuccessMessage";
import { validateField, registrationSchema } from "../lib/validation";
import { countries } from "../lib/countries";
import { publicApi } from "../services";

interface FormData {
  organizationName: string;
  siret: string;
  email: string;
  website: string;
  country: string;
  activityDescription: string;
  termsAccepted: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    siret: "",
    email: "",
    website: "",
    country: "",
    activityDescription: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const error = validateField(formData[field], registrationSchema[field]);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );
    setTouched(allTouched);

    // Validate all fields
    const newErrors: FormErrors = {};
    Object.keys(registrationSchema).forEach((field) => {
      const error = validateField(
        formData[field as keyof FormData],
        registrationSchema[field],
      );
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await publicApi.registerOrganisation({
        name: formData.organizationName.trim(),
        siret: formData.siret.trim(),
        email: formData.email.trim(),
        website: formData.website.trim() || null,
        description: formData.activityDescription.trim() || null,
        country: formData.country || null,
      });

      setSubmissionSuccess(true);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setServerError(caughtError.message);
      } else {
        setServerError("Network error. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnHome = () => {
    window.location.href = "/";
  };

  if (submissionSuccess) {
    return (
      <SuccessMessage email={formData.email} onReturnHome={handleReturnHome} />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="bg-[#100A36] border border-[#2A1673]/30 rounded-2xl p-8 md:p-12"
      >
        {serverError && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#EF4444] font-medium">Submission Error</p>
              <p className="text-[#EF4444]/80 text-sm mt-1">{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormInput
            label="Legal Organization Name"
            name="organizationName"
            value={formData.organizationName}
            onChange={(value) => handleChange("organizationName", value)}
            onBlur={() => handleBlur("organizationName")}
            error={
              touched.organizationName ? errors.organizationName : undefined
            }
            helpText="Your company's official legal name"
            placeholder="e.g., Acme Cybersecurity Inc."
            required
            icon={Building}
            isValid={
              !errors.organizationName && formData.organizationName.trim().length >= 1
            }
          />

          <FormInput
            label="SIRET (14 digits)"
            name="siret"
            value={formData.siret}
            onChange={(value) => handleChange("siret", value)}
            onBlur={() => handleBlur("siret")}
            error={touched.siret ? errors.siret : undefined}
            helpText="Required. Must contain exactly 14 digits."
            placeholder="14-digit SIRET (e.g., 12345678901234)"
            required
            icon={FileText}
            isValid={!errors.siret && /^\d{14}$/.test(formData.siret)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormInput
            label="Contact Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            helpText="Approval updates and contributor access instructions will be sent to this address"
            placeholder="security@yourcompany.com"
            required
            icon={Mail}
            isValid={!errors.email && formData.email.includes("@")}
          />

          <FormInput
            label="Company Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={(value) => handleChange("website", value)}
            onBlur={() => handleBlur("website")}
            error={touched.website ? errors.website : undefined}
            helpText="Optional. If provided, maximum 255 characters."
            placeholder="https://www.yourcompany.com"
            icon={Globe}
            isValid={!errors.website && formData.website.length > 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormSelect
            label="Country / Region"
            name="country"
            value={formData.country}
            onChange={(value) => handleChange("country", value)}
            onBlur={() => handleBlur("country")}
            error={touched.country ? errors.country : undefined}
            helpText="Optional."
            placeholder="Select your country"
            options={countries}
            icon={MapPin}
            isValid={!errors.country && !!formData.country}
          />
        </div>

        <div className="mb-6">
          <FormTextarea
            label="Security Activity Description"
            name="activityDescription"
            value={formData.activityDescription}
            onChange={(value) => handleChange("activityDescription", value)}
            onBlur={() => handleBlur("activityDescription")}
            error={
              touched.activityDescription
                ? errors.activityDescription
                : undefined
            }
            helpText="Optional. If provided, maximum 2048 characters."
            placeholder="Describe your organization's cybersecurity activities and why you want to contribute to ThreatChain..."
            rows={6}
            maxLength={2048}
            showCharCount
            isValid={
              !errors.activityDescription &&
              formData.activityDescription.length > 0
            }
          />
        </div>

        <div className="mb-8">
          <FormCheckbox
            label={
              <span>
                I agree to the{" "}
                <a
                  href="#"
                  className="text-[#4A3CC9] hover:text-[#5A49DA] underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#4A3CC9] hover:text-[#5A49DA] underline"
                >
                  Privacy Policy
                </a>
              </span>
            }
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={(value) => handleChange("termsAccepted", value)}
            error={touched.termsAccepted ? errors.termsAccepted : undefined}
            required
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-4 bg-[#4A3CC9] text-white font-semibold rounded-lg
              hover:bg-[#5A49DA] hover:shadow-lg hover:shadow-[#4A3CC9]/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 hover:scale-105
              flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
