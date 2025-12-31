import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, ArrowRight, Leaf } from 'lucide-react';
import { z } from 'zod';

const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
});

interface RegistrationFormProps {
  onSubmit: (name: string, email: string) => void;
}

const RegistrationForm = ({ onSubmit }: RegistrationFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validated = registrationSchema.parse({ name, email });
      onSubmit(validated.name, validated.email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { name?: string; email?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'name') fieldErrors.name = err.message;
          if (err.path[0] === 'email') fieldErrors.email = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 text-center border-b border-border/50">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce-in">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Welcome to Farm Vaidya
        </h2>
        <p className="text-sm text-muted-foreground">
          Your AI-powered agricultural assistant
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col justify-center">
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Please introduce yourself to get started
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive animate-fade-in">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Starting...'
          ) : (
            <>
              Start Chat
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By continuing, you agree to receive support from our AI assistant.
        </p>
      </form>
    </div>
  );
};

export default RegistrationForm;
